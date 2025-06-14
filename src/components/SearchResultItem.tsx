import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SearchResultItemProps {
  person: any;
  currentUserId: string;
  onViewProfile: (userId: string) => void;
  onConnect: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}

export function SearchResultItem({ person, currentUserId, onViewProfile, onConnect, onMessageUser }: SearchResultItemProps) {
  const connectionStatus = useQuery(api.connections.getConnectionStatus, { userId: person.userId });

  const getConnectionButton = () => {
    if (person.userId === currentUserId) {
      return (
        <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
          You
        </button>
      );
    }

    switch (connectionStatus) {
      case "connected":
        return (
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
            Connected
          </button>
        );
      case "pending_sent":
        return (
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
            Request Sent
          </button>
        );
      case "pending_received":
        return (
          <button className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
            Pending Response
          </button>
        );
      default:
        return (
          <button
            onClick={() => onConnect(person.userId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Connect
          </button>
        );
    }
  };

  const showMessageButton = connectionStatus === "connected";

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
          {person.profileImageUrl ? (
            <img 
              src={person.profileImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {`${person.firstName[0]}${person.lastName[0]}`}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {person.firstName} {person.lastName}
          </h3>
          <p className="text-gray-600">{person.headline}</p>
          {person.location && (
            <p className="text-sm text-gray-500">{person.location}</p>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => onViewProfile(person.userId)}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          View Profile
        </button>
        {showMessageButton && (
          <button
            onClick={() => onMessageUser(person.userId)}
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            Message
          </button>
        )}
        {getConnectionButton()}
      </div>
    </div>
  );
}
