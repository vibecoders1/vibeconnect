import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { ViewProfile } from "./ViewProfile";
import { SearchResultItem } from "./SearchResultItem";

interface SearchPageProps {
  query: string;
  onMessageUser: (userId: string) => void;
}

export function SearchPage({ query, onMessageUser }: SearchPageProps) {
  const searchResults = useQuery(api.search.searchPeople, { query });
  const sendConnectionRequest = useMutation(api.connections.sendConnectionRequest);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const currentProfile = useQuery(api.profiles.getCurrentProfile);

  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest({ recipientId: userId as any });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send connection request");
    }
  };

  const handleViewProfile = (userId: string) => {
    setViewingProfile(userId);
  };

  const handleBackToSearch = () => {
    setViewingProfile(null);
  };

  if (viewingProfile) {
    return <ViewProfile userId={viewingProfile} onBack={handleBackToSearch} onMessageUser={onMessageUser} />;
  }

  if (!query.trim()) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500">Enter a search term to find people</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Search Results for "{query}"
      </h2>
      
      {searchResults === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No people found matching your search.</p>
            <p className="text-sm text-gray-400">Try searching with different keywords</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.map((person) => (
            <SearchResultItem
              key={person._id}
              person={person}
              currentUserId={currentProfile?.userId || ""}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              onMessageUser={onMessageUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
