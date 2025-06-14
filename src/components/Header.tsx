import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";

interface HeaderProps {
  onNavigate: (page: "feed" | "profile" | "network" | "search" | "messages") => void;
  currentPage: string;
  onSearch: (query: string) => void;
  onMessageUser?: (userId: string) => void;
}

export function Header({ onNavigate, currentPage, onSearch, onMessageUser }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = useQuery(api.messages.getUnreadCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      onNavigate("search");
    }
  };

  const handleHomeClick = () => {
    onNavigate("feed");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VibeConnect
              </h1>
            </button>
            
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>

          <nav className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate("feed")}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "feed"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("network")}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "network"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Network
            </button>
            <button
              onClick={() => onNavigate("messages")}
              className={`relative px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "messages"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Messages
              {unreadCount !== undefined && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate("profile")}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "profile"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Profile
            </button>
            <SignOutButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
