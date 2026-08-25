import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
  updateUserById,
} from "./api/userApi";
import { 
  deleteFile as deleteFileApi, 
  renameFile as renameFileApi, 
  updateFileShare, 
  fetchAllFiles 
} from "./api/fileApi";
import { BASE_URL } from "./api/axiosInstances";
import DirectoryHeader from "./components/DirectoryHeader";
import {
  FaUser,
  FaSearch,
  FaFilter,
  FaThLarge,
  FaList,
  FaDatabase,
  FaUsers,
  FaTrash,
  FaSignOutAlt,
  FaTimes,
  FaChevronDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSlidersH,
  FaServer,
  FaLock,
  FaUndo,
  FaPen,
  FaEnvelope,
  FaFile,
  FaFileAlt,
  FaFileImage,
  FaFileAudio,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaDownload,
  FaShareAlt,
  FaCopy,
  FaGlobe,
  FaCheck,
  FaCreditCard,
} from "react-icons/fa";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "files"
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Search & Filtering State (Users)
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name_asc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Search & Filtering State (Files)
  const [filesSearchQuery, setFilesSearchQuery] = useState("");
  const [filesExtensionFilter, setFilesExtensionFilter] = useState("All");
  const [filesShareFilter, setFilesShareFilter] = useState("All");
  const [filesSortBy, setFilesSortBy] = useState("date_desc");
  const [filesViewMode, setFilesViewMode] = useState("grid"); // 'grid' | 'table'

  // Toast State
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [copiedId, setCopiedId] = useState("");

  // Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // File Modal State
  const [showFileRenameModal, setShowFileRenameModal] = useState(false);
  const [showFileDeleteConfirm, setShowFileDeleteConfirm] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Inputs for updates (Users)
  const [roleToSet, setRoleToSet] = useState("User");
  const [storagePreset, setStoragePreset] = useState("1GB");
  const [customStorageValue, setCustomStorageValue] = useState("");
  const [editNameInput, setEditNameInput] = useState("");
  const [editEmailInput, setEditEmailInput] = useState("");

  // Inputs for updates (Files)
  const [renameFileInput, setRenameFileInput] = useState("");

  const navigate = useNavigate();

  // Show auto-dismiss toast
  const triggerToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev.message === message ? { type: "", message: "" } : prev));
    }, 4000);
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (activeTab === "files") {
      loadFilesData();
    } else {
      loadPageData();
    }
  }, [activeTab]);

  async function loadPageData() {
    setLoading(true);
    try {
      const curUser = await fetchUser();
      setCurrentUser(curUser);
      
      if (curUser.role === "User") {
        triggerToast("error", "Unauthorized access. Redirecting to home...");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Initialization error:", err);
      if (err.response?.status === 403) {
        navigate("/");
      } else if (err.response?.status === 401) {
        navigate("/login");
      } else {
        triggerToast("error", "Failed to retrieve user data.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadFilesData() {
    setFilesLoading(true);
    try {
      const data = await fetchAllFiles();
      setFiles(data);
    } catch (err) {
      triggerToast("error", "Failed to load files asset database.");
    } finally {
      setFilesLoading(false);
    }
  }

  // --- ADMIN USER CRUD HANDLERS ---
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserById(selectedUser.id, { role: roleToSet });
      triggerToast("success", `Successfully updated ${selectedUser.name}'s role to ${roleToSet}`);
      setShowRoleModal(false);
      loadPageData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to update user role.");
    }
  };

  const handleUpdateStorage = async () => {
    if (!selectedUser) return;
    let bytes = 1073741824; 
    
    if (storagePreset === "custom") {
      const parsed = parseFloat(customStorageValue);
      if (isNaN(parsed) || parsed <= 0) {
        triggerToast("error", "Please input a valid custom storage number.");
        return;
      }
      bytes = Math.round(parsed * 1024 * 1024 * 1024);
    } else {
      const presetValues = {
        "500MB": 500 * 1024 * 1024,
        "1GB": 1024 * 1024 * 1024,
        "5GB": 5 * 1024 * 1024 * 1024,
        "10GB": 10 * 1024 * 1024 * 1024,
        "50GB": 50 * 1024 * 1024 * 1024,
        "100GB": 100 * 1024 * 1024 * 1024,
      };
      bytes = presetValues[storagePreset] || bytes;
    }

    try {
      await updateUserById(selectedUser.id, { maxStorageInBytes: bytes });
      triggerToast("success", `Updated ${selectedUser.name}'s storage quota.`);
      setShowStorageModal(false);
      loadPageData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to adjust storage quota.");
    }
  };

  const handleUpdateUserInfo = async () => {
    if (!selectedUser) return;
    try {
      await updateUserById(selectedUser.id, { name: editNameInput, email: editEmailInput });
      triggerToast("success", `Updated account details for ${editNameInput}`);
      setShowEditInfoModal(false);
      loadPageData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to update profile details.");
    }
  };

  const handleRestoreUser = async (user) => {
    try {
      await updateUserById(user.id, { deleted: false });
      triggerToast("success", `Account ${user.email} has been reactivated.`);
      loadPageData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to restore user account.");
    }
  };

  const handleForceLogout = async () => {
    if (!selectedUser) return;
    try {
      await logoutUserById(selectedUser.id);
      triggerToast("success", `Terminated all active sessions for ${selectedUser.email}`);
      setShowLogoutConfirm(false);
      loadPageData();
    } catch (err) {
      triggerToast("error", "Failed to force logout user.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserById(selectedUser.id);
      triggerToast("success", `User account ${selectedUser.email} has been deactivated.`);
      setShowDeleteConfirm(false);
      loadPageData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to delete user account.");
    }
  };

  // --- ADMIN FILE CRUD HANDLERS ---
  const handleRenameFile = async () => {
    if (!selectedFile || !renameFileInput.trim()) return;
    try {
      await renameFileApi(selectedFile.id, renameFileInput);
      triggerToast("success", `File renamed to ${renameFileInput}`);
      setShowFileRenameModal(false);
      loadFilesData();
    } catch (err) {
      triggerToast("error", err.response?.data?.error || "Failed to rename file.");
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    try {
      await deleteFileApi(selectedFile.id);
      triggerToast("success", `File ${selectedFile.name} deleted successfully.`);
      setShowFileDeleteConfirm(false);
      loadFilesData();
    } catch (err) {
      triggerToast("error", "Failed to delete file asset.");
    }
  };

  const handleToggleFileShare = async (file) => {
    try {
      const nextShareState = !file.isShared;
      await updateFileShare(file.id, nextShareState);
      triggerToast("success", `Sharing status for ${file.name} set to ${nextShareState ? 'Public' : 'Private'}`);
      loadFilesData();
    } catch (err) {
      triggerToast("error", "Failed to update sharing credentials.");
    }
  };

  const copyShareLink = (file) => {
    const shareUrl = `${window.location.origin}/guest/access/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(file.id);
    triggerToast("success", "Share URL copied to clipboard!");
    setTimeout(() => setCopiedId(""), 2000);
  };

  // --- MODALS OPEN HELPERS ---
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleToSet(user.role || "User");
    setShowRoleModal(true);
  };

  const openStorageModal = (user) => {
    setSelectedUser(user);
    const quotaGB = (user.maxStorageInBytes / (1024 ** 3)).toFixed(1);
    const presetGBs = {
      "0.5": "500MB",
      "1.0": "1GB",
      "5.0": "5GB",
      "10.0": "10GB",
      "50.0": "50GB",
      "100.0": "100GB",
    };
    if (presetGBs[quotaGB]) {
      setStoragePreset(presetGBs[quotaGB]);
      setCustomStorageValue("");
    } else {
      setStoragePreset("custom");
      setCustomStorageValue(quotaGB);
    }
    setShowStorageModal(true);
  };

  const openEditInfoModal = (user) => {
    setSelectedUser(user);
    setEditNameInput(user.name);
    setEditEmailInput(user.email);
    setShowEditInfoModal(true);
  };

  const openFileRenameModal = (file) => {
    setSelectedFile(file);
    setRenameFileInput(file.name);
    setShowFileRenameModal(true);
  };

  // --- VIEW FORMATTING HELPERS ---
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileIcon = (ext) => {
    const e = (ext || "").toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(e)) return <FaFileImage className="text-blue-500" />;
    if ([".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(e)) return <FaFileVideo className="text-rose-500" />;
    if ([".mp3", ".wav", ".ogg", ".flac"].includes(e)) return <FaFileAudio className="text-purple-500" />;
    if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(e)) return <FaFileArchive className="text-amber-500" />;
    if ([".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".py", ".go"].includes(e)) return <FaFileCode className="text-indigo-500" />;
    if ([".pdf"].includes(e)) return <FaFileAlt className="text-red-500" />;
    return <FaFile className="text-gray-400" />;
  };

  // --- DATA FILTERING & SORTING PROCESSING ---
  
  // Users Filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && user.isLoggedIn && !user.deleted) ||
      (statusFilter === "Offline" && !user.isLoggedIn && !user.deleted) ||
      (statusFilter === "Deactivated" && user.deleted);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name_asc") return a.name.localeCompare(b.name);
    if (sortBy === "name_desc") return b.name.localeCompare(a.name);
    if (sortBy === "storage_desc") return b.usedStorageInBytes - a.usedStorageInBytes;
    if (sortBy === "storage_asc") return a.usedStorageInBytes - b.usedStorageInBytes;
    if (sortBy === "role_asc") {
      const roleWeight = { Admin: 0, Manager: 1, User: 2 };
      const weightA = roleWeight[a.role] !== undefined ? roleWeight[a.role] : 3;
      const weightB = roleWeight[b.role] !== undefined ? roleWeight[b.role] : 3;
      return weightA - weightB;
    }
    return 0;
  });

  // Files Filter
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(filesSearchQuery.toLowerCase()) ||
      (file.user?.name || "").toLowerCase().includes(filesSearchQuery.toLowerCase()) ||
      (file.user?.email || "").toLowerCase().includes(filesSearchQuery.toLowerCase());

    const e = (file.extension || "").toLowerCase();
    let matchesExt = true;
    if (filesExtensionFilter === "images") matchesExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(e);
    else if (filesExtensionFilter === "videos") matchesExt = [".mp4", ".mov", ".avi", ".mkv"].includes(e);
    else if (filesExtensionFilter === "docs") matchesExt = [".pdf", ".doc", ".docx", ".txt", ".xlsx", ".pptx"].includes(e);
    else if (filesExtensionFilter === "archives") matchesExt = [".zip", ".rar", ".7z", ".tar"].includes(e);
    else if (filesExtensionFilter === "code") matchesExt = [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".py"].includes(e);

    const matchesShare =
      filesShareFilter === "All" ||
      (filesShareFilter === "Shared" && file.isShared) ||
      (filesShareFilter === "Private" && !file.isShared);

    return matchesSearch && matchesExt && matchesShare;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (filesSortBy === "name_asc") return a.name.localeCompare(b.name);
    if (filesSortBy === "name_desc") return b.name.localeCompare(a.name);
    if (filesSortBy === "size_desc") return b.size - a.size;
    if (filesSortBy === "size_asc") return a.size - b.size;
    if (filesSortBy === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
    if (filesSortBy === "date_asc") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  // User Stats Computations
  const totalUsers = users.filter((u) => !u.deleted).length;
  const adminCount = users.filter((u) => u.role === "Admin" && !u.deleted).length;
  const managerCount = users.filter((u) => u.role === "Manager" && !u.deleted).length;
  const activeSessions = users.filter((u) => u.isLoggedIn && !u.deleted).length;
  const deactivatedCount = users.filter((u) => u.deleted).length;
  
  const totalAllocatedStorage = users.reduce((acc, curr) => acc + (curr.deleted ? 0 : (curr.maxStorageInBytes || 0)), 0);
  const totalUsedStorage = users.reduce((acc, curr) => acc + (curr.deleted ? 0 : (curr.usedStorageInBytes || 0)), 0);
  const storagePercentage = totalAllocatedStorage > 0 ? (totalUsedStorage / totalAllocatedStorage) * 100 : 0;

  // File Stats Computations
  const totalFilesCount = files.length;
  const totalFilesSize = files.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const sharedFilesCount = files.filter((f) => f.isShared).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors duration-300 font-sans pb-16">
      
      {/* Dynamic Toast Notifications */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl animate-fade-in transition-all ${
          notification.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/95 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60" 
            : "bg-red-50 dark:bg-red-950/95 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/60"
        }`}>
          {notification.type === "success" ? (
            <FaCheckCircle className="text-xl text-emerald-500 shrink-0" />
          ) : (
            <FaExclamationTriangle className="text-xl text-red-500 shrink-0" />
          )}
          <p className="text-sm font-bold leading-relaxed">{notification.message}</p>
          <button 
            onClick={() => setNotification({ type: "", message: "" })} 
            className="hover:opacity-75 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 transition-opacity"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Common Header Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <DirectoryHeader />
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
        
        {/* Page title header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-slate-700 dark:from-zinc-150 dark:to-zinc-400 bg-clip-text text-transparent">
              ApexVault Admin Control Deck
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Admin panel for platform users, billing quotas, and uploaded asset directories.
            </p>
          </div>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="flex border-b border-gray-250 dark:border-zinc-800 mb-8 gap-6">
          <button 
            onClick={() => setActiveTab("users")} 
            className={`pb-3.5 px-1 text-sm font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === "users" 
                ? "border-emerald-500 text-emerald-500 font-extrabold" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-350"
            }`}
          >
            <FaUsers className="text-base" /> User Management
          </button>
          <button 
            onClick={() => setActiveTab("files")} 
            className={`pb-3.5 px-1 text-sm font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === "files" 
                ? "border-emerald-500 text-emerald-500 font-extrabold" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-350"
            }`}
          >
            <FaDatabase className="text-base" /> File Asset Manager
          </button>
        </div>

        {/* LOADING HANDLER */}
        {loading || (activeTab === "files" && filesLoading && files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold mt-4">Retrieving cloud assets...</p>
          </div>
        ) : activeTab === "users" ? (
          
          /* ==================================================== */
          /* SECTION A: USER MANAGEMENT TAB                       */
          /* ==================================================== */
          <>
            {/* PLATFORM SUMMARY METRICS PANEL */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Users count */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <FaUsers />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Registered Users</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{totalUsers}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-450">
                      ({adminCount} Admin{adminCount !== 1 ? 's' : ''}, {managerCount} Manager{managerCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {deactivatedCount > 0 && (
                    <span className="text-xs font-semibold text-red-500 mt-1 block">
                      * {deactivatedCount} deactivated profile{deactivatedCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Active sessions */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <div className="relative">
                    <FaServer />
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse"></span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Active User Sessions</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{activeSessions}</span>
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Online Now</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Storage usage summary */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <FaDatabase />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Allocated Cloud Storage</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {formatBytes(totalUsedStorage)} of {formatBytes(totalAllocatedStorage)}
                  </span>
                  {/* Quota Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2 border border-slate-200 dark:border-zinc-700/50">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            {/* ADVANCED FILTER & SEARCH TOOLBAR PANEL */}
            <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-2xl p-4 mb-8 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search Bar Input */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-255 cursor-pointer"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Role filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      <FaFilter className="text-[10px]" /> Role
                    </span>
                    <div className="relative">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="All">All Roles</option>
                        <option value="Admin">Admins Only</option>
                        <option value="Manager">Managers Only</option>
                        <option value="User">Users Only</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      Status
                    </span>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-955/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="All">All Status</option>
                        <option value="Active">Logged In / Active</option>
                        <option value="Offline">Logged Out / Offline</option>
                        <option value="Deactivated">Deactivated Users</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* Sort parameter selection */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      <FaSlidersH className="text-[10px]" /> Sort
                    </span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="name_asc">Name (A - Z)</option>
                        <option value="name_desc">Name (Z - A)</option>
                        <option value="storage_desc">Storage (High - Low)</option>
                        <option value="storage_asc">Storage (Low - High)</option>
                        <option value="role_asc">Role (Admin First)</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800/80 mx-1 hidden sm:block"></div>

                  {/* View layout mode toggle */}
                  <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 cursor-pointer flex items-center justify-center text-xs w-9 h-8 transition-colors ${
                        viewMode === "grid" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-bold" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      }`}
                      title="Grid Layout View"
                    >
                      <FaThLarge />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 cursor-pointer flex items-center justify-center text-xs w-9 h-8 transition-colors ${
                        viewMode === "table" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-bold" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      }`}
                      title="Table Layout View"
                    >
                      <FaList />
                    </button>
                  </div>

                </div>
              </div>
            </section>

            {/* USERS GRAPHIC RENDER VIEW */}
            {sortedUsers.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-16 text-center rounded-2xl">
                <FaUser className="mx-auto text-4xl text-gray-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-bold">No Users Found</h3>
                <p className="text-xs text-gray-400 mt-1">Try relaxing filters or changing search keywords.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedUsers.map((user) => {
                  const usedPct = user.maxStorageInBytes > 0 ? (user.usedStorageInBytes / user.maxStorageInBytes) * 100 : 0;
                  const isCurrentUser = currentUser && currentUser.email === user.email;
                  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

                  return (
                    <article 
                      key={user.id} 
                      className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 relative group flex flex-col justify-between ${
                        user.deleted ? "bg-slate-50/70 dark:bg-zinc-900/40 opacity-70 border-dashed border-red-300 dark:border-red-900/50" :
                        isCurrentUser ? "border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-gray-200 dark:border-zinc-850"
                      }`}
                    >
                      <div>
                        {/* Status Label on Top Right */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          {user.deleted ? (
                            <span className="bg-red-500 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                              Deactivated
                            </span>
                          ) : isCurrentUser ? (
                            <span className="bg-emerald-500 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                              You
                            </span>
                          ) : null}
                        </div>

                        {/* Top user profile header card */}
                        <div className="flex items-center gap-4.5 mb-5">
                          {user.picture ? (
                            <img 
                              src={user.picture} 
                              alt={user.name} 
                              className={`w-12 h-12 rounded-full object-cover shadow-sm bg-slate-100 border border-gray-100 dark:border-zinc-800 ${user.deleted ? "grayscale" : ""}`} 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                              {userInitial}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate" title={user.name}>
                              {user.name}
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 truncate" title={user.email}>
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Middle info list */}
                        <div className="flex flex-wrap gap-2 mb-5 items-center">
                          {/* Role tag */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider leading-relaxed ${
                            user.role === "Admin"
                              ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30"
                              : user.role === "Manager"
                              ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                              : "bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50"
                          }`}>
                            {user.role || "User"}
                          </span>

                          {/* Login status tag */}
                          {!user.deleted && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider leading-relaxed ${
                              user.isLoggedIn
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30"
                                : "bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-zinc-700/50"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
                              {user.isLoggedIn ? "Active" : "Offline"}
                            </span>
                          )}

                          {/* Billing Quota Payment Badge */}
                          {!user.deleted && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase border tracking-wider leading-relaxed ${
                              user.subscriptionStatus === "active"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            }`}>
                              <FaCreditCard className="text-[9px]" />
                              {user.subscriptionStatus === "active" ? "Pro Pack" : "Free Tier"}
                            </span>
                          )}
                        </div>

                        {/* Storage quota slider display */}
                        <div className="space-y-1.5 mb-6">
                          <div className="flex justify-between items-center text-[11px] font-bold text-gray-450 dark:text-zinc-500">
                            <span>Storage utilized</span>
                            <span>{usedPct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-750">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                user.deleted 
                                  ? "bg-gray-400"
                                  : usedPct > 90 
                                  ? "bg-red-500" 
                                  : usedPct > 70 
                                  ? "bg-amber-500" 
                                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              }`}
                              style={{ width: `${Math.min(usedPct, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10.5px] font-semibold text-slate-500 dark:text-zinc-450">
                            <span>{formatBytes(user.usedStorageInBytes)}</span>
                            <span>Limit: {formatBytes(user.maxStorageInBytes)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-slate-150 dark:border-zinc-800/60 flex items-center justify-between gap-2.5">
                        
                        {/* Edit Role & Storage (Admins Only) */}
                        {currentUser?.role === "Admin" ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => openRoleModal(user)}
                              disabled={user.deleted}
                              className={`text-xs font-bold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 py-1.5 hover:underline ${
                                user.deleted ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                              }`}
                            >
                              Role
                            </button>
                            <button
                              onClick={() => openStorageModal(user)}
                              disabled={user.deleted}
                              className={`text-xs font-bold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 py-1.5 hover:underline ${
                                user.deleted ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                              }`}
                            >
                              Quota
                            </button>
                            <button
                              onClick={() => openEditInfoModal(user)}
                              disabled={user.deleted}
                              className={`text-xs font-bold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 py-1.5 hover:underline ${
                                user.deleted ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                              }`}
                              title="Edit user details"
                            >
                              <FaPen className="inline mr-0.5 text-[9px]" /> Edit
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-zinc-650 cursor-not-allowed">Admin Locked</span>
                        )}

                        {/* Dropdown controls or quick icons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          {user.deleted ? (
                            /* RESTORE ACCOUNT ACTION (Admin only) */
                            currentUser?.role === "Admin" && (
                              <button
                                onClick={() => handleRestoreUser(user)}
                                title="Reactivate Deactivated User Account"
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              >
                                <FaUndo className="text-[10px]" /> Restore
                              </button>
                            )
                          ) : (
                            <>
                              {/* Revoke Session */}
                              <button
                                onClick={() => { setSelectedUser(user); setShowLogoutConfirm(true); }}
                                disabled={!user.isLoggedIn}
                                title="Force Logout User Sessions"
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-center w-8 h-8 transition-colors ${
                                  user.isLoggedIn
                                    ? "border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                    : "border-slate-100 dark:border-zinc-855 text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                                }`}
                              >
                                <FaSignOutAlt />
                              </button>

                              {/* Delete User */}
                              {currentUser?.role === "Admin" && (
                                <button
                                  onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                                  disabled={isCurrentUser}
                                  title={isCurrentUser ? "You cannot delete yourself" : "Deactivate User Account"}
                                  className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-center w-8 h-8 transition-colors ${
                                    isCurrentUser
                                      ? "border-slate-100 dark:border-zinc-855 text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                                      : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  }`}
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* DETAILED TABLE VIEW MODE */
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-zinc-950/60 border-b border-gray-200 dark:border-zinc-800/80 text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        <th className="p-4 md:p-5">User Profile</th>
                        <th className="p-4 md:p-5">Email Address</th>
                        <th className="p-4 md:p-5">System Role</th>
                        <th className="p-4 md:p-5">Access Status</th>
                        <th className="p-4 md:p-5">Storage Quota Limit</th>
                        <th className="p-4 md:p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-sm">
                      {sortedUsers.map((user) => {
                        const usedPct = user.maxStorageInBytes > 0 ? (user.usedStorageInBytes / user.maxStorageInBytes) * 100 : 0;
                        const isCurrentUser = currentUser && currentUser.email === user.email;
                        const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

                        return (
                          <tr 
                            key={user.id} 
                            className={`hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors ${
                              user.deleted ? "opacity-60 bg-red-500/[0.01]" :
                              isCurrentUser ? "bg-emerald-500/[0.02]" : ""
                            }`}
                          >
                            <td className="p-4 md:p-5 font-semibold">
                              <div className="flex items-center gap-3.5">
                                {user.picture ? (
                                  <img 
                                    src={user.picture} 
                                    alt={user.name} 
                                    className={`w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200/50 dark:border-zinc-800 ${user.deleted ? "grayscale" : ""}`} 
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                                    {userInitial}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className={`font-bold block truncate max-w-[180px] ${user.deleted ? "text-slate-450 line-through" : "text-gray-900 dark:text-white"}`}>
                                    {user.name}
                                  </span>
                                  {user.deleted ? (
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mt-0.5 font-sans">Deactivated</span>
                                  ) : isCurrentUser ? (
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mt-0.5">
                                      Your Account
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            
                            <td className={`p-4 md:p-5 font-medium ${user.deleted ? "text-slate-400 line-through" : "text-gray-500 dark:text-zinc-400"}`}>
                              {user.email}
                            </td>
                            
                            <td className="p-4 md:p-5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${
                                user.role === "Admin"
                                  ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30"
                                  : user.role === "Manager"
                                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                                  : "bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700/50"
                              }`}>
                                {user.role || "User"}
                              </span>
                            </td>

                            <td className="p-4 md:p-5">
                              {user.deleted ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 uppercase tracking-wider">
                                  Suspended
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${
                                    user.isLoggedIn
                                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30"
                                      : "bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-505 border-slate-200 dark:border-zinc-700/50"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
                                    {user.isLoggedIn ? "Active" : "Offline"}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border tracking-wide uppercase ${
                                    user.subscriptionStatus === "active" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-gray-500/10 text-gray-550 border-gray-500/10"
                                  }`}>
                                    {user.subscriptionStatus === "active" ? "Pro" : "Free"}
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="p-4 md:p-5">
                              <div className="max-w-[200px]">
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-455 dark:text-zinc-500 mb-1">
                                  <span>{formatBytes(user.usedStorageInBytes)} / {formatBytes(user.maxStorageInBytes)}</span>
                                  <span>{usedPct.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-750">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      user.deleted ? "bg-slate-400" :
                                      usedPct > 90 ? "bg-red-500" : usedPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 md:p-5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                {user.deleted ? (
                                  /* RESTORE */
                                  currentUser?.role === "Admin" && (
                                    <button
                                      onClick={() => handleRestoreUser(user)}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                    >
                                      <FaUndo className="text-[10px]" /> Restore
                                    </button>
                                  )
                                ) : (
                                  <>
                                    {currentUser?.role === "Admin" && (
                                      <>
                                        <button
                                          onClick={() => openRoleModal(user)}
                                          className="px-2.5 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer transition-colors"
                                          title="Manage Role Access"
                                        >
                                          Role
                                        </button>
                                        <button
                                          onClick={() => openStorageModal(user)}
                                          className="px-2.5 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer transition-colors"
                                          title="Set Storage Limit"
                                        >
                                          Quota
                                        </button>
                                        <button
                                          onClick={() => openEditInfoModal(user)}
                                          className="p-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer transition-colors w-7 h-7 flex items-center justify-center text-xs"
                                          title="Edit Name & Email"
                                        >
                                          <FaPen />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => { setSelectedUser(user); setShowLogoutConfirm(true); }}
                                      disabled={!user.isLoggedIn}
                                      title="Force Logout sessions"
                                      className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-center w-7 h-7 transition-colors ${
                                        user.isLoggedIn
                                          ? "border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                          : "border-slate-100 dark:border-zinc-855 text-slate-300 dark:text-zinc-750 cursor-not-allowed"
                                      }`}
                                    >
                                      <FaSignOutAlt />
                                    </button>
                                    {currentUser?.role === "Admin" && (
                                      <button
                                        onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                                        disabled={isCurrentUser}
                                        title="Deactivate account"
                                        className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-center w-7 h-7 transition-colors ${
                                          isCurrentUser
                                            ? "border-slate-100 dark:border-zinc-855 text-slate-300 dark:text-zinc-755 cursor-not-allowed"
                                            : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                        }`}
                                      >
                                        <FaTrash />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          
          /* ==================================================== */
          /* SECTION B: FILE ASSET MANAGER TAB                    */
          /* ==================================================== */
          <>
            {/* FILE METRICS CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <FaFileAlt />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Total Uploaded Files</span>
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1 block">
                    {totalFilesCount}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <FaDatabase />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Total Assets Storage Size</span>
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1 block">
                    {formatBytes(totalFilesSize)}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                  <FaGlobe className="animate-spin-slow" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Shared Assets Links</span>
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1 block">
                    {sharedFilesCount} <span className="text-xs font-semibold text-slate-500 dark:text-zinc-450">Publicly shared</span>
                  </span>
                </div>
              </div>
            </section>

            {/* FILES FILTERS TOOLBAR */}
            <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 mb-8 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search Bar Input */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search files by name or owner credentials..."
                    value={filesSearchQuery}
                    onChange={(e) => setFilesSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                  {filesSearchQuery && (
                    <button 
                      onClick={() => setFilesSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-255 cursor-pointer"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* File Type extension filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      Type
                    </span>
                    <div className="relative">
                      <select
                        value={filesExtensionFilter}
                        onChange={(e) => setFilesExtensionFilter(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="All">All Types</option>
                        <option value="images">Images Only</option>
                        <option value="videos">Videos Only</option>
                        <option value="docs">Documents (PDF/Doc)</option>
                        <option value="archives">Archives (ZIP/RAR)</option>
                        <option value="code">Source Code Files</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* Share filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      Sharing
                    </span>
                    <div className="relative">
                      <select
                        value={filesShareFilter}
                        onChange={(e) => setFilesShareFilter(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="All">All Sharing</option>
                        <option value="Shared">Publicly Shared</option>
                        <option value="Private">Private Assets</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* Sorting parameters */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-1">
                      <FaSlidersH className="text-[10px]" /> Sort
                    </span>
                    <div className="relative">
                      <select
                        value={filesSortBy}
                        onChange={(e) => setFilesSortBy(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <option value="date_desc">Uploaded (New - Old)</option>
                        <option value="date_asc">Uploaded (Old - New)</option>
                        <option value="size_desc">Asset Size (High - Low)</option>
                        <option value="size_asc">Asset Size (Low - High)</option>
                        <option value="name_asc">Asset Name (A - Z)</option>
                        <option value="name_desc">Asset Name (Z - A)</option>
                      </select>
                      <span className="absolute inset-y-0 right-2.5 flex items-center text-[10px] pointer-events-none text-gray-400">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>

                  <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800/80 mx-1 hidden sm:block"></div>

                  {/* View layout mode toggle */}
                  <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setFilesViewMode("grid")}
                      className={`p-2 cursor-pointer flex items-center justify-center text-xs w-9 h-8 transition-colors ${
                        filesViewMode === "grid" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-bold" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      <FaThLarge />
                    </button>
                    <button
                      onClick={() => setFilesViewMode("table")}
                      className={`p-2 cursor-pointer flex items-center justify-center text-xs w-9 h-8 transition-colors ${
                        filesViewMode === "table" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-emerald-500 font-bold" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      <FaList />
                    </button>
                  </div>

                </div>
              </div>
            </section>

            {/* FILES DATA VIEW */}
            {sortedFiles.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-16 text-center rounded-2xl">
                <FaFileAlt className="mx-auto text-4xl text-gray-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-bold">No Files Uploads Found</h3>
                <p className="text-xs text-gray-400 mt-1">Try refining search parameters.</p>
              </div>
            ) : filesViewMode === "grid" ? (
              
              /* CARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFiles.map((file) => (
                  <article 
                    key={file.id} 
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-3xl shrink-0 p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                          {getFileIcon(file.extension)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={file.name}>
                            {file.name}
                          </h2>
                          <span className="text-[10px] text-gray-400 bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded border border-gray-200/50 dark:border-zinc-850 inline-block mt-1 font-bold">
                            {(file.extension || ".dat").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800/40 pb-1.5">
                          <span className="text-gray-400 dark:text-zinc-500 font-medium">Asset Size</span>
                          <span className="font-semibold">{formatBytes(file.size)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800/40 pb-1.5">
                          <span className="text-gray-400 dark:text-zinc-500 font-medium">Uploaded By</span>
                          <span className="font-semibold truncate max-w-[150px]" title={file.user?.email}>
                            {file.user?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800/40 pb-1.5">
                          <span className="text-gray-400 dark:text-zinc-500 font-medium">Upload Date</span>
                          <span className="font-semibold">{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex flex-col gap-3">
                      {/* Share toggle controller */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 dark:text-zinc-450 flex items-center gap-1.5">
                          {file.isShared ? (
                            <>
                              <FaGlobe className="text-emerald-500" /> Public Access Link
                            </>
                          ) : (
                            <>
                              <FaLock className="text-slate-400" /> Private Asset
                            </>
                          )}
                        </span>
                        
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleToggleFileShare(file)}
                            className={`text-[10px] px-2 py-0.5 rounded font-extrabold cursor-pointer border ${
                              file.isShared 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-500/20" 
                                : "bg-slate-50 dark:bg-zinc-950 text-slate-400 border-slate-200 dark:border-zinc-800"
                            }`}
                          >
                            {file.isShared ? "SHARED" : "PRIVATE"}
                          </button>
                          
                          {file.isShared && (
                            <button
                              onClick={() => copyShareLink(file)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-500 hover:text-emerald-500 cursor-pointer"
                              title="Copy Public Link"
                            >
                              {copiedId === file.id ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Download, Rename, Delete */}
                      <div className="flex justify-between items-center gap-2.5 pt-2">
                        <button
                          onClick={() => window.open(`${BASE_URL}/file/${file.id}?action=download`, "_blank")}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-650 dark:text-zinc-300"
                        >
                          <FaDownload className="text-[10px]" /> Download
                        </button>
                        <button
                          onClick={() => openFileRenameModal(file)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-650 dark:text-zinc-300"
                        >
                          <FaPen className="text-[10px]" /> Rename
                        </button>
                        <button
                          onClick={() => { setSelectedFile(file); setShowFileDeleteConfirm(true); }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                          title="Delete file asset"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              
              /* TABLE VIEW */
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-zinc-950/60 border-b border-gray-200 dark:border-zinc-800/80 text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        <th className="p-4 md:p-5">File Asset</th>
                        <th className="p-4 md:p-5">Size</th>
                        <th className="p-4 md:p-5">Uploaded By</th>
                        <th className="p-4 md:p-5">Date Created</th>
                        <th className="p-4 md:p-5">Sharing Status</th>
                        <th className="p-4 md:p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-sm">
                      {sortedFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                          <td className="p-4 md:p-5 font-semibold">
                            <div className="flex items-center gap-3.5">
                              <span className="text-xl shrink-0 p-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded">
                                {getFileIcon(file.extension)}
                              </span>
                              <div className="min-w-0">
                                <span className="text-gray-900 dark:text-white font-bold block truncate max-w-[200px]" title={file.name}>
                                  {file.name}
                                </span>
                                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{file.extension}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 md:p-5 text-gray-500 dark:text-zinc-400 font-medium">
                            {formatBytes(file.size)}
                          </td>

                          <td className="p-4 md:p-5 font-medium">
                            <span className="block text-gray-900 dark:text-white truncate max-w-[150px]" title={file.user?.name}>
                              {file.user?.name}
                            </span>
                            <span className="block text-[10px] text-gray-450 truncate max-w-[150px]" title={file.user?.email}>
                              {file.user?.email}
                            </span>
                          </td>

                          <td className="p-4 md:p-5 text-gray-500 dark:text-zinc-400 font-medium">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </td>

                          <td className="p-4 md:p-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleFileShare(file)}
                                className={`text-[10px] px-2 py-0.5 rounded font-extrabold cursor-pointer border ${
                                  file.isShared 
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-500/20" 
                                    : "bg-slate-50 dark:bg-zinc-950 text-slate-400 border-slate-200 dark:border-zinc-800"
                                }`}
                              >
                                {file.isShared ? "PUBLIC" : "PRIVATE"}
                              </button>
                              {file.isShared && (
                                <button
                                  onClick={() => copyShareLink(file)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-500 hover:text-emerald-500 cursor-pointer"
                                  title="Copy Public Link"
                                >
                                  {copiedId === file.id ? <FaCheck className="text-emerald-500 text-xs" /> : <FaCopy className="text-xs" />}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="p-4 md:p-5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => window.open(`${BASE_URL}/file/${file.id}?action=download`, "_blank")}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-lg text-xs font-bold cursor-pointer text-slate-600 hover:text-emerald-500 transition-colors"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => openFileRenameModal(file)}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-lg text-xs font-bold cursor-pointer text-slate-600 hover:text-emerald-500 transition-colors"
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => { setSelectedFile(file); setShowFileDeleteConfirm(true); }}
                                className="p-1.5 rounded-lg border border-slate-250 dark:border-zinc-800 text-slate-450 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- ADMINISTRATIVE DIALOG MODALS (USERS) --- */}

      {/* MODAL 1: CHANGE ROLE */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowRoleModal(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in">
            <button onClick={() => setShowRoleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"><FaTimes className="text-sm" /></button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Configure Directory Access</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-6">Update roles and access privileges for <span className="font-bold text-slate-700 dark:text-zinc-300">{selectedUser.name}</span>.</p>
            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Assign System Role</label>
              <div className="grid grid-cols-3 gap-3">
                {["Admin", "Manager", "User"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleToSet(role)}
                    className={`py-3 px-4 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      roleToSet === role
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                        : "border-gray-200 dark:border-zinc-855 bg-slate-50 dark:bg-zinc-955/30 text-gray-700 dark:text-zinc-355 hover:bg-slate-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950/40 rounded-xl border border-gray-200/50 dark:border-zinc-850 flex gap-2.5">
                <FaLock className="text-slate-400 text-sm mt-0.5 shrink-0" />
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed">Admins have full write permissions, including deleting databases. Managers can review active users and force sessions logout. Users have basic cloud workspace read/write access.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-750 dark:text-zinc-305 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer">Cancel</button>
              <button onClick={handleUpdateRole} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow hover:shadow-md cursor-pointer transition-shadow">Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ALLOCATE STORAGE QUOTA */}
      {showStorageModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowStorageModal(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in">
            <button onClick={() => setShowStorageModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"><FaTimes className="text-sm" /></button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Adjust Storage Quota</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-6">Set maximum database size limits for <span className="font-bold text-slate-700 dark:text-zinc-300">{selectedUser.name}</span>.</p>
            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Quota limit presets</label>
              <div className="grid grid-cols-3 gap-2.5">
                {["500MB", "1GB", "5GB", "10GB", "50GB", "custom"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setStoragePreset(preset)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      storagePreset === preset
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                        : "border-gray-200 dark:border-zinc-855 bg-slate-50 dark:bg-zinc-955/30 text-gray-700 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {preset === "custom" ? "Custom Size" : preset}
                  </button>
                ))}
              </div>
              {storagePreset === "custom" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 block">Input storage capacity in Gigabytes (GB)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 5.5"
                      value={customStorageValue}
                      onChange={(e) => setCustomStorageValue(e.target.value)}
                      className="w-full border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors pr-10"
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-xs font-bold text-slate-400 uppercase">GB</span>
                  </div>
                </div>
              )}
              <div className="p-3 bg-slate-50 dark:bg-zinc-950/40 rounded-xl border border-gray-200/50 dark:border-zinc-855 flex gap-2.5">
                <FaDatabase className="text-slate-400 text-sm mt-0.5 shrink-0" />
                <div className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Currently utilizing: <span className="font-bold text-slate-700 dark:text-zinc-300">{formatBytes(selectedUser.usedStorageInBytes)}</span>. 
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStorageModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-750 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer">Cancel</button>
              <button onClick={handleUpdateStorage} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow hover:shadow-md cursor-pointer transition-shadow">Update Limit</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER DETAILS */}
      {showEditInfoModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowEditInfoModal(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in">
            <button onClick={() => setShowEditInfoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"><FaTimes className="text-sm" /></button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Edit Account Information</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-6">Modify the profile credentials for <span className="font-bold text-slate-700 dark:text-zinc-300">{selectedUser.name}</span>.</p>
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-455 dark:text-zinc-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaUser className="text-xs" /></span>
                  <input
                    type="text"
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    className="w-full pl-10 border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                    placeholder="Enter name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-455 dark:text-zinc-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FaEnvelope className="text-xs" /></span>
                  <input
                    type="email"
                    value={editEmailInput}
                    onChange={(e) => setEditEmailInput(e.target.value)}
                    className="w-full pl-10 border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEditInfoModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-755 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer">Cancel</button>
              <button onClick={handleUpdateUserInfo} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow hover:shadow-md cursor-pointer transition-shadow">Save Details</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FORCE LOGOUT */}
      {showLogoutConfirm && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in text-center">
            <FaSignOutAlt className="mx-auto text-4xl text-amber-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Force Session Logout</h3>
            <p className="text-xs text-gray-400 mb-6">Are you sure you want to terminate sessions for <span className="font-bold">{selectedUser.email}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-800 text-xs font-bold text-gray-750 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 w-full cursor-pointer">Go Back</button>
              <button onClick={handleForceLogout} className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold w-full cursor-pointer">Terminate</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DEACTIVATE USER */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in text-center">
            <FaTrash className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Deactivate User Account</h3>
            <p className="text-xs text-gray-400 mb-6">Are you sure you want to deactivate <span className="font-bold">{selectedUser.name}</span>'s account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-800 text-xs font-bold text-gray-750 dark:text-zinc-305 hover:bg-slate-50 dark:hover:bg-zinc-900 w-full cursor-pointer">Cancel</button>
              <button onClick={handleDeleteUser} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold w-full cursor-pointer">Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMINISTRATIVE DIALOG MODALS (FILES) --- */}

      {/* FILE MODAL 1: RENAME FILE */}
      {showFileRenameModal && selectedFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowFileRenameModal(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in">
            <button onClick={() => setShowFileRenameModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"><FaTimes className="text-sm" /></button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Rename Asset File</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-6">Enter a new filename for the database record.</p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider block">File Name</label>
                <input
                  type="text"
                  value={renameFileInput}
                  onChange={(e) => setRenameFileInput(e.target.value)}
                  className="w-full border border-gray-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  placeholder="untitled"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowFileRenameModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-755 dark:text-zinc-305 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer">Cancel</button>
              <button onClick={handleRenameFile} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow hover:shadow-md cursor-pointer transition-shadow">Rename Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* FILE MODAL 2: DELETE FILE CONFIRMATION */}
      {showFileDeleteConfirm && selectedFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowFileDeleteConfirm(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in text-center">
            <FaTrash className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Delete File Asset</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold">{selectedFile.name}</span>? 
              This deletes S3 blocks and frees up parent directory space. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowFileDeleteConfirm(false)} className="px-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-800 text-xs font-bold text-gray-750 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 w-full cursor-pointer">Cancel</button>
              <button onClick={handleDeleteFile} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold w-full cursor-pointer">Permanently Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
