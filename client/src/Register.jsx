import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, loginWithGithub, sendOtp, verifyOtp } from "./api/authApi";
import { registerUser } from "./api/userApi";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaKey, 
  FaArrowLeft, 
  FaExclamationCircle, 
  FaCheckCircle,
  FaMoon, 
  FaSun,
  FaCloud,
  FaGithub
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [otpError, setOtpError] = useState("");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // GitHub Code Listener
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const processGithubLogin = async () => {
        try {
          setIsSuccess(true);
          setServerError("");
          const data = await loginWithGithub(code);
          if (data.error) {
            setServerError(data.error);
            setIsSuccess(false);
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("GitHub Register error:", err);
          setServerError(err.response?.data?.error || "GitHub authentication failed.");
          setIsSuccess(false);
        }
      };
      
      processGithubLogin();
    }
  }, [navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/register`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setOtpError("Please enter your email first.");
    if (!formData.name) return setOtpError("Please enter your name first.");
    try {
      setIsSending(true);
      setOtpError("");
      setServerError("");
      await sendOtp(formData.email);
      setOtpSent(true);
      setCountdown(60);
      setOtp("");
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError("Please enter OTP.");
    try {
      setIsVerifying(true);
      setOtpError("");
      await verifyOtp(formData.email, otp);
      setOtpVerified(true);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setServerError("Please verify your email first.");
    try {
      setIsSuccess(true);
      setServerError("");
      
      const data = await registerUser({ ...formData, otp });
      if (data.error) {
        setServerError(data.error);
        setIsSuccess(false);
      } else {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setServerError(err.response?.data?.error || "Something went wrong.");
      setIsSuccess(false);
    }
  };

  const handleGoBack = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setOtpError("");
    setServerError("");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 transition-colors duration-300 p-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none animate-pulse bg-gradient-to-br from-[#f59e0b] to-[#10b981] -top-24 -right-12"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none animate-pulse bg-gradient-to-br from-[#10b981] to-[#f59e0b] -bottom-24 -left-12"></div>

      {/* Floating Theme Toggle */}
      <button 
        className="absolute top-6 right-6 p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center w-9 h-9 z-10" 
        onClick={toggleTheme} 
        title="Toggle Theme"
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      {/* Glass Card */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl z-10 text-left">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#10b981] rounded-2xl text-white text-2xl shadow shadow-emerald-100 dark:shadow-none mb-4">
            <FaCloud />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-1">Create Account</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">Join ApexVault to store files securely</p>
        </div>

        {/* Visual Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
            !otpSent 
              ? "border-emerald-500 text-[#059669] dark:text-[#10b981] bg-slate-50 dark:bg-zinc-950" 
              : "bg-emerald-500 border-emerald-500 text-white"
          }`}>1</div>
          <div className={`w-10 h-0.5 transition-all ${otpSent ? "bg-emerald-500" : "bg-gray-200 dark:bg-zinc-850"}`}></div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
            otpSent 
              ? "border-emerald-500 text-[#059669] dark:text-[#10b981] bg-slate-50 dark:bg-zinc-950" 
              : "border-gray-200 dark:border-zinc-850 text-gray-400"
          }`}>2</div>
        </div>

        {/* Server Success */}
        {isSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold mb-5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <FaCheckCircle className="mt-0.5 shrink-0" style={{ display: "inline-block" }} />
            <span>Registration successful! Redirecting...</span>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold mb-5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <FaExclamationCircle className="mt-0.5 shrink-0" style={{ display: "inline-block" }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Name and Email */}
          {!otpSent && (
            <div>
              {/* Name */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Full Name</label>
                <div className="relative flex items-center">
                  <FaUser className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <FaEnvelope className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {otpError && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold mb-4 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                  <FaExclamationCircle className="shrink-0 mt-0.5" style={{ display: "inline-block" }} />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Send Verification Code */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || !formData.email || !formData.name}
                className="w-full py-3.5 mt-2 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending code...</span>
                  </>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: OTP verification & password setup */}
          {otpSent && (
            <div>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex items-center gap-1.5 text-xs text-teal-650 hover:text-teal-700 dark:text-teal-405 dark:hover:text-teal-300 font-bold mb-4 transition-colors bg-none border-none p-0 cursor-pointer"
              >
                <FaArrowLeft /> Edit Email ({formData.email})
              </button>

              {/* Verification Code */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Enter Verification Code</label>
                <div className="flex gap-2.5 items-center w-full">
                  <div className="relative flex items-center flex-grow">
                    <FaKey className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="4-digit code"
                      value={otp}
                      disabled={otpVerified}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-11 pr-3 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otpVerified || otp.length < 4}
                    className="h-10 px-4 bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] text-white border-none rounded-xl text-xs font-bold cursor-pointer transition-transform flex items-center justify-center min-w-[80px]"
                  >
                    {isVerifying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : otpVerified ? (
                      "Verified"
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>

                {/* Resend Action */}
                {!otpVerified && (
                  <div className="text-right mt-2">
                    {countdown > 0 ? (
                      <span className="text-xs text-stone-550 dark:text-stone-400">
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSending}
                        className="text-xs text-teal-650 hover:text-teal-700 dark:text-teal-405 dark:hover:text-teal-300 font-bold underline bg-none border-none p-0 cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                )}
              </div>

              {otpError && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold mb-4 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                  <FaExclamationCircle className="shrink-0 mt-0.5" style={{ display: "inline-block" }} />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Password - dynamic slide open after OTP is verified */}
              <div 
                className="transition-all duration-350 ease-in-out overflow-hidden"
                style={{ 
                  maxHeight: otpVerified ? "120px" : "0px",
                  opacity: otpVerified ? 1 : 0,
                  pointerEvents: otpVerified ? "auto" : "none"
                }}
              >
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Choose Password</label>
                  <div className="relative flex items-center">
                    <FaLock className="absolute left-4 text-gray-400 dark:text-zinc-500 text-sm" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={otpVerified}
                      placeholder="Minimum 4 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
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
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f59e0b] to-[#10b981] hover:from-[#d97706] hover:to-[#059669] shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={!otpVerified || isSuccess}
              >
                {isSuccess ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Account Created!</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>
          )}
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
          <span className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider bg-white dark:bg-zinc-900 px-3 absolute left-1/2 -translate-x-1/2">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
        </div>

        {/* Google OAuth signup */}
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
          disabled={isSending || isVerifying || isSuccess}
        >
          <FaGithub className="text-xl" />
          <span>Continue with GitHub</span>
        </button>

        {/* Footer Swap Link */}
        <div className="text-center text-xs text-gray-500 dark:text-zinc-400 font-semibold mt-4">
          Already have an account?
          <Link to="/login" className="text-[#059669] dark:text-[#10b981] hover:underline font-bold ml-1.5">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
