import React from "react";
import { Link } from "react-router-dom";
import {
  IconCloudFilled,
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandDiscord,
} from "@tabler/icons-react";

function LandingPageFooter() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-20 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#10b981] flex items-center justify-center text-white shadow-lg">
                <IconCloudFilled size={22} />
              </div>

              <span className="text-xl font-bold text-gray-800 dark:text-white">
                ApexVault
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-6 max-w-xs">
              Secure cloud storage to upload, organize, and share your files
              anytime from any device.
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-indigo-500 hover:text-white transition"
              >
                <IconBrandTwitter size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-indigo-500 hover:text-white transition"
              >
                <IconBrandGithub size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-indigo-500 hover:text-white transition"
              >
                <IconBrandLinkedin size={18} />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:bg-indigo-500 hover:text-white transition"
              >
                <IconBrandDiscord size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col items-center text-center gap-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Product
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-gray-500 hover:text-indigo-600"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#pricing"
                  className="text-gray-500 hover:text-indigo-600"
                >
                  Pricing
                </a>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-500 hover:text-indigo-600"
                >
                  How It Works
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-gray-500 hover:text-indigo-600"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center text-center gap-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Legal
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600">
                  Terms of Service
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 dark:border-zinc-800 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            © 2026 <span className="font-semibold">ApexVault</span>. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingPageFooter;
