import { useState, useEffect } from "react";
import LandingNavbar from "./components/LandingNavbar";
import LandingPageFooter from "./components/LandingPageFooter";
import { IconCircleCheckFilled } from "@tabler/icons-react";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
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
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors duration-300`}
    >
      {/* Navbar */}
      <LandingNavbar
        activePage="contact"
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Hero */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Contact Us
          </h1>

          <p className="mt-5 text-gray-600 dark:text-zinc-400 leading-7">
            Have questions, feedback, or need support? We'd love to hear from
            you. Fill out the form below and our team will get back to you as
            soon as possible.
          </p>

        </div>
      </section>

      {/* Contact Form */}
      <section className=" px-6">

        <div className="max-w-md mx-auto">

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-lg p-5">

            {submitted ? (
              <div className="flex flex-col items-center text-center py-10">

                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-5">

                  <IconCircleCheckFilled
                    size={38}
                    className="text-emerald-600"
                  />

                </div>

                <h2 className="text-2xl font-bold mb-2">
                  Message Sent!
                </h2>

                <p className="text-gray-500 dark:text-zinc-400">
                  Thank you for contacting us. We'll get back to you shortly.
                </p>

              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>

                  <label className="block mb-2 text-sm font-semibold">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

                <div>

                  <label className="block mb-2 text-sm font-semibold">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

                <div>

                  <label className="block mb-2 text-sm font-semibold">
                    Message
                  </label>

                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write your message..."
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-semibold py-3 hover:opacity-90 transition"
                >
                  Send Message
                </button>

              </form>
            )}

          </div>

        </div>

      </section>

      {/* Footer */}
      <LandingPageFooter />
    </div>
  );
}

export default ContactPage;