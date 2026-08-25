import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { checkNotRegularUser } from "../middlewares/authMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadComplete,
  uploadFile,
  uploadInitiate,
  getAllFiles,
} from "../controllers/fileController.js";

const router = express.Router();

router.get("/all", checkNotRegularUser, getAllFiles);

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/upload/initiate",uploadInitiate);

router.post("/upload/complete",uploadComplete)

// router.post("/:parentDirId?", uploadFile);

router.get("/:id", getFile);

router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

export default router;
