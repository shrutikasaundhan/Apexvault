import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import { DirectoryContext } from "./context/DirectoryContext";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directoryApi";

import { deleteFile, renameFile, uploadInitiate, uploadComplete } from "./api/fileApi";
import { BASE_URL } from "./api/axiosInstances";
import DetailsPopup from "./components/DetailsPopup";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";
import GoogleDriveModal from "./components/GoogleDriveModal";
import ShareModal from "./components/ShareModal";

import {
  FaFolder,
  FaStar,
  FaShareAlt,
  FaExclamationTriangle,
  FaTrash,
  FaCloudUploadAlt,
  FaFolderPlus,
  FaGoogleDrive,
  FaSearch,
  FaHome,
} from "react-icons/fa";

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Drive");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef(null);

  // Single-file upload state
  const [uploadItem, setUploadItem] = useState(null); // { id, file, name, size, progress, isUploading }
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Dashboard customization states
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "files";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [pathNodes, setPathNodes] = useState([]);

  // Google Drive Modal State
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Share Modal State
  const [shareModalItem, setShareModalItem] = useState(null);

  // Persistent arrays for stars, trash, spam, shared
  const [starredIds, setStarredIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("starredIds")) || [];
    } catch {
      return [];
    }
  });
  const [trashIds, setTrashIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trashIds")) || [];
    } catch {
      return [];
    }
  });
  const [spamIds, setSpamIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("spamIds")) || [];
    } catch {
      return [];
    }
  });
  const [sharedIds, setSharedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sharedIds")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("starredIds", JSON.stringify(starredIds));
  }, [starredIds]);
  useEffect(() => {
    localStorage.setItem("trashIds", JSON.stringify(trashIds));
  }, [trashIds]);
  useEffect(() => {
    localStorage.setItem("spamIds", JSON.stringify(spamIds));
  }, [spamIds]);
  useEffect(() => {
    localStorage.setItem("sharedIds", JSON.stringify(sharedIds));
  }, [sharedIds]);

  const toggleStar = (id) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const googleDriveMockFiles = [
    { id: "gd-1", name: "Project_Proposal.pdf", size: 1048576, mimeType: "application/pdf" },
    { id: "gd-2", name: "Logo_Concept.png", size: 524288, mimeType: "image/png" },
    { id: "gd-3", name: "Annual_Report_2026.pdf", size: 2097152, mimeType: "application/pdf" },
    { id: "gd-4", name: "Sprint_Planning.xlsx", size: 131072, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { id: "gd-5", name: "Intro_Video.mp4", size: 10485760, mimeType: "video/mp4" }
  ];

  const handleImportFromDrive = async (file) => {
    setIsDriveLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const blob = new Blob(["This is a simulated file imported from Google Drive."], { type: file.mimeType });
      const simulatedFile = new File([blob], file.name, { type: file.mimeType });

      const data = await uploadInitiate({
        name: simulatedFile.name,
        size: simulatedFile.size,
        contentType: simulatedFile.type,
        parentDirId: dirId,
      });

      const { uploadSignedUrl, fileId } = data;

      await fetch(uploadSignedUrl, {
        method: "PUT",
        body: simulatedFile,
        headers: {
          "Content-Type": simulatedFile.type,
        },
      });

      await uploadComplete(fileId);
      setShowDriveModal(false);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
      if (data.path) {
        setPathNodes(data.path);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "video";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code";
      default:
        return "alt";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") navigate(`/directory/${id}`);
    else window.location.href = `http://localhost:4000/file/${id}`;
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      e.target.value = "";
      return;
    }

    const tempItem = {
      file,
      name: file.name,
      size: file.size,
      id: `temp-${Date.now()}`,
      isUploading: true,
      progress: 0,
    };

    try{
      const data = await uploadInitiate({
      name: file.name,
      size: file.size,
      contentType: file.type,
      parentDirId: dirId,
    });

    const { uploadSignedUrl, fileId } = data;

    // Optimistically show the file in the list
    setFilesList((prev) => [tempItem, ...prev]);
    setUploadItem(tempItem);
    e.target.value = "";

    startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    }catch(err){
      setErrorMessage(err.response?.data?.error || err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }

  async function startUpload({ item, uploadUrl:uploadSignedUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("PUT", uploadSignedUrl);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {

      if(xhr.status===200){
        const fileUploadResponse=await uploadComplete(fileId);
      }
      else{
        setErrorMessage("Upload failed. Please try again.",3000);
      }
      // Clear upload state and refresh directory
      console.log("Upload completed successfully.");
      console.log(xhr.status, xhr.responseText);
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = () => {
      setErrorMessage("Something went wrong!");
      // Remove temp item from the list
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    // Remove temp item and reset state
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
      setTrashIds((prev) => prev.filter((id) => id !== item.id));
      setStarredIds((prev) => prev.filter((id) => id !== item.id));
      setSharedIds((prev) => prev.filter((id) => id !== item.id));
      setSpamIds((prev) => prev.filter((id) => id !== item.id));
      setDeleteItem(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleEmptyTrash() {
    const trashedItems = combinedItems.filter((item) => trashIds.includes(item.id));
    if (trashedItems.length === 0) return;
    if (!window.confirm("Are you sure you want to permanently delete all items in Trash?")) return;
    try {
      for (const item of trashedItems) {
        if (item.isDirectory) await deleteDirectory(item.id);
        else await deleteFile(item.id);
      }
      setTrashIds([]);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  // Sidebar drag & drop handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (uploadItem?.isUploading) {
        setErrorMessage("An upload is already in progress. Please wait.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const tempItem = {
        file,
        name: file.name,
        size: file.size,
        id: `temp-${Date.now()}`,
        isUploading: true,
        progress: 0,
      };

      try {
        const data = await uploadInitiate({
          name: file.name,
          size: file.size,
          contentType: file.type,
          parentDirId: dirId,
        });

        const { uploadSignedUrl, fileId } = data;

        setFilesList((prev) => [tempItem, ...prev]);
        setUploadItem(tempItem);

        startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
      } catch (err) {
        setErrorMessage(err.response?.data?.error || err.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  // Breadcrumb handler
  const handleBreadcrumbClick = (id) => {
    const isRoot = pathNodes.length > 0 && pathNodes[0].id === id;
    if (isRoot) {
      navigate("/dashboard");
    } else {
      navigate(`/directory/${id}`);
    }
  };

  // Sidebar Filtering Logic
  const getTabFilteredItems = () => {
    if (activeTab === "trash") {
      return combinedItems.filter((item) => trashIds.includes(item.id));
    }
    const nonTrashed = combinedItems.filter((item) => !trashIds.includes(item.id));

    if (activeTab === "starred") {
      return nonTrashed.filter((item) => starredIds.includes(item.id));
    }
    if (activeTab === "shared") {
      return nonTrashed.filter((item) => sharedIds.includes(item.id));
    }
    if (activeTab === "spam") {
      return nonTrashed.filter((item) => spamIds.includes(item.id));
    }
    return nonTrashed.filter((item) => !spamIds.includes(item.id));
  };

  const tabFilteredItems = getTabFilteredItems();

  // Search Filter
  const filteredItems = tabFilteredItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;

    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "size") {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;
      return sizeB - sizeA;
    } else if (sortOption === "date") {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    }
    return 0;
  });

  // Category counts
  const myFilesCount = combinedItems.filter(item => !trashIds.includes(item.id) && !spamIds.includes(item.id)).length;
  const starredCount = combinedItems.filter(item => starredIds.includes(item.id) && !trashIds.includes(item.id)).length;
  const sharedCount = combinedItems.filter(item => sharedIds.includes(item.id) && !trashIds.includes(item.id)).length;
  const spamCount = combinedItems.filter(item => spamIds.includes(item.id) && !trashIds.includes(item.id)).length;
  const trashCount = combinedItems.filter(item => trashIds.includes(item.id)).length;

  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem
    ? { [uploadItem.id]: uploadItem.progress || 0 }
    : {};

  return (
    <DirectoryContext.Provider
      value={{
        handleRowClick,
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveContextMenu((prev) => (prev === id ? null : id));
        },
        getFileIcon,
        setActiveContextMenu,
        isUploading,
        progressMap,
        handleCancelUpload,
        setDeleteItem,
        openRenameModal,
        openDetailsPopup,
        BASE_URL,
        starredIds,
        toggleStar,
        trashIds,
        setTrashIds,
        spamIds,
        setSpamIds,
        sharedIds,
        setSharedIds,
        shareModalItem,
        setShareModalItem,
      }}
    >
      <div className="mx-2 md:mx-4 max-w-7xl lg:mx-auto pb-12">
        {errorMessage &&
          errorMessage !==
            "Directory not found or you do not have access to it!" && (
            <div className="error-message text-red-500 text-xs text-center mt-1">
              {errorMessage}
            </div>
          )}

        {/* Global Navigation Bar */}
        <DirectoryHeader />

        {/* Responsive Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mt-6 items-start">
          
          {/* Sidebar */}
          <aside className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col gap-2">
            {[
              { id: "files", label: "My Files", icon: <FaFolder />, count: myFilesCount },
              { id: "starred", label: "Starred", icon: <FaStar />, count: starredCount },
              { id: "shared", label: "Shared", icon: <FaShareAlt />, count: sharedCount },
              { id: "spam", label: "Spam", icon: <FaExclamationTriangle />, count: spamCount },
              { id: "trash", label: "Trash", icon: <FaTrash />, count: trashCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/dashboard?tab=${tab.id}`, { replace: true });
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100 dark:shadow-none"
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900/50 hover:text-gray-800 dark:hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            
            {/* Upload Zone (Visible only in My Files) */}
            {activeTab === "files" && (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center group ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 scale-[0.99]"
                    : "border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaCloudUploadAlt />
                </div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mb-1">
                  Upload Files or Create Directory
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-100 dark:shadow-none transition-all cursor-pointer"
                  >
                    <FaCloudUploadAlt /> Upload Files
                  </button>
                  <button
                    onClick={() => setShowCreateDirModal(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-100 dark:shadow-none transition-all cursor-pointer"
                  >
                    <FaFolderPlus /> Create Directory
                  </button>
                  <button
                    onClick={() => setShowDriveModal(true)}
                    className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <FaGoogleDrive className="text-emerald-500" /> Import from Drive
                  </button>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-4">
              {/* Search Container */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm"
                />
              </div>

              {/* Sorting */}
              <div className="flex gap-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-500 dark:text-zinc-400 px-4 py-2.5 rounded-2xl focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="name">Sort by: Name (A-Z)</option>
                  <option value="size">Sort by: Size (Large first)</option>
                  <option value="date">Sort by: Date (Newest first)</option>
                </select>
              </div>
            </div>

            {/* Clickable Breadcrumb path */}
            {pathNodes.length > 0 && (
              <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-zinc-500 mb-6 shadow-sm overflow-x-auto whitespace-nowrap">
                <span className="text-gray-300 dark:text-zinc-600"><FaHome /></span>
                {pathNodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-2">
                    {index > 0 && <span className="text-gray-300 dark:text-zinc-700">/</span>}
                    <button
                      onClick={() => handleBreadcrumbClick(node.id)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {node.name}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trash Info Banner */}
            {activeTab === "trash" && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <FaTrash className="text-amber-600 dark:text-amber-400" />
                  <span>Items in Trash can be restored or deleted permanently.</span>
                </div>
                {trashCount > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer hover:bg-red-50 shadow-sm"
                  >
                    Empty Trash
                  </button>
                )}
              </div>
            )}

            {/* List area */}
            {sortedItems.length === 0 ? (
              <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                <p className="text-xs text-gray-400 dark:text-zinc-500 italic font-semibold">
                  {searchQuery ? "No matching files or folders found." : "This folder is empty. Upload a file or create a folder to see some data."}
                </p>
              </div>
            ) : (
              <DirectoryList items={sortedItems} />
            )}

          </main>
        </div>

        {/* Input file helper element */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Modals */}
        {showCreateDirModal && (
          <CreateDirectoryModal
            newDirname={newDirname}
            setNewDirname={setNewDirname}
            onClose={() => setShowCreateDirModal(false)}
            onCreateDirectory={handleCreateDirectory}
          />
        )}

        {showRenameModal && (
          <RenameModal
            renameType={renameType}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onClose={() => setShowRenameModal(false)}
            onRenameSubmit={handleRenameSubmit}
          />
        )}

        {detailsItem && (
          <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
        )}

        {deleteItem && (
          <ConfirmDeleteModal
            item={deleteItem}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}

        {/* Google Drive Modal */}
        {showDriveModal && (
          <GoogleDriveModal
            files={googleDriveMockFiles}
            isLoading={isDriveLoading}
            onClose={() => setShowDriveModal(false)}
            onImport={handleImportFromDrive}
          />
        )}

        {/* Share Document Modal */}
        {shareModalItem && (
          <ShareModal
            item={shareModalItem}
            onClose={() => setShareModalItem(null)}
          />
        )}

      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;
