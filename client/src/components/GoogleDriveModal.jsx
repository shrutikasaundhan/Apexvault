import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaGoogleDrive, FaDownload } from "react-icons/fa";

const formatSize = (bytes) => {
  if (!bytes) return "Unknown size";
  const numBytes = parseInt(bytes, 10);
  if (isNaN(numBytes)) return "Unknown size";
  if (numBytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

function GoogleDriveModal({
  files,
  isLoading,
  onClose,
  onImport,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg shadow-inner">
              <FaGoogleDrive />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 leading-snug">
                Import from Google Drive
              </h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                Select files to download directly to your ApexVault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search files in Google Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/60 rounded-xl text-sm font-semibold text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-850 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Files Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 dark:bg-zinc-900/10 min-h-[250px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                Fetching file list from Google Drive...
              </p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 dark:text-zinc-500 font-semibold italic">
                {searchQuery ? "No matching files found." : "No files found in Google Drive."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 hover:border-emerald-500 dark:hover:border-emerald-500/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all group"
                >
                  <div className="flex items-center min-w-0 flex-1 mr-4">
                    {/* File Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400 text-lg flex-shrink-0">
                      <FaGoogleDrive className="text-emerald-500" />
                    </div>

                    {/* File Info */}
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-zinc-500 font-medium">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px] uppercase font-bold text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-zinc-400">
                          {file.mimeType.split("/").pop()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Import Button */}
                  <button
                    onClick={() => onImport(file)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow shadow-emerald-100 dark:shadow-none transition-all cursor-pointer flex-shrink-0"
                  >
                    <FaDownload /> Import
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleDriveModal;
