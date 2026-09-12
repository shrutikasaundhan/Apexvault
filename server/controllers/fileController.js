import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import {
  createdUploadSignedUrl,
  createGetSignedUrl,
  getS3FileMetaData,
  deleteS3File,
} from "../config/s3.js";
import { createCloudFrontGetSignedUrl } from "../services/cloudfront.js";


export async function updateDirectoriesSize(parentId, deltasize) {


  while (parentId) {
    const Dir = await Directory.findById(parentId);
    Dir.size += deltasize;
    await Dir.save();
    parentId = Dir.parentDirId
  }
}
export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const filesize = req.headers.filesize;


    if (filesize > 50 * 1024 * 1024) {
      console.log("file is too large");
      res.header("connected", "close");
      return res.socket.destroy();
      // return res.status(413).json({error:"File too large so 50 is enough"})
      // return res.end();
    }
    console.log(filesize);
    const extension = path.extname(filename);

    const insertedFile = await File.create({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });

    const fileId = insertedFile.id;

    const fullFileName = `${fileId}${extension}`;
    const filePath = `./storage/${fullFileName}`

    const writeStream = createWriteStream(filePath);
    req.pipe(writeStream);


    let totalFileSize = 0;
    let aborted = false;
    req.on('data', async (chunk) => {
      if (aborted) return;
      totalFileSize += chunk.length;
      if (totalFileSize > filesize) {
        console.log("object");
        aborted = true;
        writeStream.close();


        await insertedFile.deleteOne();
        await rm(filePath);

        writeStream.close();
        return req.destroy();
      }
      writeStream.write(chunk);
    })

    req.on("end", () => {
      console.log({ filesize });
      console.log({ totalFileSize });
    })

    req.on("end", async () => {
      await updateDirectoriesSize(parentDirId, totalFileSize)

      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: id };
    if (req.user.role !== "Admin") {
      query.userId = req.user._id;
    }
    const fileData = await File.findOne(query).lean();
    // Check if file exists
    if (!fileData) {
      return res.status(404).json({ error: "File not found!" });
    }

    const fileUrl = createCloudFrontGetSignedUrl({
      key: `${id}${fileData.extension}`,
      download: req.query.action === "download",
      filename: fileData.name,
    });
    return res.redirect(fileUrl);
  } catch (err) {
    console.error("Error retrieving file in getFile:", err);
    return res.status(500).json({ error: "Could not retrieve file" });
  }
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const query = { _id: id };
  if (req.user.role !== "Admin") {
    query.userId = req.user._id;
  }
  const file = await File.findOne(query);

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    if (req.body.newFilename) {
      file.name = req.body.newFilename;
    }
    if (req.body.isShared !== undefined) {
      file.isShared = req.body.isShared;
    }
    await file.save();
    return res.status(200).json({ message: "File updated" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const query = { _id: id };
  if (req.user.role !== "Admin") {
    query.userId = req.user._id;
  }
  const file = await File.findOne(query);

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    try {
      await rm(`./storage/${id}${file.extension}`);
    } catch (rmErr) {
      // Ignore if file doesn't exist locally (uploaded to S3 directly)
    }
    await file.deleteOne();

    await updateDirectoriesSize(file.parentDirId, -file.size);
    await deleteS3File(`${file.id}${file.extension}`);
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAllFiles = async (req, res, next) => {
  try {
    if (req.user.role === "User") {
      return res.status(403).json({ error: "Access denied" });
    }
    // Fetch all files
    const files = await File.find().lean();
    
    // Resolve user details in bulk
    const userIds = files.map((f) => f.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const transformedFiles = files.map((file) => ({
      id: file._id,
      name: file.name,
      size: file.size,
      extension: file.extension,
      isShared: file.isShared || false,
      createdAt: file.createdAt,
      isUploading: file.isUploading || false,
      user: file.userId ? (userMap.get(file.userId.toString()) || { name: "Unknown", email: "unknown@example.com" }) : { name: "Unknown", email: "unknown@example.com" }
    }));

    res.status(200).json(transformedFiles);
  } catch (err) {
    next(err);
  }
};



export const uploadInitiate = async (req, res) => {
  const parentDirId = req.body.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.body.name || "untitled";
    const filesize = req.body.size;


    if (filesize > 50 * 1024 * 1024) {
      console.log("file is too large");
      res.header("connected", "close");
      return res.status(507).json({ error: "Not enough space" });
      // return res.status(413).json({error:"File too large so 50 is enough"})
      // return res.end();
    }
    console.log(filesize);
    const extension = path.extname(filename);

    const insertedFile = await File.create({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      isUploading: true,
    });

    const uploadSignedUrl = await createdUploadSignedUrl({ key: `${insertedFile.id}${extension}`, contentType: req.body.contentType, })
    return res.json({ uploadSignedUrl, fileId: insertedFile.id })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Could not initiate upload" });
  }
}


export const uploadComplete = async (req, res, next) => {
  const file = await File.findById(req.body.fileId)
  console.log(req.body.fileId);


  if (!file) {
    return res.status(404).json({ error: "File not found in our records" })
  }

  try {
    const fileData = await getS3FileMetaData(`${file.id}${file.extension}`);
    if (fileData.ContentLength !== file.size) {
      return res.status(400).json({ error: "File not found in our records" })

    }
    file.isUploading = false;
    await file.save();
    await updateDirectoriesSize(file.parentDirId, file.size)
    res.json({ message: "Upload completed" })
    console.log(fileData);
  } catch (error) {
    await file.deleteOne()
    console.log(error);
  }
}