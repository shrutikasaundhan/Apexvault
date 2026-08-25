import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import { 
  FaShareAlt, 
  FaUsers, 
  FaUserCircle, 
  FaClock, 
  FaArrowRight, 
  FaSlidersH,
  FaCog,
  FaChartLine,
  FaFilePdf,
  FaFolder,
  FaRegFile,
  FaCopy,
  FaExternalLinkAlt
} from "react-icons/fa";

export default function ShareDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const [sharedByMeCount, setSharedByMeCount] = useState(0);
  const [sharedByMeItems, setSharedByMeItems] = useState([]);
  
  // Simulated stats
  const sharedWithMeCount = 1;
  const collaboratorsCount = 1;

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load shared items dynamically from localStorage
  useEffect(() => {
    const loadSharedItems = () => {
      try {
        const sharedIds = JSON.parse(localStorage.getItem("sharedIds") || "[]");
        const trashIds = JSON.parse(localStorage.getItem("trashIds") || "[]");
        const metadata = JSON.parse(localStorage.getItem("shared_items_metadata") || "{}");
        
        // Filter out deleted items
        const activeIds = sharedIds.filter(id => !trashIds.includes(id));
        const items = activeIds
          .map(id => metadata[id])
          .filter(Boolean);
          
        setSharedByMeCount(activeIds.length);
        setSharedByMeItems(items);
      } catch (err) {
        console.error("Error loading shared items:", err);
      }
    };
    
    loadSharedItems();
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleCopyLink = (itemId) => {
    const shareLink = `${window.location.origin}/file/${itemId}`;
    navigator.clipboard.writeText(shareLink);
    alert("Share link copied to clipboard!");
  };

  // Mock item for Shared With Me
  const mockSharedWithMeItem = {
    id: "mock-pdf-1",
    name: "team-roadmap-2026.pdf",
    type: "file",
    size: 4718592, // 4.5 MB
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    owner: "alex@apexvault.io"
  };

  const allRecentActivity = [
    ...sharedByMeItems.map(item => ({ ...item, direction: "outgoing" })),
    { ...mockSharedWithMeItem, direction: "incoming" }
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="pt-4">
          <DirectoryHeader />
        </div>

        {/* Dashboard Title Section */}
        <div className="max-w-6xl mx-auto mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
              File Sharing Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold">
              Manage your shared files and collaborations seamlessly
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-550 font-bold self-start md:self-center">
            <FaChartLine />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Grid Stats Cards */}
        <div className="max-w-6xl mx-auto mt-6 grid gap-6 grid-cols-1 md:grid-cols-3 text-left">
          
          {/* Card 1: Shared With Me */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                  <FaShareAlt />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Shared With Me</h3>
                  <p className="text-[11px] text-gray-450 dark:text-zinc-550 font-semibold mt-0.5">Files others have shared</p>
                </div>
              </div>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{sharedWithMeCount}</span>
            </div>
            
            <button 
              onClick={() => navigate("/dashboard?tab=shared")}
              className="mt-6 w-full py-2.5 px-4 bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View All Files</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          </div>

          {/* Card 2: Shared By Me */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                  <FaUsers />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Shared By Me</h3>
                  <p className="text-[11px] text-gray-450 dark:text-zinc-550 font-semibold mt-0.5">Files you've shared</p>
                </div>
              </div>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{sharedByMeCount}</span>
            </div>

            <button 
              onClick={() => navigate("/dashboard?tab=shared")}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-50/50 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Files</span>
              <FaSlidersH className="text-[10px]" />
            </button>
          </div>

          {/* Card 3: Collaborators */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
                  <FaUserCircle />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">Collaborators</h3>
                  <p className="text-[11px] text-gray-450 dark:text-zinc-550 font-semibold mt-0.5">People you work with</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{collaboratorsCount}</span>
                <span className="text-[9px] font-extrabold text-[#059669] dark:text-emerald-400 mt-0.5 uppercase tracking-wide">Active users</span>
              </div>
            </div>

            <div className="mt-6 py-2.5 px-4 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10 text-xs font-bold border border-dashed border-emerald-200 dark:border-emerald-900/30 rounded-xl">
              1 Active collaborator (alex@apexvault.io)
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="max-w-6xl mx-auto mt-8 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-250">Recent Activity</h2>
              <p className="text-[11px] text-gray-450 dark:text-zinc-500 font-semibold mt-0.5">Your latest shared files and collaborations</p>
            </div>

            {/* Dynamic Activity List */}
            {allRecentActivity.length > 0 ? (
              <div className="flex flex-col gap-3">
                {allRecentActivity.map((item) => (
                  <div 
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50/50 dark:bg-zinc-950/20 border border-gray-150 dark:border-zinc-850 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-lg shadow-sm">
                        {item.type === "directory" ? (
                          <FaFolder className="text-amber-500" />
                        ) : item.name.endsWith(".pdf") ? (
                          <FaFilePdf className="text-rose-500" />
                        ) : (
                          <FaRegFile className="text-blue-500" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-gray-850 dark:text-zinc-200">{item.name}</div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-450 dark:text-zinc-500 font-semibold mt-0.5">
                          <span>{item.type === "directory" ? "Folder" : formatBytes(item.size)}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          {item.direction === "incoming" ? (
                            <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">Shared with me by {item.owner}</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">Shared by me</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {item.direction === "outgoing" && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleCopyLink(item.id)}
                          className="p-2 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-850 text-gray-650 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                          title="Copy Share Link"
                        >
                          <FaCopy />
                          <span className="text-[10px]">Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-950 text-gray-300 dark:text-zinc-800 flex items-center justify-center text-2xl shadow-inner mb-4">
                  <FaClock />
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-zinc-250 mb-1">No recent activity</h3>
                <p className="text-xs text-gray-450 dark:text-zinc-500 font-semibold max-w-sm leading-relaxed">
                  Your shared files and collaborations will appear here once you start sharing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="max-w-6xl mx-auto mt-8 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-250">Quick Actions</h2>
              <p className="text-[11px] text-gray-450 dark:text-zinc-550 font-semibold mt-0.5">Common tasks to manage your files</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row 1: View Shared Files */}
              <div 
                onClick={() => navigate("/dashboard?tab=shared")}
                className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base">
                    <FaShareAlt />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">View Shared Files</h4>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-550 font-semibold font-medium">Access files others have shared with you</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-400 dark:text-zinc-650 text-xs mr-2" />
              </div>

              {/* Row 2: Manage Sharing */}
              <div 
                onClick={() => navigate("/dashboard?tab=shared")}
                className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-gray-100 dark:border-zinc-850 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base">
                    <FaCog />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">Manage Sharing</h4>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-550 font-semibold font-medium">Control access permissions for your files</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-400 dark:text-zinc-650 text-xs mr-2" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
