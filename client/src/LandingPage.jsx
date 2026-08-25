import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "./api/userApi";
import LandingNavbar from "./components/LandingNavbar";

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { IconShieldLock, IconFolder, IconShare } from "@tabler/icons-react";
import LandingPageFooter from "./components/LandingPageFooter";

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

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

  // Fetch authentication status on mount
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
    <div
      className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans transition-colors duration-300 ${theme}`}
    >
      {/* NAVBAR */}
      <LandingNavbar theme={theme} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
          <span></span> ✦ Next-Generation Developer Storage
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight mb-6">
          The database-grade vault for{" "}
          <span className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent">
            high-performance engineering.
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8">
          Ditch slow, clunky storage. Upload nested directories instantly, share
          folders securely with team links, and search items with zero lag.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <button
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-lg shadow-emerald-100 dark:shadow-none hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(user ? "/dashboard" : "/register")}
          >
            Get Started <i className="ti ti-arrow-right"></i>
          </button>
          <button
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm"
            onClick={() => navigate("/plans")}
          >
            View pricing
          </button>
        </div>

        <img
          src="./heros.png"
          alt="ApexVault Hero"
          className="w-full max-w-5xl rounded-3xl shadow-lg border border-gray-200 dark:border-zinc-800"
        />
      </header>

      {/* FULL-WIDTH DYNAMIC CAROUSEL */}
      <section className="w-full border-t border-b border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 py-8">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <div className="flex flex-col md:flex-row items-center gap-8 px-8 py-12 max-w-5xl mx-auto text-left">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-lg mb-4">
                  Core Workspace
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
                  Zero-latency Cloud File Hub
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-405 leading-relaxed">
                  Instantly view, sort, and search raw directories, archives,
                  and binaries using our ultra-fast list layouts.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src="/file_hub.png"
                  alt="Core Workspace"
                  className="max-w-full h-auto rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="flex flex-col md:flex-row items-center gap-8 px-8 py-12 max-w-5xl mx-auto text-left">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-lg mb-4">
                  Collaborative
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
                  One-click Secure Sharing Links
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-405 leading-relaxed">
                  Deploy collaborative links with one tap, copy secure assets to
                  clipboard, and track file reads in real-time.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src="/secure_sharing.png"
                  alt="Collaborative Sharing"
                  className="max-w-full h-auto rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="flex flex-col md:flex-row items-center gap-8 px-8 py-12 max-w-5xl mx-auto text-left">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-lg mb-4">
                  Smart Tracking
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
                  Granular Quarantine & Star Filters
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-405 leading-relaxed">
                  Isolate suspicious spam documents, highlight mission-critical
                  assets, and restore deleted folders on demand.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src="/smart_tracking.png"
                  alt="Smart Tracking"
                  className="max-w-full h-auto rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ADDITIONAL SECTIONS (FEATURES & PRICING) */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-12">
          Powerful features for your digital storage
        </h2>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Secure Storage */}
          <div
            className="flex flex-col items-center text-center p-6 
        bg-white dark:bg-zinc-900 
        border border-gray-200 dark:border-zinc-800 
        rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="
          w-12 h-12 rounded-2xl 
          bg-indigo-50 dark:bg-indigo-950/20 
          text-indigo-600 dark:text-indigo-400 
          flex items-center justify-center mb-4"
            >
              <IconShieldLock size={28} stroke={2} />
            </div>

            <h3
              className="
          text-base font-bold 
          text-gray-800 dark:text-zinc-200 mb-2"
            >
              Secure File Storage
            </h3>

            <p
              className="
          text-xs text-gray-500 
          dark:text-zinc-400 
          leading-relaxed font-semibold"
            >
              Store your important files securely with encrypted cloud storage
              and access them anytime, anywhere.
            </p>
          </div>

          {/* File Management */}
          <div
            className="flex flex-col items-center text-center p-6 
        bg-white dark:bg-zinc-900 
        border border-gray-200 dark:border-zinc-800 
        rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="
          w-12 h-12 rounded-2xl 
          bg-indigo-50 dark:bg-indigo-950/20 
          text-indigo-600 dark:text-indigo-400 
          flex items-center justify-center mb-4"
            >
              <IconFolder size={28} stroke={2} />
            </div>

            <h3
              className="
          text-base font-bold 
          text-gray-800 dark:text-zinc-200 mb-2"
            >
              Smart File Management
            </h3>

            <p
              className="
          text-xs text-gray-500 
          dark:text-zinc-400 
          leading-relaxed font-semibold"
            >
              Organize files with folders, search quickly, and manage documents
              effortlessly.
            </p>
          </div>

          {/* Sharing */}
          <div
            className="flex flex-col items-center text-center p-6 
        bg-white dark:bg-zinc-900 
        border border-gray-200 dark:border-zinc-800 
        rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="
          w-12 h-12 rounded-2xl 
          bg-indigo-50 dark:bg-indigo-950/20 
          text-indigo-600 dark:text-indigo-400 
          flex items-center justify-center mb-4"
            >
              <IconShare size={28} stroke={2} />
            </div>

            <h3
              className="
          text-base font-bold 
          text-gray-800 dark:text-zinc-200 mb-2"
            >
              Secure File Sharing
            </h3>

            <p
              className="
          text-xs text-gray-500 
          dark:text-zinc-400 
          leading-relaxed font-semibold"
            > 
              Share files securely with customizable permissions and controlled
              access.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="sms-pricing py-16">
        <h2 className="section-title text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12 bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent">
          Flexible Pricing Plans
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 items-stretch max-w-5xl mx-auto px-4">
          {/* Starter Plan */}
          <div className="relative flex flex-col rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                  Starter
                </h3>
                <span className="text-[10px] font-extrabold border bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150 rounded-lg px-2.5 py-0.5 tracking-wide uppercase">
                  2 TB
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">
                Great for individuals
              </p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-6">
              <span className="text-lg font-bold text-gray-800 dark:text-zinc-200">
                ₹
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-zinc-100">
                199
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold ml-1">
                / month
              </span>
            </div>
            <ul className="mb-8 space-y-3.5 flex-1 text-xs text-gray-600 dark:text-zinc-400 font-semibold font-sans text-left">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Secure cloud storage</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Link & folder sharing</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Basic support</span>
              </li>
            </ul>
            <button
              onClick={() => navigate(user ? "/plans" : "/register")}
              className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white hover:shadow-md cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-amber-500 ring-2 ring-amber-500/10 dark:ring-amber-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#f59e0b] to-[#10b981] text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm animate-pulse">
              Most Popular
            </span>
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                  Pro
                </h3>
                <span className="text-[10px] font-extrabold border bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-150 rounded-lg px-2.5 py-0.5 tracking-wide uppercase">
                  5 TB
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">
                For creators & devs
              </p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-6">
              <span className="text-lg font-bold text-gray-800 dark:text-zinc-200">
                ₹
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-zinc-100">
                399
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold ml-1">
                / month
              </span>
            </div>
            <ul className="mb-8 space-y-3.5 flex-1 text-xs text-gray-600 dark:text-zinc-400 font-semibold font-sans text-left">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Everything in Starter</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Priority uploads</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Email support</span>
              </li>
            </ul>
            <button
              onClick={() => navigate(user ? "/plans" : "/register")}
              className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>

          {/* Ultimate Plan */}
          <div className="relative flex flex-col rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                  Ultimate
                </h3>
                <span className="text-[10px] font-extrabold border bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-150 rounded-lg px-2.5 py-0.5 tracking-wide uppercase">
                  10 TB
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">
                Teams & power users
              </p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-6">
              <span className="text-lg font-bold text-gray-800 dark:text-zinc-200">
                ₹
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-zinc-100">
                699
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold ml-1">
                / month
              </span>
            </div>
            <ul className="mb-8 space-y-3.5 flex-1 text-xs text-gray-600 dark:text-zinc-400 font-semibold font-sans text-left">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Version history</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500 text-sm font-bold">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => navigate(user ? "/plans" : "/register")}
              className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white hover:shadow-md cursor-pointer"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <LandingPageFooter />
    </div>
  );
}

export default LandingPage;
