import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface MessagesPageProps {
  selectedUserId?: string | null;
}

export function MessagesPage({ selectedUserId }: MessagesPageProps) {
  const conversations = useQuery(api.messages.getConversations);
  const currentProfile = useQuery(api.profiles.getCurrentProfile);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(selectedUserId || null);
  const messages = useQuery(
    api.messages.getMessages,
    selectedPartnerId ? { partnerId: selectedPartnerId as any } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selected partner when selectedUserId prop changes
  useEffect(() => {
    if (selectedUserId) {
      setSelectedPartnerId(selectedUserId);
    }
  }, [selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedPartnerId && messages) {
      markAsRead({ partnerId: selectedPartnerId as any });
    }
  }, [selectedPartnerId, messages, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId) return;

    setIsSending(true);
    try {
      await sendMessage({
        recipientId: selectedPartnerId as any,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const selectedConversation = conversations?.find(c => c.partnerId === selectedPartnerId);

  return (
    <div className="bg-white rounded-lg shadow-sm border h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations === undefined ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet.</p>
              <p className="text-sm mt-1">Connect with people to start messaging!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.partnerId}
                onClick={() => setSelectedPartnerId(conversation.partnerId)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPartnerId === conversation.partnerId ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                    {conversation.profile?.profileImageUrl ? (
                      <img 
                        src={conversation.profile.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {conversation.profile 
                          ? `${conversation.profile.firstName[0]}${conversation.profile.lastName[0]}`
                          : (conversation.partner as any)?.email?.[0]?.toUpperCase() || "?"
                        }
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.profile 
                          ? `${conversation.profile.firstName} ${conversation.profile.lastName}`
                          : (conversation.partner as any)?.email || "Unknown User"
                        }
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage._creationTime)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedPartnerId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                  {selectedConversation?.profile?.profileImageUrl ? (
                    <img 
                      src={selectedConversation.profile.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversation?.profile 
                        ? `${selectedConversation.profile.firstName[0]}${selectedConversation.profile.lastName[0]}`
                        : (selectedConversation?.partner as any)?.email?.[0]?.toUpperCase() || "?"
                      }
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation?.profile 
                      ? `${selectedConversation.profile.firstName} ${selectedConversation.profile.lastName}`
                      : (selectedConversation?.partner as any)?.email || "Unknown User"
                    }
                  </h3>
                  {selectedConversation?.profile?.headline && (
                    <p className="text-sm text-gray-600">{selectedConversation.profile.headline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages === undefined ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === currentProfile?.userId;
                  const messageProfile = isOwn ? currentProfile : selectedConversation?.profile;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex items-start space-x-3 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {/* User Avatar */}
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                        {messageProfile?.profileImageUrl ? (
                          <img 
                            src={messageProfile.profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                            {messageProfile 
                              ? `${messageProfile.firstName[0]}${messageProfile.lastName[0]}`
                              : "?"
                            }
                          </div>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium ${isOwn ? "text-blue-600" : "text-gray-600"}`}>
                            {messageProfile 
                              ? `${messageProfile.firstName} ${messageProfile.lastName}`
                              : "Unknown User"
                            }
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message._creationTime)}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwn
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSending ? "..." : "Send"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
