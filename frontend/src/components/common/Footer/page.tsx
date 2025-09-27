import React from "react";
import { Mail, Send } from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF
} from "react-icons/fa6";
import Logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#f9f9f8] text-gray-800 border-t border-gray-200">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={Logo.src}
            alt="Zimongo"
            className="h-16 w-16"
          />
          <span className="text-2xl font-bold tracking-tight text-amber-500">
            Zimongo
          </span>
        </div>

        {/* Email Subscribe */}
        <div className="flex items-center w-full max-w-xs mx-auto lg:mx-0">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="Your email"
              className="w-full pl-9 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-4">About</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>About Us</li>
            <li>Features</li>
            <li>New</li>
            <li>Careers</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>Our Team</li>
            <li>Partner with Us</li>
            <li>FAQ</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Support</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>Account</li>
            <li>Support Center</li>
            <li>Feedback</li>
            <li>Contact Us</li>
            <li>Accessibility</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Social Media</h3>
          <div className="flex items-center space-x-5 text-orange-500">
            <a href="#"><FaInstagram className="h-5 w-5 hover:text-orange-600" /></a>
            <a href="#"><FaXTwitter className="h-5 w-5 hover:text-orange-600" /></a>
            <a href="#"><FaFacebookF className="h-5 w-5 hover:text-orange-600" /></a>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
        © 2025 Zimongo, Copyright and All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
