import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface NetworkPageProps {
  onMessageUser: (userId: string) => void;
}

export function NetworkPage({ onMessageUser }: NetworkPageProps) {
  const connectionRequests = useQuery(api.connections.getConnectionRequests);
  const connections = useQuery(api.connections.getConnections, {});
  const respondToConnection = useMutation(api.connections.respondToConnection);

  const handleConnectionResponse = async (connectionId: string, accept: boolean) => {
    try {
      await respondToConnection({ connectionId: connectionId as any, accept });
      toast.success(accept ? "Connection accepted!" : "Connection declined");
    } catch (error) {
      toast.error("Failed to respond to connection request");
    }
  };

  const handleMessage = (userId: string) => {
    onMessageUser(userId);
  };

  return (
    <div className="space-y-6">
      {/* Connection Requests */}
      {connectionRequests && connectionRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Connection Requests ({connectionRequests.length})
          </h2>
          
          <div className="space-y-4">
            {connectionRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
                    {request.profile?.profileImageUrl ? (
                      <img 
                        src={request.profile.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {request.profile 
                          ? `${request.profile.firstName[0]}${request.profile.lastName[0]}`
                          : request.requester?.email?.[0]?.toUpperCase() || "?"
                        }
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.profile 
                        ? `${request.profile.firstName} ${request.profile.lastName}`
                        : request.requester?.email
                      }
                    </h3>
                    {request.profile?.headline && (
                      <p className="text-gray-600">{request.profile.headline}</p>
                    )}
                    {request.profile?.location && (
                      <p className="text-sm text-gray-500">{request.profile.location}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleConnectionResponse(request._id, true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleConnectionResponse(request._id, false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Connections */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          My Network {connections && `(${connections.length})`}
        </h2>
        
        {connections === undefined ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You don't have any connections yet.</p>
            <p className="text-sm text-gray-400">
              Start connecting with professionals to grow your network!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 overflow-hidden">
                    {connection.profile?.profileImageUrl ? (
                      <img 
                        src={connection.profile.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {connection.profile 
                          ? `${connection.profile.firstName[0]}${connection.profile.lastName[0]}`
                          : connection.user?.email?.[0]?.toUpperCase() || "?"
                        }
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {connection.profile 
                      ? `${connection.profile.firstName} ${connection.profile.lastName}`
                      : connection.user?.email
                    }
                  </h3>
                  {connection.profile?.headline && (
                    <p className="text-sm text-gray-600 mb-2">{connection.profile.headline}</p>
                  )}
                  {connection.profile?.location && (
                    <p className="text-xs text-gray-500 mb-3">{connection.profile.location}</p>
                  )}
                  
                  <button 
                    onClick={() => handleMessage(connection.user?._id || "")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
