import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const addExperience = useMutation(api.profiles.addExperience);
  const addSkill = useMutation(api.profiles.addSkill);
  const updateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const updateProfileImage = useMutation(api.profiles.updateProfileImage);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    location: "",
    about: "",
  });

  // Initialize edit form when profile loads
  useState(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        headline: profile.headline || "",
        location: profile.location || "",
        about: profile.about || "",
      });
    }
  });

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceForm.title.trim() || !experienceForm.company.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await addExperience({
        title: experienceForm.title.trim(),
        company: experienceForm.company.trim(),
        startDate: experienceForm.startDate,
        endDate: experienceForm.endDate || undefined,
        description: experienceForm.description.trim() || undefined,
      });
      
      setExperienceForm({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setShowAddExperience(false);
      toast.success("Experience added!");
    } catch (error) {
      toast.error("Failed to add experience");
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      await addSkill({ skill: newSkill.trim() });
      setNewSkill("");
      setShowAddSkill(false);
      toast.success("Skill added!");
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.headline.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await updateProfile({
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        headline: editForm.headline.trim(),
        location: editForm.location.trim() || undefined,
        about: editForm.about.trim() || undefined,
      });
      setShowEditProfile(false);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      
      await updateProfileImage({ imageId: json.storageId });
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to update profile image");
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                {profile.profileImageUrl ? (
                  <img 
                    src={profile.profileImageUrl} 
                    alt="Profile" 
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {!showEditProfile ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-xl text-gray-600 mb-2">{profile.headline}</p>
              {profile.location && (
                <p className="text-gray-500 mb-4">{profile.location}</p>
              )}
              
              <button 
                onClick={() => setShowEditProfile(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  value={editForm.headline}
                  onChange={(e) => setEditForm(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About
                </label>
                <textarea
                  value={editForm.about}
                  onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
          <button
            onClick={() => setShowAddExperience(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Experience
          </button>
        </div>

        {showAddExperience && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <form onSubmit={handleAddExperience} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={experienceForm.startDate}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={experienceForm.endDate}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExperience(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {profile.experience?.map((exp: any, index: number) => (
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
          
          {(!profile.experience || profile.experience.length === 0) && !showAddExperience && (
            <p className="text-gray-500 text-center py-8">
              No experience added yet. Click "Add Experience" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          <button
            onClick={() => setShowAddSkill(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Skill
          </button>
        </div>

        {showAddSkill && (
          <div className="mb-6">
            <form onSubmit={handleAddSkill} className="flex space-x-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
          
          {(!profile.skills || profile.skills.length === 0) && !showAddSkill && (
            <p className="text-gray-500 text-center py-8 w-full">
              No skills added yet. Click "Add Skill" to showcase your expertise.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
