import { useDirectoryContext } from "../context/DirectoryContext";
import { updateDirectoryShare } from "../api/directoryApi";
import { updateFileShare } from "../api/fileApi";

function ContextMenu({ item, isUploadingItem }) {
  const {
    handleCancelUpload,
    setDeleteItem,
    openRenameModal,
    openDetailsPopup,
    BASE_URL,
    trashIds = [],
    setTrashIds,
    spamIds = [],
    setSpamIds,
    sharedIds = [],
    setSharedIds,
    starredIds = [],
    toggleStar,
    setShareModalItem,
    setActiveContextMenu,
  } = useDirectoryContext();

  const menuClass =
    "absolute bg-white border border-gray-150 shadow-lg rounded-2xl text-sm z-50 right-2 top-4/5 overflow-hidden w-44 py-1.5 border border-gray-100";
  const itemClass = "px-4 py-2 hover:bg-slate-50 cursor-pointer font-semibold text-gray-700 transition-colors flex items-center gap-2";

  const isDeleted = trashIds.includes(item.id);
  const isSpam = spamIds.includes(item.id);
  const isShared = sharedIds.includes(item.id);
  const isStarred = starredIds.includes(item.id);

  const handleRestore = (e) => {
    e.stopPropagation();
    setTrashIds((prev) => prev.filter((id) => id !== item.id));
    setActiveContextMenu(null);
  };

  const handleMoveToTrash = (e) => {
    e.stopPropagation();
    setTrashIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    setActiveContextMenu(null);
  };

  const handleToggleSpam = (e) => {
    e.stopPropagation();
    setSpamIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
    setActiveContextMenu(null);
  };

  const handleToggleShare = (e) => {
    e.stopPropagation();
    setShareModalItem(item);
    setActiveContextMenu(null);
  };

  const handleToggleStarClick = (e) => {
    e.stopPropagation();
    toggleStar(item.id);
    setActiveContextMenu(null);
  };

  if (isDeleted) {
    return (
      <div className={menuClass}>
        <div className={`${itemClass} text-emerald-600 hover:text-emerald-700`} onClick={handleRestore}>
          Restore
        </div>
        <div
          className={`${itemClass} text-red-600 hover:text-red-700`}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteItem(item);
            setActiveContextMenu(null);
          }}
        >
          Delete Permanently
        </div>
      </div>
    );
  }

  if (isUploadingItem && item.isUploading) {
    return (
      <div className={menuClass}>
        <div className={itemClass} onClick={(e) => { e.stopPropagation(); handleCancelUpload(item.id); }}>
          Cancel
        </div>
      </div>
    );
  }

  return (
    <div className={menuClass}>
      {!item.isDirectory && (
        <div
          className={itemClass}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `http://localhost:4000/file/${item.id}?action=download`;
            setActiveContextMenu(null);
          }}
        >
          Download
        </div>
      )}
      <div
        className={itemClass}
        onClick={(e) => {
          e.stopPropagation();
          openRenameModal(item.isDirectory ? "directory" : "file", item.id, item.name);
          setActiveContextMenu(null);
        }}
      >
        Rename
      </div>
      <div className={itemClass} onClick={handleToggleShare}>
        {isShared ? "Stop Sharing" : "Share"}
      </div>
      <div className={itemClass} onClick={handleToggleSpam}>
        {isSpam ? "Unmark as Spam" : "Mark as Spam"}
      </div>
      <div className={itemClass} onClick={handleToggleStarClick}>
        {isStarred ? "Remove Star" : "Add Star"}
      </div>
      <div className={`${itemClass} text-red-600`} onClick={handleMoveToTrash}>
        Move to Trash
      </div>
      <div className={itemClass} onClick={(e) => { e.stopPropagation(); openDetailsPopup(item); setActiveContextMenu(null); }}>
        Details
      </div>
    </div>
  );
}

export default ContextMenu;
