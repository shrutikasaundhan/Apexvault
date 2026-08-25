import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser, logoutUser as logoutUserApi, logoutAllSessions as logoutAllSessionsApi } from "./api/userApi";
import DirectoryHeader from "./components/DirectoryHeader";
import { 
  FaCloud, 
  FaDatabase, 
  FaUser, 
  FaLock, 
  FaSignOutAlt, 
  FaBan, 
  FaTrash, 
  FaCamera, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function ProfilePage() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  
  const [usedStorage, setUsedStorage] = useState(0);
  const [maxStorage, setMaxStorage] = useState(1073741824); // Default 1 GB
  
  const [editedName, setEditedName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notification, setNotification] = useState("");
  const [errorNotification, setErrorNotification] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await fetchUser();
        setUserName(data.name || "Guest User");
        setUserEmail(data.email || "guest@example.com");
        setEditedName(data.name || "");
        setUserPicture(data.picture || "");
        setUserInitial(data.name ? data.name.charAt(0).toUpperCase() : "U");
        
        if (data.usedStorageInBytes !== undefined) {
          setUsedStorage(data.usedStorageInBytes);
        }
        if (data.maxStorageInBytes !== undefined) {
          setMaxStorage(data.maxStorageInBytes);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        navigate("/login");
      }
    }
    loadUserData();
  }, [navigate]);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const percentage = maxStorage > 0 ? (usedStorage / maxStorage) * 100 : 0;
  const barWidth = usedStorage > 0 ? Math.max(percentage, 2) : 0;

  // Handle Avatar Image Upload (convert to base64)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      triggerError("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      localStorage.setItem("simulated_picture", base64String);
      setUserPicture(base64String);
      triggerSuccess("Profile picture uploaded successfully! Refreshes dashboard logo.");
    };
    reader.readAsDataURL(file);
  };

  // Update Profile details
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!editedName.trim()) {
      triggerError("Name cannot be empty.");
      return;
    }
    localStorage.setItem("simulated_name", editedName);
    setUserName(editedName);
    setUserInitial(editedName.charAt(0).toUpperCase());
    triggerSuccess("Profile updated successfully!");
  };

  // Set manual password
  const handleSetPassword = (e) => {
    e.preventDefault();
    if (password.length < 4) {
      triggerError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      triggerError("Passwords do not match.");
      return;
    }
    triggerSuccess("Manual password set successfully!");
    setPassword("");
    setConfirmPassword("");
  };

  // Logout current session
  const handleLogout = async () => {
    try {
      await logoutUserApi();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  // Logout all sessions
  const handleLogoutAll = async () => {
    try {
      await logoutAllSessionsApi();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSuccess = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const triggerError = (msg) => {
    setErrorNotification(msg);
    setTimeout(() => setErrorNotification(""), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="pt-4">
          <DirectoryHeader />
        </div>

        {/* Central Notification Toasts */}
        {notification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg text-xs font-bold animate-bounce">
            <FaCheckCircle className="text-sm" />
            <span>{notification}</span>
          </div>
        )}
        {errorNotification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl shadow-lg text-xs font-bold animate-bounce">
            <FaExclamationTriangle className="text-sm" />
            <span>{errorNotification}</span>
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-8 flex flex-col gap-8 text-left">
          
          {/* 1. Storage Usage Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
              <FaDatabase className="text-blue-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Storage Usage</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                  {formatBytes(usedStorage)} of {formatBytes(maxStorage)} used
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full px-2.5 py-0.5">
                  {percentage.toFixed(2)}% used
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-3">
                <span className="text-sm">✓</span>
                <span>Storage is healthy</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>

            {/* Split Storage Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-100 dark:border-zinc-850 p-4 rounded-2xl">
                <div className="text-[10px] text-gray-450 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Used Space</div>
                <div className="text-sm font-bold text-gray-850 dark:text-zinc-100">{formatBytes(usedStorage)}</div>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-100 dark:border-zinc-850 p-4 rounded-2xl">
                <div className="text-[10px] text-gray-450 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Available Space</div>
                <div className="text-sm font-bold text-gray-850 dark:text-zinc-100">{formatBytes(maxStorage - usedStorage)}</div>
              </div>
            </div>
          </div>

          {/* 2. Profile Settings Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
              <FaUser className="text-emerald-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Profile Settings</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
              {/* Profile Image Picker */}
              <div>
                <label className="block text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {userPicture ? (
                    <img 
                      className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" 
                      src={userPicture} 
                      alt="Profile" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                      {userInitial}
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 cursor-pointer">
                      <FaCamera />
                      <span>Upload New Picture</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">JPG, PNG or GIF. Max size 2MB.</span>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-850/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl text-xs font-semibold text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Email cannot be changed once set.</span>
              </div>

              <div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-gray-800 hover:bg-gray-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white shadow-sm cursor-pointer"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* 3. Connected Account Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
              <FaCloud className="text-indigo-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Connected Account</h2>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between gap-4 p-4 bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-100 dark:border-zinc-850 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-150 flex items-center justify-center shadow-sm">
                    <img className="w-4 h-4 object-contain" src="https://www.google.com/favicon.ico" alt="Google" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">Google</div>
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">{userEmail}</div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                  Connected
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">
                Only one social account can be connected at a time. This account is used for authentication.
              </p>
            </div>
          </div>

          {/* 4. Set Password for Manual Login */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
              <FaLock className="text-amber-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Set Password for Manual Login</h2>
            </div>
            
            <p className="text-xs text-gray-450 dark:text-zinc-400 mb-6 font-semibold">
              Set a password to enable manual login in addition to your social login.
            </p>

            <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Minimum 4 characters"
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 text-sm cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 text-sm cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>

          {/* 5. Logout Options Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
              <FaSignOutAlt className="text-orange-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Logout Options</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Current device */}
              <div className="flex flex-col justify-between p-5 bg-gray-50/30 dark:bg-zinc-950/10 border border-gray-150 dark:border-zinc-850 rounded-2xl text-center">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-base">
                    <FaSignOutAlt />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">Current Device</h4>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Logout from this device only</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-750 transition-colors shadow-sm cursor-pointer"
                >
                  Logout
                </button>
              </div>

              {/* All devices */}
              <div className="flex flex-col justify-between p-5 bg-gray-50/30 dark:bg-zinc-950/10 border border-gray-150 dark:border-zinc-850 rounded-2xl text-center">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 flex items-center justify-center text-base">
                    <FaSignOutAlt />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">All Devices</h4>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Logout from all devices</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogoutAll}
                  className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-750 transition-colors shadow-sm cursor-pointer"
                >
                  Logout All
                </button>
              </div>
            </div>
          </div>

          {/* 6. Disable My Account */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
              <FaBan className="text-yellow-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Disable My Account</h2>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-xs text-amber-700 dark:text-amber-400 font-semibold">
                <FaExclamationTriangle className="text-sm mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold mb-1 text-gray-850 dark:text-zinc-200">This action is temporary and can be reversed.</div>
                  Disabling your account will hide your profile and stop all email or app notifications. Your data will be retained securely and can be restored anytime by contacting our support team.
                </div>
              </div>
              <div>
                <button 
                  onClick={() => alert("Simulating Account Disablement. To reactivate, sign in again.")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer"
                >
                  Disable Account
                </button>
              </div>
            </div>
          </div>

          {/* 7. Delete My Account */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-5">
              <FaTrash className="text-rose-500 text-lg" />
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">Delete My Account</h2>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-xs text-rose-700 dark:text-rose-450 font-semibold">
                <FaExclamationTriangle className="text-sm mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold mb-1 text-gray-850 dark:text-zinc-200">This action cannot be undone</div>
                  Deleting your account will permanently remove all your data, files, and settings. You will lose access to all connected services and this action cannot be undone.
                </div>
              </div>
              <div>
                <button 
                  onClick={() => {
                    const confirmDel = confirm("Are you sure you want to permanently delete your account? This will wipe your folders.");
                    if (confirmDel) {
                      localStorage.clear();
                      navigate("/");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
