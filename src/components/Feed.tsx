import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { PostCard } from "./PostCard";

export function Feed() {
  const posts = useQuery(api.posts.getFeed);
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "video" | "article">("text");
  const [articleTitle, setArticleTitle] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      let mediaId = undefined;
      
      if (selectedFile && (postType === "image" || postType === "video")) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        mediaId = json.storageId;
      }

      await createPost({ 
        content: newPost.trim(),
        type: postType,
        mediaId,
        title: postType === "article" ? articleTitle.trim() || undefined : undefined,
      });
      
      setNewPost("");
      setArticleTitle("");
      setSelectedFile(null);
      setPostType("text");
      setShowCreatePost(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Post created!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPostType("image");
      } else if (file.type.startsWith("video/")) {
        setPostType("video");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {!showCreatePost ? (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
              {/* This would show current user's profile image if available */}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-3 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50"
            >
              Start a post...
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Share your thoughts</p>
              </div>
            </div>

            {/* Post Type Selector */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setPostType("text")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  postType === "text" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setPostType("article")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  postType === "article" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                Article
              </button>
            </div>

            {/* Article Title */}
            {postType === "article" && (
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg"
              />
            )}

            {/* Content */}
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={postType === "article" ? "Write your article..." : "What's on your mind?"}
              rows={postType === "article" ? 8 : 3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Photo/Video</span>
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPost("");
                    setArticleTitle("");
                    setSelectedFile(null);
                    setPostType("text");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPost.trim() || isPosting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts === undefined ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
