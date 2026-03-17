import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Grid3X3, Loader2, MapPin, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import EditProfileModal from "../components/EditProfileModal";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetCallerUserProfile,
  useGetProfile,
  useUnfollowUser,
} from "../hooks/useQueries";

interface ProfilePageProps {
  userId: string | null;
}

export default function ProfilePage({ userId }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const { viewingProfileId, setCurrentPage, setViewingProfileId } = useApp();
  const [showEdit, setShowEdit] = useState(false);

  const effectiveUserId = viewingProfileId || userId;
  const myId = identity?.getPrincipal().toString();
  const isMyProfile = !effectiveUserId || effectiveUserId === myId;

  const { data: myProfile, isLoading: myLoading } = useGetCallerUserProfile();
  const { data: otherProfile, isLoading: otherLoading } = useGetProfile(
    isMyProfile ? null : effectiveUserId,
  );

  const profile = isMyProfile ? myProfile : otherProfile;
  const isLoading = isMyProfile ? myLoading : otherLoading;

  const { mutateAsync: follow, isPending: following } = useFollowUser();
  const { mutateAsync: unfollow, isPending: unfollowing } = useUnfollowUser();

  const handleFollow = async () => {
    if (!effectiveUserId) return;
    try {
      await follow(effectiveUserId);
      toast.success("Following!");
    } catch {
      toast.error("Failed to follow");
    }
  };

  const handleUnfollow = async () => {
    if (!effectiveUserId) return;
    try {
      await unfollow(effectiveUserId);
      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  const avatarUrl = profile?.avatar?.getDirectURL();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        {!isMyProfile ? (
          <button
            type="button"
            data-ocid="profile.link"
            onClick={() => {
              setViewingProfileId(null);
              setCurrentPage("profile");
            }}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <h1 className="text-xl font-bold gradient-text">Profile</h1>
        )}
        {isMyProfile && (
          <button
            type="button"
            className="p-2 rounded-full hover:bg-muted/50"
            onClick={() => setShowEdit(true)}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid="profile.loading_state"
          className="flex flex-col items-center gap-4 px-4 py-6"
        >
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-8">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-12 w-16" />
          </div>
        </div>
      ) : !profile ? (
        <div
          data-ocid="profile.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center px-6"
        >
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col"
        >
          <div className="flex flex-col items-center px-4 pb-4 gap-3">
            <div
              className="p-0.5 rounded-full"
              style={{
                background: "white",
                padding: "2px",
              }}
            >
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl font-bold bg-muted">
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">@{profile.username}</h2>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex gap-8 py-2">
              {[
                { label: "Posts", value: "0" },
                { label: "Followers", value: profile.followers.toString() },
                { label: "Following", value: profile.following.toString() },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="text-xl font-bold">{s.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 w-full">
              {isMyProfile ? (
                <Button
                  data-ocid="profile.edit_button"
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-border font-semibold"
                  onClick={() => setShowEdit(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    data-ocid="profile.primary_button"
                    className="flex-1 h-10 rounded-xl text-white border-0 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.18 220), oklch(0.78 0.14 200))",
                    }}
                    onClick={handleFollow}
                    disabled={following}
                  >
                    {following ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Follow"
                    )}
                  </Button>
                  <Button
                    data-ocid="profile.secondary_button"
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-border font-semibold"
                    onClick={handleUnfollow}
                    disabled={unfollowing}
                  >
                    {unfollowing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Unfollow"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border/40">
            <div className="flex items-center justify-center py-3 gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            <div
              data-ocid="profile.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center px-6 gap-3"
            >
              <MapPin className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          </div>
        </motion.div>
      )}

      {showEdit && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
