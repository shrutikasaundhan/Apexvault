import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "./components/LandingNavbar";
import LandingPageFooter from "./components/LandingPageFooter";

function HowItWorksPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

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

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans transition-colors duration-300 ${theme}`}>
      {/* NAVBAR */}
      <LandingNavbar activePage="how-it-works" theme={theme} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight mb-6">
          Deploy in three{" "}
          <span className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent">
            simple steps.
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8">
          Get your files cloud-synced and ready. Sign up, drag and drop directories, and generate instant encrypted sharing access.
        </p>
      </section>

      {/* STEPS LIST */}
      <div className="max-w-3xl mx-auto px-6 flex flex-col gap-8 mb-20">
        
        {/* Step 1 */}
        <div className="flex gap-6 items-start text-left p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-[#f59e0b] to-[#10b981] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow shadow-emerald-100 dark:shadow-none">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2">Create Your Workspace</h3>
            <p className="text-sm text-gray-505 dark:text-zinc-400 leading-relaxed font-semibold">
              Sign up instantly using your email address or Google authentication. 
              ApexVault automatically provisions a secure personal root storage folder linked to your user account profile with 20 GB of free space.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-6 items-start text-left p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-[#f59e0b] to-[#10b981] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow shadow-emerald-100 dark:shadow-none">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2">Upload Files & Folders</h3>
            <p className="text-sm text-gray-505 dark:text-zinc-400 leading-relaxed font-semibold">
              Drag and drop individual files, multiple assets, or nested folder directories straight from your desktop. 
              You can also click the Google Drive option to import files directly into your workspace.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-6 items-start text-left p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-[#f59e0b] to-[#10b981] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow shadow-emerald-100 dark:shadow-none">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2">Organize & Star</h3>
            <p className="text-sm text-gray-505 dark:text-zinc-400 leading-relaxed font-semibold">
              Toggle the Star icon on important files to easily access them inside the Starred category. 
              Search instantly using the real-time search bar, or sort items by name, file size, or modifications date.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-6 items-start text-left p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-[#f59e0b] to-[#10b981] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow shadow-emerald-100 dark:shadow-none">
            4
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2">Secure Collaborative Sharing</h3>
            <p className="text-sm text-gray-505 dark:text-zinc-400 leading-relaxed font-semibold">
              Right-click any folder or file to trigger the Context Menu. 
              Select "Share" to automatically copy a secure retrieval link to your clipboard. 
              You can revoke sharing links, move items to Trash, or label suspicious items as Spam at any time.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <LandingPageFooter />
    </div>
  );
}

export default HowItWorksPage;
