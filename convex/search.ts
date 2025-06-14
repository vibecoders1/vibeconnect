import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchPeople = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    const profiles = await ctx.db.query("profiles").collect();
    
    const filteredProfiles = profiles.filter((profile) => {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
      const headline = profile.headline.toLowerCase();
      const searchQuery = args.query.toLowerCase();
      
      return fullName.includes(searchQuery) || headline.includes(searchQuery);
    });

    const profilesWithUsers = await Promise.all(
      filteredProfiles.slice(0, 20).map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        
        let profileImageUrl = null;
        if (profile.profileImage) {
          profileImageUrl = await ctx.storage.getUrl(profile.profileImage);
        }
        
        return { ...profile, user, profileImageUrl };
      })
    );

    return profilesWithUsers;
  },
});
