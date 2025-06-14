import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  const toggleLike = useMutation(api.posts.toggleLike);
  const addComment = useMutation(api.posts.addComment);
  const comments = useQuery(api.posts.getComments, { postId: post._id });
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    try {
      await toggleLike({ postId: post._id });
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      await addComment({ postId: post._id, content: newComment.trim() });
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const renderPostContent = () => {
    switch (post.type) {
      case "article":
        return (
          <div className="px-6 pb-4">
            {post.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
            )}
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        );
      
      case "image":
        return (
          <div>
            <div className="px-6 pb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.mediaUrl && (
              <div className="px-6 pb-4">
                <img 
                  src={post.mediaUrl} 
                  alt="Post image" 
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        );
      
      case "video":
        return (
          <div>
            <div className="px-6 pb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.mediaUrl && (
              <div className="px-6 pb-4">
                <video 
                  src={post.mediaUrl} 
                  controls 
                  className="w-full max-h-96 rounded-lg"
                />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="px-6 pb-4">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>
        );
    }
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case "article":
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "image":
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
            {post.profile?.profileImageUrl ? (
              <img 
                src={post.profile.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {post.profile ? `${post.profile.firstName} ${post.profile.lastName}` : post.author?.email}
              </h3>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatDate(post._creationTime)}
              </span>
              {getPostTypeIcon() && (
                <>
                  <span className="text-gray-500">•</span>
                  {getPostTypeIcon()}
                </>
              )}
            </div>
            {post.profile?.headline && (
              <p className="text-sm text-gray-600">{post.profile.headline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      {renderPostContent()}

      {/* Post Actions */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                post.isLiked
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-sm font-medium">{post.likesCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Add Comment */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleComment} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                {/* Current user's profile image would go here */}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newComment.trim() && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isCommenting}
                      className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {isCommenting ? "Posting..." : "Post"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {comments === undefined ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                      {comment.profile?.profileImageUrl ? (
                        <img 
                          src={comment.profile.profileImageUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.profile 
                              ? `${comment.profile.firstName} ${comment.profile.lastName}`
                              : comment.author?.email
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment._creationTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
