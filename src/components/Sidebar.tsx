interface SidebarProps {
  profile: any;
  onNavigate: (page: "feed" | "profile" | "network" | "search" | "messages") => void;
}

export function Sidebar({ profile, onNavigate }: SidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
          {profile.profileImageUrl ? (
            <img 
              src={profile.profileImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900">
          {profile.firstName} {profile.lastName}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{profile.headline}</p>
        
        <button
          onClick={() => onNavigate("profile")}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View profile
        </button>
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Profile viewers</span>
            <span className="text-blue-600 font-medium">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Post impressions</span>
            <span className="text-blue-600 font-medium">1,234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
