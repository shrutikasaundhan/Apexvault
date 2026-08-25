import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, loginWithGithub } from "./api/authApi";
import { loginUser } from "./api/userApi";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaMoon, 
  FaSun, 
  FaCloud, 
  FaExclamationCircle,
  FaGithub
} from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "procodrr@gmail.com",
    password: "abcd",
  });
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const navigate = useNavigate();

  // Sync theme class with document root
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for GitHub OAuth redirect code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      // Clear code from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const processGithubLogin = async () => {
        try {
          setIsLoading(true);
          setServerError("");
          const data = await loginWithGithub(code);
          if (data.error) {
            setServerError(data.error);
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("GitHub Login error:", err);
          setServerError(err.response?.data?.error || "GitHub authentication failed.");
        } finally {
          setIsLoading(false);
        }
      };
      
      processGithubLogin();
    }
  }, [navigate]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await loginUser(formData);
      if (data.error) {
        setServerError(data.error);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = Boolean(serverError);
  const isSocialWarning = serverError && serverError.toLowerCase().includes("social login");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 transition-colors duration-300 p-6 overflow-hidden">
      {/* Animated fluid blobs */}
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none animate-pulse bg-gradient-to-br from-[#f59e0b] to-[#10b981] -top-24 -right-12"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none animate-pulse bg-gradient-to-br from-[#10b981] to-[#f59e0b] -bottom-24 -left-12"></div>

      {/* Floating Theme Button */}
      <button 
        className="absolute top-6 right-6 p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center w-9 h-9 z-10" 
        onClick={toggleTheme} 
        title="Toggle Theme"
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      {/* Glass Auth Card */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl z-10 text-left">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#10b981] rounded-2xl text-white text-2xl shadow shadow-emerald-100 dark:shadow-none mb-4">
            <FaCloud />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-1">Welcome Back</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">Please sign in to your account</p>
        </div>

        {/* Brand Warning / Error box */}
        {serverError && (
          <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold mb-5 ${
            isSocialWarning 
              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" 
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
          }`}>
            <FaExclamationCircle className="mt-0.5 shrink-0" style={{ display: "inline-block" }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="email" className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-11 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors ${
                  hasError ? "border-rose-400 dark:border-rose-900/40" : "border-gray-200 dark:border-zinc-800"
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="password" className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-11 pr-11 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors ${
                  hasError ? "border-rose-400 dark:border-rose-900/40" : "border-gray-200 dark:border-zinc-800"
                }`}
              />
              <button
                type="button"
                className="absolute right-4 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 text-sm cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Sign In Trigger */}
          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
          <span className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider bg-white dark:bg-zinc-900 px-3 absolute left-1/2 -translate-x-1/2">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
        </div>

        {/* Google OAuth button */}
        <div className="flex justify-center mb-3 mt-2">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const data = await loginWithGoogle(credentialResponse.credential);
                if (!data.error) navigate("/");
              } catch (err) {
                console.error("Google login failed:", err);
              }
            }}
            onError={() => console.log("Login Failed")}
            theme="outline"
            shape="rectangular"
            width="356"
          />
        </div>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGithubLogin}
          className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mb-6"
          disabled={isLoading}
        >
          <FaGithub className="text-xl" />
          <span>Continue with GitHub</span>
        </button>

        {/* Footer Link */}
        <div className="text-center text-xs text-gray-500 dark:text-zinc-400 font-semibold mt-4">
          Don't have an account?
          <Link className="text-[#059669] dark:text-[#10b981] hover:underline font-bold ml-1.5" to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
