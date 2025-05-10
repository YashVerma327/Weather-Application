import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "./ThemeToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CloudSun, Menu, User, UserCircle, ChevronDown } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <CloudSun className="text-primary text-3xl mr-2" />
          <Link href="/">
            <a className="text-2xl font-bold font-roboto text-primary">WeatherNow</a>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/">
                  <a className={`hover:text-primary ${location === "/" ? "font-medium text-primary" : ""}`}>
                    Dashboard
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/maps">
                  <a className={`hover:text-primary ${location === "/maps" ? "font-medium text-primary" : ""}`}>
                    Maps
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/alerts">
                  <a className={`hover:text-primary ${location === "/alerts" ? "font-medium text-primary" : ""}`}>
                    Alerts
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className={`hover:text-primary ${location === "/settings" ? "font-medium text-primary" : ""}`}>
                    Settings
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <UserCircle className="text-gray-600 dark:text-gray-300 h-5 w-5" />
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem className="font-semibold">{user.username}</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth">
                      <a className="w-full">Sign In</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth">
                      <a className="w-full">Create Account</a>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 pb-3">
          <nav className="container mx-auto px-4">
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className={`block py-2 hover:text-primary ${location === "/" ? "font-medium text-primary" : ""}`}>
                    Dashboard
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/maps">
                  <a className={`block py-2 hover:text-primary ${location === "/maps" ? "font-medium text-primary" : ""}`}>
                    Maps
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/alerts">
                  <a className={`block py-2 hover:text-primary ${location === "/alerts" ? "font-medium text-primary" : ""}`}>
                    Alerts
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className={`block py-2 hover:text-primary ${location === "/settings" ? "font-medium text-primary" : ""}`}>
                    Settings
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
