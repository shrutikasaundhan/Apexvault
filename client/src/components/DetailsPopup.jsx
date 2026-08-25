import { useEffect, useState } from "react";
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { useDirectoryContext } from "../context/DirectoryContext";

const formatSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) {
    return (bytes / GB).toFixed(2) + " GB";
  }
  if (bytes >= MB) {
    return (bytes / MB).toFixed(2) + " MB";
  }
  if (bytes >= KB) {
    return (bytes / KB).toFixed(2) + " KB";
  }
  return bytes + " Bytes";
};

function DetailsPopup({ item, resolvedPath, onClose }) {
  const { BASE_URL } = useDirectoryContext();
  const [details, setDetails] = useState({
    path: resolvedPath || "/",
    size: item.size || 0,
    numberOfFiles: 0,
    numberOfFolders: 0,
    loading: item.isDirectory,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (item.isDirectory) {
      const fetchDirDetails = async () => {
        try {
          const response = await fetch(`${BASE_URL}/directory/${item.id}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setDetails((prev) => ({
              ...prev,
              size: data.size || 0,
              numberOfFiles: data.files ? data.files.length : 0,
              numberOfFolders: data.directories ? data.directories.length : 0,
              loading: false,
            }));
          } else {
            setDetails((prev) => ({ ...prev, loading: false }));
          }
        } catch (err) {
          console.error("Error fetching directory details:", err);
          setDetails((prev) => ({ ...prev, loading: false }));
        }
      };
      fetchDirDetails();
    }
  }, [item.id, item.isDirectory, BASE_URL]);

  if (!item) return null;

  const { name, isDirectory, createdAt, updatedAt } = item;
  const { path, size, numberOfFiles, numberOfFolders, loading } = details;

  // Determine icon and color scheme based on file/folder type for the Details Popup
  const getStyleProps = () => {
    if (isDirectory) {
      return {
        icon: <FaFolder />,
        bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
      };
    }

    const ext = name.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return {
          icon: <FaFilePdf />,
          bg: "bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400",
        };
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
        return {
          icon: <FaFileImage />,
          bg: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400",
        };
      case "mp4":
      case "mkv":
      case "avi":
      case "mov":
        return {
          icon: <FaFileVideo />,
          bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-500 dark:text-purple-400",
        };
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
        return {
          icon: <FaFileArchive />,
          bg: "bg-teal-50 dark:bg-teal-950/20 text-teal-500 dark:text-teal-400",
        };
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "json":
      case "py":
      case "go":
        return {
          icon: <FaFileCode />,
          bg: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400",
        };
      default:
        return {
          icon: <FaFileAlt />,
          bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400",
        };
    }
  };

  const styleProps = getStyleProps();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-2xl shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Styled Icon Header */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${styleProps.bg}`}>
            {styleProps.icon}
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 mt-3 text-center truncate w-full px-4">
            {name}
          </h2>
        </div>

        {/* Details Fields */}
        <div className="space-y-3 text-sm text-gray-650 dark:text-zinc-300">
          <div>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">Path:</span> {path}
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">Size:</span> {formatSize(size)} ({size} bytes)
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">Created At:</span> {new Date(createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">Updated At:</span> {new Date(updatedAt).toLocaleString()}
          </div>
          {isDirectory && (
            <>
              <div>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">Files:</span> {loading ? "Loading..." : numberOfFiles}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">Folders:</span>{" "}
                {loading ? "Loading..." : numberOfFolders}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-250 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-250 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailsPopup;
