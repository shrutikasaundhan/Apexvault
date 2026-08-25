import { useState, useEffect } from "react";
import { useDirectoryContext } from "../context/DirectoryContext";
import { updateDirectoryShare } from "../api/directoryApi";
import { updateFileShare } from "../api/fileApi";
import { 
  FaTimes, 
  FaLink, 
  FaEnvelope, 
  FaUserCheck, 
  FaGlobe, 
  FaEye, 
  FaPencilAlt, 
  FaCopy, 
  FaCheck,
  FaUserCircle,
  FaTrash
} from "react-icons/fa";

export default function ShareModal({ item, onClose }) {
  const { 
    sharedIds = [], 
    setSharedIds 
  } = useDirectoryContext();

  const [activeTab, setActiveTab] = useState("link"); // "link" | "email" | "shared"
  const [permissionLevel, setPermissionLevel] = useState("viewer"); // "viewer" | "editor"
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  
  const [copied, setCopied] = useState(false);
  const [isShared, setIsShared] = useState(sharedIds.includes(item.id));
  
  // Track mock email invites sent during session
  const [collaborators, setCollaborators] = useState(() => {
    const key = `collabs_${item.id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  });

  const shareUrl = `${window.location.origin}/guest/access/${item.id}`;

  const handleToggleShare = async () => {
    const nextState = !isShared;
    setIsShared(nextState);
    
    // 1. Update localStorage array
    setSharedIds((prev) => {
      if (nextState) {
        if (!prev.includes(item.id)) return [...prev, item.id];
        return prev;
      } else {
        return prev.filter(id => id !== item.id);
      }
    });

    // 2. Save metadata for ShareDashboard
    try {
      const metadata = JSON.parse(localStorage.getItem("shared_items_metadata") || "{}");
      if (nextState) {
        metadata[item.id] = {
          id: item.id,
          name: item.name || item.filename,
          type: item.size !== undefined ? "file" : "directory",
          size: item.size || 0,
          createdAt: item.createdAt || new Date().toISOString()
        };
      } else {
        delete metadata[item.id];
      }
      localStorage.setItem("shared_items_metadata", JSON.stringify(metadata));
    } catch (err) {
      console.error(err);
    }

    // 3. Update MongoDB database persistently
    try {
      if (item.size !== undefined) {
        await updateFileShare(item.id, nextState);
      } else {
        await updateDirectoryShare(item.id, nextState);
      }
    } catch (err) {
      console.error("Error updating share on server:", err);
    }
  };

  const handleCopyLink = () => {
    if (!isShared) {
      // Auto enable share if copying link
      handleToggleShare();
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newCollab = {
      id: Date.now().toString(),
      email: inviteEmail.trim(),
      role: inviteRole,
      addedAt: new Date().toISOString()
    };

    const updated = [...collaborators, newCollab];
    setCollaborators(updated);
    localStorage.setItem(`collabs_${item.id}`, JSON.stringify(updated));
    setInviteEmail("");
    
    // Auto enable sharing if inviting
    if (!isShared) {
      handleToggleShare();
    }
    alert(`Invite sent to ${newCollab.email} as ${newCollab.role}!`);
  };

  const handleRemoveCollaborator = (id) => {
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    localStorage.setItem(`collabs_${item.id}`, JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden text-left animate-fade-in">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
              <FaUserCheck />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100">Share Document</h3>
              <p className="text-[11px] text-gray-450 dark:text-zinc-500 font-semibold">Collaborate with others</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors p-2 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded-xl cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20">
          <button 
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === "link" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-650"
            }`}
          >
            <FaLink />
            <span>Share Link</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === "email" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-650"
            }`}
          >
            <FaEnvelope />
            <span>Email Invite</span>
          </button>

          <button 
            onClick={() => setActiveTab("shared")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === "shared" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-650"
            }`}
          >
            <FaUserCheck />
            <span>Shared With ({collaborators.length + 1})</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="p-6">
          
          {/* TAB 1: Share Link */}
          {activeTab === "link" && (
            <div className="flex flex-col gap-5">
              {/* Toggle Box */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-850 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-blue-500 text-lg" />
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">Share with link</div>
                    <div className="text-[10px] text-gray-400 dark:text-zinc-550 font-semibold">Anyone with the link can access</div>
                  </div>
                </div>
                {/* Switch Toggle */}
                <button
                  onClick={handleToggleShare}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    isShared ? "bg-blue-600" : "bg-gray-200 dark:bg-zinc-800"
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                    isShared ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Permission Level Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider mb-2">Permission level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPermissionLevel("viewer")}
                    className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      permissionLevel === "viewer" 
                        ? "border-blue-600 bg-blue-50/30 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
                        : "border-gray-250 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850/50"
                    }`}
                  >
                    <FaEye />
                    <span>Viewer</span>
                  </button>
                  <button 
                    onClick={() => setPermissionLevel("editor")}
                    className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      permissionLevel === "editor" 
                        ? "border-blue-600 bg-blue-50/30 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
                        : "border-gray-250 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850/50"
                    }`}
                  >
                    <FaPencilAlt />
                    <span>Editor</span>
                  </button>
                </div>
              </div>

              {/* Share Link copy container */}
              <div>
                <label className="block text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider mb-2">Share link</label>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="text"
                    readOnly
                    value={isShared ? shareUrl : "Sharing is disabled. Enable switch above to activate link."}
                    className="flex-1 px-4 py-2.5 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-850 rounded-xl text-[11px] font-semibold text-gray-500 dark:text-zinc-400 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-100 dark:shadow-none transition-colors select-none min-w-[85px]"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Email Invite */}
          {activeTab === "email" && (
            <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-850 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                  placeholder="collaborator@example.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-850 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-750 shadow-sm transition-colors cursor-pointer"
              >
                Send Invite
              </button>
            </form>
          )}

          {/* TAB 3: Shared With list */}
          {activeTab === "shared" && (
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              
              {/* Item owner */}
              <div className="flex items-center justify-between p-3 bg-gray-50/30 dark:bg-zinc-950/10 border border-gray-150 dark:border-zinc-850/80 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
                    <FaUserCircle />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-850 dark:text-zinc-200">You</div>
                    <div className="text-[9px] text-gray-400 dark:text-zinc-550 font-semibold">Owner</div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mr-2">Owner</span>
              </div>

              {/* Shared with link */}
              {isShared && (
                <div className="flex items-center justify-between p-3 bg-gray-50/30 dark:bg-zinc-950/10 border border-gray-150 dark:border-zinc-850/80 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                      <FaGlobe />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-850 dark:text-zinc-200">Anyone with link</div>
                      <div className="text-[9px] text-gray-400 dark:text-zinc-550 font-semibold">Public access is active</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-2">
                    {permissionLevel}
                  </span>
                </div>
              )}

              {/* Invited collaborators */}
              {collaborators.map((collab) => (
                <div 
                  key={collab.id}
                  className="flex items-center justify-between p-3 bg-gray-50/30 dark:bg-zinc-950/10 border border-gray-150 dark:border-zinc-850/80 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                      <FaUserCircle />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-850 dark:text-zinc-200 truncate max-w-[150px]">{collab.email}</div>
                      <div className="text-[9px] text-gray-400 dark:text-zinc-550 font-semibold">Collaborator</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {collab.role}
                    </span>
                    <button 
                      onClick={() => handleRemoveCollaborator(collab.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                      title="Remove access"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
