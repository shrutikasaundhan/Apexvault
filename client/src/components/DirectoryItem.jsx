import { useState, useEffect } from "react";
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "./ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";

const FileImageThumbnail = ({ item, isUploadingItem, baseUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (isUploadingItem && item.file) {
      const url = URL.createObjectURL(item.file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.file, isUploadingItem]);

  const src = isUploadingItem ? objectUrl : `${baseUrl}/file/${item.id}`;

  if (error || !src) {
    return <FaFileImage />;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && <FaFileImage className="absolute text-indigo-400" />}
      <img
        src={src}
        alt={item.name}
        className={`w-full h-full object-cover rounded-xl transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function DirectoryItem({ item, uploadProgress }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
    starredIds = [],
    toggleStar,
    BASE_URL,
  } = useDirectoryContext();

  const isUploadingItem = item.id.startsWith("temp-");

  // Determine icon and color scheme based on file/folder
  const getStyleProps = () => {
    if (item.isDirectory) {
      return {
        icon: <FaFolder />,
        bg: "bg-amber-50 text-amber-500",
        badge: "FOLDER",
      };
    }

    const type = getFileIcon(item.name);
    switch (type) {
      case "pdf":
        return {
          icon: <FaFilePdf />,
          bg: "bg-red-50 text-red-500",
          badge: "PDF",
        };
      case "image":
        return {
          icon: <FileImageThumbnail item={item} isUploadingItem={isUploadingItem} baseUrl={BASE_URL} />,
          bg: "bg-indigo-50 text-indigo-500",
          badge: item.name.split(".").pop().toUpperCase() || "IMG",
        };
      case "video":
        return {
          icon: <FaFileVideo />,
          bg: "bg-purple-50 text-purple-500",
          badge: item.name.split(".").pop().toUpperCase() || "VID",
        };
      case "archive":
        return {
          icon: <FaFileArchive />,
          bg: "bg-teal-50 text-teal-500",
          badge: item.name.split(".").pop().toUpperCase() || "ZIP",
        };
      case "code":
        return {
          icon: <FaFileCode />,
          bg: "bg-gray-100 text-gray-600",
          badge: item.name.split(".").pop().toUpperCase() || "CODE",
        };
      case "alt":
      default:
        return {
          icon: <FaFileAlt />,
          bg: "bg-blue-50 text-blue-500",
          badge: item.name.split(".").pop().toUpperCase() || "FILE",
        };
    }
  };

  const styleProps = getStyleProps();

  return (
    <div
      className="bg-white border border-gray-100 hover:border-blue-500 rounded-2xl px-5 py-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 group relative"
      onClick={() =>
        !(activeContextMenu || isUploading) &&
        handleRowClick(item.isDirectory ? "directory" : "file", item.id)
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Icon Container */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner ${styleProps.bg}`}>
          {styleProps.icon}
        </div>

        {/* Info Container */}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center">
            <span className="text-sm font-bold text-gray-800 truncate leading-snug group-hover:text-blue-600 transition-colors">
              {item.name}
            </span>
            <span className="inline-block text-[10px] font-extrabold bg-gray-50 text-gray-400 border border-gray-150 rounded px-1.5 py-0.5 ml-2 tracking-wide uppercase flex-shrink-0">
              {styleProps.badge}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(item.id);
              }}
              className={`ml-3 cursor-pointer text-base focus:outline-none transition-transform hover:scale-125 duration-200 ${
                starredIds.includes(item.id) ? "text-amber-400" : "text-gray-200 hover:text-gray-400"
              }`}
              title={starredIds.includes(item.id) ? "Remove Star" : "Star File"}
            >
              ★
            </button>
          </div>
          
          {/* Mobile detail display */}
          <div className="md:hidden flex items-center gap-2 mt-1 text-[11px] font-medium text-gray-400">
            {item.isDirectory ? <span>Folder</span> : <span>{formatSize(item.size)}</span>}
            <span>•</span>
            <span>{formatDate(item.updatedAt || item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right side info for desktop */}
      <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-400 ml-4">
        {item.isDirectory ? (
          <span className="w-20 text-right">Folder</span>
        ) : (
          <span className="w-20 text-right text-gray-500">{formatSize(item.size)}</span>
        )}
        <span className="w-2.5 h-2.5 flex items-center justify-center">•</span>
        <span className="w-40 text-right">
          Modified: {formatDate(item.updatedAt || item.createdAt)}
        </span>

        {/* Context Menu Trigger */}
        <div
          className="text-gray-300 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, item.id);
          }}
        >
          <BsThreeDotsVertical className="text-base" />
        </div>

        {activeContextMenu === item.id && (
          <ContextMenu item={item} isUploadingItem={isUploadingItem} />
        )}
      </div>

      {/* Mobile three-dots menu button */}
      <div
        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleContextMenu(e, item.id);
        }}
      >
        <BsThreeDotsVertical className="text-base" />
        {activeContextMenu === item.id && (
          <ContextMenu item={item} isUploadingItem={isUploadingItem} />
        )}
      </div>

      {/* Uploading progress bar */}
      {isUploadingItem && (
        <div className="w-full mt-3 px-1">
          <div className="flex justify-between items-center text-xs font-bold text-blue-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.floor(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: uploadProgress === 100 ? "#10b981" : "#3b82f6",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryItem;
