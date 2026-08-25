import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import { FaSignOutAlt, FaSignInAlt, FaCloud, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { useDirectoryContext } from "../context/DirectoryContext";

function DirectoryHeader() {
  const context = useDirectoryContext();
  const contextMax = context ? context.maxStorageInBytes : undefined;
  const contextUsed = context ? context.usedStorageInBytes : undefined;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userPicture, setUserPicture] = useState("");
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(1073741824); // 1 GB
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (contextUsed !== undefined) setUsedStorageInBytes(contextUsed);
  }, [contextUsed]);

  useEffect(() => {
    if (contextMax !== undefined) setMaxStorageInBytes(contextMax);
  }, [contextMax]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const percentage = maxStorageInBytes > 0 ? (usedStorageInBytes / maxStorageInBytes) * 100 : 0;
  const barWidth = usedStorageInBytes > 0 ? Math.max(percentage, 2) : 0;

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name);
        setUserEmail(user.email);
        setUserPicture(user.picture || "");
        if (user.usedStorageInBytes !== undefined) {
          setUsedStorageInBytes(user.usedStorageInBytes);
        }
        if (user.maxStorageInBytes !== undefined) {
          setMaxStorageInBytes(user.maxStorageInBytes);
        }
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setUsedStorageInBytes(0);
        setMaxStorageInBytes(1073741824);
      }
    }
    loadUser();
  }, []);

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const initial = userName ? userName.charAt(0).toUpperCase() : "G";

  return (
    <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm mb-6">
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#10b981] rounded-xl flex items-center justify-center text-white text-xl shadow-md shadow-emerald-100 dark:shadow-none">
          <FaCloud />
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">ApexVault</span>
      </div>

      {/* Center Links */}
      <div className="hidden sm:flex items-center gap-8 text-sm font-semibold text-gray-500">
        <span onClick={() => navigate("/plans")} className="hover:text-blue-600 cursor-pointer transition-colors">Subscription</span>
        <span onClick={() => navigate("/share")} className="hover:text-blue-600 cursor-pointer transition-colors">Share</span>
      </div>

      {/* User Section & Theme Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer flex items-center justify-center text-sm w-9 h-9"
          title="Toggle Light/Dark Theme"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "light" ? <FaMoon className="text-gray-500 hover:text-gray-800" /> : <FaSun className="text-amber-500 hover:text-amber-600" />}
        </button>

        {/* User Section */}
        <div className="relative" ref={userMenuRef}>
          {loggedIn ? (
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={handleUserIconClick}
            >
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                  {userName}
                </span>
                <span className="text-xs text-gray-400 font-medium leading-tight">
                  {userEmail}
                </span>
              </div>

              {userPicture ? (
                <img
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                  src={userPicture}
                  alt={userName}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center text-lg font-bold shadow-sm hover:scale-105 transition-transform duration-200">
                  {initial}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-blue-100"
            >
              <FaSignInAlt /> Login
            </button>
          )}

          {/* User Menu Dropdown */}
          {showUserMenu && loggedIn && (
            <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl shadow-xl z-50 border border-gray-100 overflow-hidden py-1 transform origin-top-right transition-all duration-150">
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="font-bold text-gray-800 text-sm truncate">{userName}</div>
                <div className="text-xs text-gray-400 truncate mb-2">{userEmail}</div>
                <div className="flex flex-col text-xs mt-2">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  <div className="text-gray-500 font-medium mt-0.5">
                    {formatBytes(usedStorageInBytes)} of {formatBytes(maxStorageInBytes)} used
                  </div>
                </div>
              </div>

              <button
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-50"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/profile");
                }}
              >
                <FaUser className="text-[#10b981]" /> Profile Settings
              </button>

              <button
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-blue-500" /> Logout
              </button>
              <button
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                onClick={handleLogoutAll}
              >
                <FaSignOutAlt className="text-blue-500" /> Logout All Sessions
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;
