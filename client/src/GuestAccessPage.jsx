import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosWithoutCreds } from "./api/axiosInstances";
import { 
  FaCloud, 
  FaDownload, 
  FaFolder, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaFileArchive, 
  FaFileCode, 
  FaFileAlt, 
  FaExclamationTriangle,
  FaShieldAlt
} from "react-icons/fa";

export default function GuestAccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharedData, setSharedData] = useState(null); // { type, name, size, extension, downloadUrl, files, directories }

  useEffect(() => {
    async function fetchSharedData() {
      try {
        setLoading(true);
        setError("");
        const { data } = await axiosWithoutCreds.get(`/guest/access/${id}`);
        setSharedData(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "This shared link is invalid, expired, or the owner has stopped sharing.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSharedData();
  }, [id]);

  const formatSize = (bytes) => {
    if (bytes === undefined || bytes === null) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FaFilePdf className="text-rose-500 text-5xl" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FaFileImage className="text-indigo-500 text-5xl" />;
      case "mp4":
      case "mov":
      case "avi":
        return <FaFileVideo className="text-purple-500 text-5xl" />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FaFileArchive className="text-teal-500 text-5xl" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return <FaFileCode className="text-gray-650 text-5xl" />;
      default:
        return <FaFileAlt className="text-blue-500 text-5xl" />;
    }
  };

  const handleDownload = () => {
    if (sharedData?.downloadUrl) {
      window.location.href = sharedData.downloadUrl;
    } else {
      alert("Download URL not found!");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 transition-colors duration-300 p-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-10 pointer-events-none animate-pulse bg-gradient-to-br from-[#f59e0b] to-[#10b981] -top-24 -right-12"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-10 pointer-events-none animate-pulse bg-gradient-to-br from-[#10b981] to-[#f59e0b] -bottom-24 -left-12"></div>

      <div className="relative w-full max-w-[480px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl z-10 text-center">
        
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-[#f59e0b] to-[#10b981] rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-emerald-100 dark:shadow-none">
            <FaCloud />
          </div>
          <span className="text-xl font-extrabold text-gray-850 dark:text-zinc-150 tracking-tight">ApexVault</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-gray-450 dark:text-zinc-550 uppercase tracking-wider">Verifying link...</span>
          </div>
        ) : error ? (
          <div className="py-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center text-xl mb-4">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-zinc-200 mb-2">Access Denied</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-semibold max-w-xs mb-6">
              {error}
            </p>
            <button 
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Go to Home Page
            </button>
          </div>
        ) : (
          <div>
            {/* FILE SHARE DETAIL */}
            {sharedData.type === "file" && (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 flex items-center justify-center shadow-inner mb-4">
                  {getFileIcon(sharedData.name)}
                </div>
                
                <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 truncate max-w-sm px-4 mb-1">
                  {sharedData.name}
                </h3>
                <span className="text-[10px] font-extrabold text-gray-450 dark:text-zinc-500 uppercase tracking-wider mb-6">
                  {formatSize(sharedData.size)} • Publicly Shared
                </span>

                <button
                  onClick={handleDownload}
                  className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mb-6"
                >
                  <FaDownload />
                  <span>Download File</span>
                </button>
              </div>
            )}

            {/* DIRECTORY SHARE DETAIL */}
            {sharedData.type === "directory" && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center text-4xl shadow-inner mb-4">
                  <FaFolder />
                </div>
                
                <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 truncate max-w-sm px-4 mb-2">
                  {sharedData.name}
                </h3>
                <span className="text-[10px] font-extrabold text-gray-450 dark:text-zinc-550 uppercase tracking-wider mb-6">
                  Folder • {sharedData.files.length + sharedData.directories.length} items
                </span>

                {/* Read-only List */}
                <div className="w-full max-h-[220px] overflow-y-auto border border-gray-150 dark:border-zinc-850 rounded-2xl p-2.5 text-left flex flex-col gap-2 mb-6">
                  {sharedData.directories.map((dir) => (
                    <div key={dir.id} className="flex items-center gap-2.5 p-2 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850/60 rounded-xl select-none">
                      <FaFolder className="text-amber-500 text-sm flex-shrink-0" />
                      <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">{dir.name}</span>
                    </div>
                  ))}
                  {sharedData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850/60 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FaFileAlt className="text-blue-500 text-sm flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate pr-2">{file.name}</span>
                      </div>
                      <span className="text-[9px] font-extrabold text-gray-450 dark:text-zinc-500 uppercase flex-shrink-0">{formatSize(file.size)}</span>
                    </div>
                  ))}
                  {sharedData.files.length === 0 && sharedData.directories.length === 0 && (
                    <span className="text-xs text-gray-400 dark:text-zinc-500 italic block text-center py-4">Folder is empty</span>
                  )}
                </div>
              </div>
            )}

            {/* Footer lock indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
              <FaShieldAlt className="text-emerald-500" />
              <span>Secure cloud download by ApexVault</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
