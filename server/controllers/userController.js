import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import File from "../models/fileModel.js";
import OTP from "../models/otpModel.js";
import redisClient from "../config/redis.js";
import { createGetSignedUrl } from "../config/s3.js";
import { registerSchema, loginSchema } from "../validators/authSchema.js";

export const register = async (req, res, next) => {
  try {
    const { success, data, error } = registerSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: "Invalid input, please enter valid details" });
    }

    const { name, email, password, otp } = data;
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

    await otpRecord.deleteOne();

    const session = await mongoose.startSession();

    try {
      const rootDirId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      session.startTransaction();

      await Directory.create(
        [
          {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
          },
        ],
        { session }
      );

      await User.create(
        [
          {
            _id: userId,
            name,
            email,
            password,
            rootDirId,
          },
        ],
        { session }
      );

      session.commitTransaction();

      res.status(201).json({ message: "User Registered" });
    } catch (err) {
      try {
        await session.abortTransaction();
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
            password,
            rootDirId,
          });
          return res.status(201).json({ message: "User Registered" });
        } catch (retryErr) {
          err = retryErr;
        }
      }

      console.log(err);
      if (err.code === 121) {
        res
          .status(400)
          .json({ error: "Invalid input, please enter valid details" });
      } else if (err.code === 11000) {
        if (err.keyValue.email) {
          return res.status(409).json({
            error: "This email already exists",
            message:
              "A user with this email address already exists. Please try logging in or use a different email.",
          });
        }
      } else {
        next(err);
      }
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { success, data, error } = loginSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const { email, password } = data;
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    if (user.deleted) {
      return res.status(403).json({ error: "Your account has been deleted. Please contact administration." });
    }

    try {
      const allSessions = await redisClient.ft.search(
        "userIdIdx",
        `@userId:{${user.id}}`,
        {
          RETURN: [],
        }
      );

      if (allSessions && allSessions.total >= 2) {
        await redisClient.del(allSessions.documents[0].id);
      }
    } catch (searchErr) {
      console.warn("Session search skipped:", searchErr?.message);
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
      sameSite: "none",
      secure: true,
    });
    res.json({ message: "logged in" });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().lean();
    
    // Get logged in user IDs from Redis
    const sessionKeys = await redisClient.keys("session:*");
    const loggedInUserIds = new Set();
    for (const key of sessionKeys) {
      const sessionData = await redisClient.json.get(key);
      if (sessionData && sessionData.userId) {
        loggedInUserIds.add(sessionData.userId.toString());
      }
    }

    // Compute storage sizes in bulk to prevent N+1 query performance problems
    const rootDirIds = allUsers.map((u) => u.rootDirId).filter(Boolean);
    const rootDirs = await Directory.find({ _id: { $in: rootDirIds } }).lean();
    const dirSizeMap = new Map(rootDirs.map((d) => [d._id.toString(), d.size || 0]));

    const transformedUsers = allUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "User",
      picture: user.picture,
      maxStorageInBytes: user.maxStorageInBytes || 1 * (1024 ** 3),
      usedStorageInBytes: user.rootDirId ? (dirSizeMap.get(user.rootDirId.toString()) || 0) : 0,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
      deleted: user.deleted || false,
    }));

    res.status(200).json(transformedUsers);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }
  const rootDir = await Directory.findById(user.rootDirId).lean();
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    maxStorageInBytes: user.maxStorageInBytes || 1 * (1024 ** 3),
    usedStorageInBytes: rootDir ? rootDir.size : 0,
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`session:${sid}`);
  res.clearCookie("sid", { sameSite: "none", secure: true });
  res.status(204).end();
};

export const logoutById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Find all sessions in Redis for this user and delete them
    const sessionKeys = await redisClient.keys("session:*");
    for (const key of sessionKeys) {
      const sessionData = await redisClient.json.get(key);
      if (sessionData && sessionData.userId && sessionData.userId.toString() === userId.toString()) {
        await redisClient.del(key);
      }
    }
    // Also clean up MongoDB sessions just in case
    await Session.deleteMany({ userId });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const updateUserByAdmin = async (req, res, next) => {
  const { userId } = req.params;
  const { name, email, role, maxStorageInBytes, deleted } = req.body;

  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if modifying own role to avoid lockout
    if (req.user._id.toString() === userId && role && role !== userToUpdate.role) {
      return res.status(403).json({ error: "You cannot change your own role to prevent system lockout." });
    }

    // Prepare updates
    const updates = {};
    if (name !== undefined) {
      if (name.trim().length < 3) {
        return res.status(400).json({ error: "Name must be at least 3 characters long" });
      }
      updates.name = name;
    }
    if (email !== undefined) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ error: "A user with this email address already exists" });
      }
      updates.email = email;
    }
    if (role !== undefined) {
      if (!["Admin", "Manager", "User"].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }
      updates.role = role;
    }
    if (maxStorageInBytes !== undefined) {
      const parsedBytes = parseInt(maxStorageInBytes, 10);
      if (isNaN(parsedBytes) || parsedBytes < 0) {
        return res.status(400).json({ error: "Invalid storage limit" });
      }
      updates.maxStorageInBytes = parsedBytes;
    }
    if (deleted !== undefined) {
      updates.deleted = !!deleted;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      maxStorageInBytes: updatedUser.maxStorageInBytes,
      deleted: updatedUser.deleted,
    });
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  try {
    const session = await redisClient.json.get(`session:${sid}`);
    if (session && session.userId) {
      const allSessions = await redisClient.ft.search(
        "userIdIdx",
        `@userId:{${session.userId}}`,
        {
          RETURN: [],
        }
      );
      if (allSessions && allSessions.documents) {
        await redisClient.del(allSessions.documents.map(({ id }) => id));
      }
    }
  } catch (err) {
    console.warn("logoutAll error handled:", err.message);
  }
  res.clearCookie("sid", { sameSite: "none", secure: true });
  res.status(204).end();
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return res.status(403).json({ error: "You can not delete yourself." });
  }
  try {
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { deleted: true });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getGuestSharedFile = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 1. Check if it's a file
    const fileData = await File.findOne({ _id: id }).lean();
    if (fileData) {
      if (!fileData.isShared) {
        return res.status(403).json({ error: "This file is not publicly shared." });
      }
      
      let downloadUrl = "";
      try {
        downloadUrl = await createGetSignedUrl({
          key: `${fileData._id.toString()}${fileData.extension}`,
          download: true,
          filename: fileData.name
        });
      } catch (err) {
        console.error("Error generating signed S3 URL:", err);
      }
      
      return res.status(200).json({
        type: "file",
        name: fileData.name,
        size: fileData.size,
        extension: fileData.extension,
        downloadUrl
      });
    }

    // 2. Check if it's a directory
    const dirData = await Directory.findOne({ _id: id }).lean();
    if (dirData) {
      if (!dirData.isShared) {
        return res.status(403).json({ error: "This folder is not publicly shared." });
      }
      
      const files = await File.find({ parentDirId: dirData._id }).lean();
      const directories = await Directory.find({ parentDirId: id }).lean();
      
      return res.status(200).json({
        type: "directory",
        name: dirData.name,
        files: files.map(f => ({ ...f, id: f._id })),
        directories: directories.map(d => ({ ...d, id: d._id }))
      });
    }

    return res.status(404).json({ error: "Shared item not found!" });
  } catch (err) {
    next(err);
  }
};
