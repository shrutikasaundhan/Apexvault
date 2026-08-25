import mongoose, { Types } from "mongoose";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import Session from "../models/sessionModel.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import { sendOtpService } from "../services/sendOtpService.js";
import redisClient from "../config/redis.js";
import { otpSchema } from "../validators/authSchema.js";

export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resData = await sendOtpService(email);
    res.status(201).json(resData);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { success, data, error } = otpSchema.safeParse(req.body);

    if (!success) {
      console.log(error.flatten().fieldErrors);
      return res.status(400)
        .json({ error: "Invaild OTP" })
    }

    console.log(req.body);
    console.log(data);
    const { email, otp } = data;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or Expired OTP!" });
    }

    // Check if OTP is older than 60 seconds
    const otpAgeInMs = Date.now() - new Date(otpRecord.createdAt).getTime();
    if (otpAgeInMs > 60 * 1000) {
      await otpRecord.deleteOne();
      return res.status(400).json({ error: "Invalid or Expired OTP!" });
    }

    return res.json({ message: "OTP Verified!" });
  } catch (err) {
    next(err);
  }
};

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const userData = await verifyIdToken(idToken);
    const { name, email, picture, sub } = userData;
    const user = await User.findOne({ email }).select("-__v");
    if (user) {
      if (user.deleted) {
        return res.status(403).json({
          error: "Your account has been deleted. Contact app owner to recover.",
        });
      }

      const allSessions = await redisClient.ft.search(
        "userIdIdx",
        `@userId:{${user.id}}`,
        {
          RETURN: [],
        }
      );

      if (allSessions.total >= 2) {
        await redisClient.del(allSessions.documents[0].id);
      }

      if (!user.picture || !user.picture.includes("googleusercontent.com")) {
        user.picture = picture;
        await user.save();
      }

      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await redisClient.json.set(redisKey, "$", {
        userId: user._id,
        rootDirId: user.rootDirId,
      });

      const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
      await redisClient.expire(redisKey, sessionExpiryTime / 1000);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionExpiryTime,
      });

      return res.json({ message: "logged in" });
    }

    const mongooseSession = await mongoose.startSession();

    try {
      const rootDirId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      mongooseSession.startTransaction();

      await Directory.create(
        [
          {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          },
        ],
        { session: mongooseSession }
      );

      await User.create(
        [
          {
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
          },
        ],
        { session: mongooseSession }
      );

      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await redisClient.json.set(redisKey, "$", {
        userId: userId,
        rootDirId: rootDirId,
      });

      const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
      await redisClient.expire(redisKey, sessionExpiryTime / 1000);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionExpiryTime,
      });

      await mongooseSession.commitTransaction();
      res.status(201).json({ message: "account created and logged in" });
    } catch (err) {
      try {
        await mongooseSession.abortTransaction();
      } catch (e) {}

      if (err.code === 20 || err.message.includes("Transaction numbers")) {
        try {
          const rootDirId = new Types.ObjectId();
          const userId = new Types.ObjectId();
          await Directory.create({
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          });
          await User.create({
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
          });

          const sessionId = crypto.randomUUID();
          const redisKey = `session:${sessionId}`;
          await redisClient.json.set(redisKey, "$", {
            userId: userId,
            rootDirId: rootDirId,
          });

          const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
          await redisClient.expire(redisKey, sessionExpiryTime / 1000);

          res.cookie("sid", sessionId, {
            httpOnly: true,
            signed: true,
            maxAge: sessionExpiryTime,
          });

          return res.status(201).json({ message: "account created and logged in" });
        } catch (retryErr) {
          err = retryErr;
        }
      }
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export const loginWithGithub = async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code parameter is required." });
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || "GitHub authentication failed." });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: "Access token not found in GitHub response." });
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ApexVault-Auth",
      },
    });

    const githubUser = await userResponse.json();
    if (!githubUser.id) {
      return res.status(400).json({ error: "Failed to retrieve GitHub user profile." });
    }

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ApexVault-Auth",
      },
    });

    let email = githubUser.email;
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmailObj = emails.find((e) => e.primary && e.verified);
      if (primaryEmailObj) {
        email = primaryEmailObj.email;
      } else if (emails.length > 0) {
        email = emails[0].email;
      }
    }

    if (!email) {
      return res.status(400).json({ error: "Your GitHub account must have a verified email address." });
    }

    const name = githubUser.name || githubUser.login;
    const picture = githubUser.avatar_url;

    const user = await User.findOne({ email }).select("-__v");
    if (user) {
      if (user.deleted) {
        return res.status(403).json({
          error: "Your account has been deleted. Contact app owner to recover.",
        });
      }

      const allSessions = await redisClient.ft.search(
        "userIdIdx",
        `@userId:{${user.id}}`,
        {
          RETURN: [],
        }
      );

      if (allSessions.total >= 2) {
        await redisClient.del(allSessions.documents[0].id);
      }

      if (user.picture && (user.picture.includes("vecteezy.com") || user.picture.includes("githubusercontent.com"))) {
        user.picture = picture;
        await user.save();
      }

      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await redisClient.json.set(redisKey, "$", {
        userId: user._id,
        rootDirId: user.rootDirId,
      });

      const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
      await redisClient.expire(redisKey, sessionExpiryTime / 1000);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionExpiryTime,
      });

      return res.json({ message: "logged in" });
    }

    const mongooseSession = await mongoose.startSession();
    try {
      const rootDirId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      mongooseSession.startTransaction();

      await Directory.create(
        [
          {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          },
        ],
        { session: mongooseSession }
      );

      await User.create(
        [
          {
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
          },
        ],
        { session: mongooseSession }
      );

      const sessionId = crypto.randomUUID();
      const redisKey = `session:${sessionId}`;
      await redisClient.json.set(redisKey, "$", {
        userId: userId,
        rootDirId: rootDirId,
      });

      const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
      await redisClient.expire(redisKey, sessionExpiryTime / 1000);

      res.cookie("sid", sessionId, {
        httpOnly: true,
        signed: true,
        maxAge: sessionExpiryTime,
      });

      await mongooseSession.commitTransaction();
      res.status(201).json({ message: "account created and logged in" });
    } catch (err) {
      try {
        await mongooseSession.abortTransaction();
      } catch (e) {}

      if (err.code === 20 || err.message.includes("Transaction numbers")) {
        try {
          const rootDirId = new Types.ObjectId();
          const userId = new Types.ObjectId();
          await Directory.create({
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          });
          await User.create({
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
          });

          const sessionId = crypto.randomUUID();
          const redisKey = `session:${sessionId}`;
          await redisClient.json.set(redisKey, "$", {
            userId: userId,
            rootDirId: rootDirId,
          });

          const sessionExpiryTime = 60 * 1000 * 60 * 24 * 7;
          await redisClient.expire(redisKey, sessionExpiryTime / 1000);

          res.cookie("sid", sessionId, {
            httpOnly: true,
            signed: true,
            maxAge: sessionExpiryTime,
          });

          return res.status(201).json({ message: "account created and logged in" });
        } catch (retryErr) {
          err = retryErr;
        }
      }
      return next(err);
    }
  } catch (err) {
    next(err);
  }
};
