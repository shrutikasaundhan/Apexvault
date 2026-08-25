import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import { updateDirectoriesSize } from "./fileController.js";
import { file } from "zod";
import { deleteS3Files } from "../config/s3.js";

export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString();
  const directoryData = await Directory.findOne({ _id }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  // Resolve directory path recursive tree up to the root folder
  const path = [];
  let currentDir = directoryData;
  while (currentDir) {
    path.unshift({
      id: currentDir._id.toString(),
      name: currentDir._id.toString() === user.rootDirId.toString() ? "My Drive" : currentDir.name,
    });
    if (currentDir.parentDirId) {
      currentDir = await Directory.findOne({ _id: currentDir.parentDirId, userId: user._id }).lean();
    } else {
      currentDir = null;
    }
  }

  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  const rootDir = await Directory.findById(user.rootDirId).lean();
  const usedStorageInBytes = rootDir ? rootDir.size : 0;

  return res.status(200).json({
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
    path,
    maxStorageInBytes: user.maxStorageInBytes || 1 * (1024 ** 3),
    usedStorageInBytes,
  });
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;

  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await Directory.findOne({
      _id: parentDirId,
    }).lean();

    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    await Directory.create({
      name: dirname,
      parentDirId,
      userId: user._id,
    });

    return res.status(201).json({ message: "Directory Created!" });
  } catch (err) {
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else {
      next(err);
    }
  }
};

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName, isShared } = req.body;
  try {
    const updateObj = {};
    if (newDirName) updateObj.name = newDirName;
    if (isShared !== undefined) updateObj.isShared = isShared;

    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      updateObj
    );
    res.status(200).json({ message: "Directory Updated!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    })

      .lean();

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    async function getDirectoryContents(id) {
      let files = await File.find({ parentDirId: id })
        .select("extension")
        .lean();
      let directories = await Directory.find({ parentDirId: id })
        .select("_id")
        .lean();

      for (const { _id } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id);

        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }

      return { files, directories };
    }

    const { files, directories } = await getDirectoryContents(id);

    const keys = files.map(({ _id, extension }) => ({ Key: `${_id}${extension}` }))
    console.log(keys);
    if (keys.length > 0) {
      await deleteS3Files(keys);
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });



    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
    });
    await updateDirectoriesSize(directoryData.parentDirId, -directoryData.size);
    return res.status(200).json({ message: "Directory and contents deleted successfully" });
  } catch (err) {
    next(err);
  }
};
