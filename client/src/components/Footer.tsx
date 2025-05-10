import React from "react";
import { Link } from "wouter";
import { CloudSun } from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <CloudSun className="text-primary text-2xl mr-2" />
              <h2 className="text-xl font-bold font-roboto text-primary">WeatherNow</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center md:text-left">
              Providing accurate weather data since 2025
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-primary"
            >
              <FaTwitter className="text-xl" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-primary"
            >
              <FaFacebook className="text-xl" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-primary"
            >
              <FaInstagram className="text-xl" />
            </a>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <nav className="mb-4 md:mb-0">
              <ul className="flex flex-wrap justify-center md:justify-start space-x-4 text-sm">
                <li>
                  <Link href="/about">
                    <a className="text-gray-500 hover:text-primary">About</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className="text-gray-500 hover:text-primary">Contact</a>
                  </Link>
                </li>
                <li>
                  <Link href="/api">
                    <a className="text-gray-500 hover:text-primary">API</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <a className="text-gray-500 hover:text-primary">Terms</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a className="text-gray-500 hover:text-primary">Privacy</a>
                  </Link>
                </li>
              </ul>
            </nav>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">
              © {new Date().getFullYear()} WeatherNow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
