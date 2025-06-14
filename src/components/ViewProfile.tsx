import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ViewProfileProps {
  userId: string;
  onBack: () => void;
  onMessageUser: (userId: string) => void;
}

export function ViewProfile({ userId, onBack, onMessageUser }: ViewProfileProps) {
  const profile = useQuery(api.profiles.getProfile, { userId: userId as any });
  const connectionStatus = useQuery(api.connections.getConnectionStatus, { userId: userId as any });
  const sendConnectionRequest = useMutation(api.connections.sendConnectionRequest);

  const handleConnect = async () => {
    try {
      await sendConnectionRequest({ recipientId: userId as any });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send connection request");
    }
  };

  const handleMessage = () => {
    onMessageUser(userId);
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium cursor-not-allowed">
            Connected
          </button>
        );
      case "pending_sent":
        return (
          <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium cursor-not-allowed">
            Request Sent
          </button>
        );
      case "pending_received":
        return (
          <button className="bg-orange-100 text-orange-700 px-6 py-2 rounded-lg font-medium cursor-not-allowed">
            Pending Response
          </button>
        );
      case "self":
        return null;
      default:
        return (
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Connect
          </button>
        );
    }
  };

  const showMessageButton = connectionStatus === "connected";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to search</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {`${profile.firstName[0]}${profile.lastName[0]}`}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-xl text-gray-600 mb-2">{profile.headline}</p>
              {profile.location && (
                <p className="text-gray-500 mb-4">{profile.location}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {getConnectionButton()}
              {showMessageButton && (
                <button 
                  onClick={handleMessage}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {profile.about && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.about}</p>
        </div>
      )}

      {/* Experience Section */}
      {profile.experience && profile.experience.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Experience</h2>
          <div className="space-y-6">
            {profile.experience.map((exp: any, index: number) => (
              <div key={index} className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
