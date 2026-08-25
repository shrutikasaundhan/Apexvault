import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../api/userApi";
import { FaMoon, FaSun } from "react-icons/fa";

function LandingNavbar({ activePage, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await fetchUser();
        setUser({
          name: data.name,
          email: data.email,
          initial: data.name ? data.name.charAt(0).toUpperCase() : "S",
        });
      } catch {
        setUser(null);
      }
    }
    checkAuth();
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800/80 sticky top 0 z-50 rounded-b-2xl shadow-sm">
      <div 
        className="flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] transition-transform" 
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#10b981] rounded-xl flex items-center justify-center text-white shadow shadow-emerald-100 dark:shadow-none">
          <i className="ti ti-cloud-filled text-2xl"></i>
        </div>
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-slate-700 dark:from-zinc-150 dark:to-zinc-400 bg-clip-text text-transparent">
          ApexVault
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500 dark:text-zinc-400">
        <a href="/#features" className={`hover:text-gray-900 dark:hover:text-zinc-100 transition-colors ${activePage === "features" ? "text-gray-900 font-bold dark:text-zinc-100" : ""}`}>Features</a>
        <a href="/how-it-works" className={`hover:text-gray-900 dark:hover:text-zinc-100 transition-colors ${activePage === "how-it-works" ? "text-gray-900 font-bold dark:text-zinc-100" : ""}`}>How It Works</a>
         <a href="/#pricing" className={`hover:text-gray-900 dark:hover:text-zinc-100 transition-colors ${activePage === "pricing" ? "text-gray-900 font-bold dark:text-zinc-100" : ""}`}>Pricing</a>
        <a href="/contact" className={`hover:text-gray-900 dark:hover:text-zinc-100 transition-colors ${activePage === "contact" ? "text-gray-900 font-bold dark:text-zinc-100" : ""}`}>Contact</a>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center text-sm w-9 h-9"
          title="Toggle Light/Dark Theme"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 hidden sm:inline">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow shadow-emerald-100 dark:shadow-none">
                {user.initial}
              </div>
            </div>
            <button 
              className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-gray-800 dark:bg-zinc-800 text-white hover:bg-gray-900 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              className="text-sm font-bold text-gray-700 dark:text-zinc-300 hover:text-[#059669] dark:hover:text-[#10b981] transition-colors cursor-pointer" 
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button 
              className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white hover:shadow-md cursor-pointer transition-all" 
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default LandingNavbar;
