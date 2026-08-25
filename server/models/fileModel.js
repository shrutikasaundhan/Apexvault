import { model, Schema } from "mongoose";
import { number } from "zod";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isUploading:{
        type:Schema.Types.Boolean
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    isShared: {
      type: Schema.Types.Boolean,
      default: false
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const File = model("File", fileSchema);
export default File;
