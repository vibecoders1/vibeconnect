import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInForm } from "./SignInForm";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { Header } from "./components/Header";
import { Feed } from "./components/Feed";
import { ProfilePage } from "./components/ProfilePage";
import { NetworkPage } from "./components/NetworkPage";
import { SearchPage } from "./components/SearchPage";
import { MessagesPage } from "./components/MessagesPage";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";

function App() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Footer />
      <Toaster position="top-right" />
    </main>
  );
}

function AuthenticatedApp() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const [currentPage, setCurrentPage] = useState<"feed" | "profile" | "network" | "search" | "messages">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleNavigate = (page: "feed" | "profile" | "network" | "search" | "messages") => {
    setCurrentPage(page);
    if (page !== "messages") {
      setSelectedUserId(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMessageUser = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage("messages");
  };

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage />;
      case "network":
        return <NetworkPage onMessageUser={handleMessageUser} />;
      case "search":
        return <SearchPage query={searchQuery} onMessageUser={handleMessageUser} />;
      case "messages":
        return <MessagesPage selectedUserId={selectedUserId} />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
        onSearch={handleSearch}
        onMessageUser={handleMessageUser}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {currentPage !== "messages" && (
            <div className="lg:col-span-1">
              <Sidebar profile={profile} onNavigate={handleNavigate} />
            </div>
          )}
          
          <div className={currentPage === "messages" ? "lg:col-span-4" : "lg:col-span-3"}>
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
