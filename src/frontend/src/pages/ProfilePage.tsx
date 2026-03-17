import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { ArrowLeft, Grid3X3, Loader2, MapPin, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import EditProfileModal from "../components/EditProfileModal";
import GenderAvatar from "../components/GenderAvatar";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetCallerGender,
  useGetCallerUserProfile,
  useGetFollowerCount,
  useGetFollowersList,
  useGetFollowingCount,
  useGetFollowingList,
  useGetHomeFeed,
  useGetProfile,
  useIsFollowingUser,
  useUnfollowUser,
} from "../hooks/useQueries";

const ICY_BLUE = "oklch(0.75 0.18 220)";
const ICY_BLUE_GRADIENT =
  "linear-gradient(135deg, oklch(0.72 0.18 220), oklch(0.78 0.14 200))";

interface ProfilePageProps {
  userId: string | null;
}

function UserRow({
  userId,
  isOwnProfile,
}: { userId: string; isOwnProfile: boolean }) {
  const { data: profile } = useGetProfile(userId);
  const name = profile?.username || `${userId.slice(0, 10)}...`;
  const { data: isFollowing } = useIsFollowingUser(
    isOwnProfile ? null : userId,
  );
  const { mutateAsync: follow, isPending: following } = useFollowUser();
  const { mutateAsync: unfollow, isPending: unfollowing } = useUnfollowUser();

  const handleToggle = async () => {
    try {
      if (isFollowing) {
        await unfollow(userId);
      } else {
        await follow(userId);
      }
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-sm"
        style={{
          background: "oklch(0.75 0.18 220 / 15%)",
          color: ICY_BLUE,
          border: "1.5px solid oklch(0.75 0.18 220 / 25%)",
        }}
      >
        {name[0]?.toUpperCase() ?? "?"}
      </div>
      <span className="flex-1 font-medium text-sm">{name}</span>
      {!isOwnProfile && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={following || unfollowing}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold border-0 transition-all"
          style={
            isFollowing
              ? {
                  background: "oklch(0.2 0 0)",
                  color: "oklch(0.6 0 0)",
                  border: "1px solid oklch(0.3 0 0)",
                }
              : { background: ICY_BLUE_GRADIENT, color: "white" }
          }
        >
          {following || unfollowing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </div>
  );
}

function FollowListSheet({
  title,
  userIds,
  isOwnProfile,
  onClose,
}: {
  title: string;
  userIds: Principal[];
  isOwnProfile: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 rounded-t-3xl"
        style={{ background: "#111", border: "1px solid oklch(0.25 0 0)" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <h3 className="font-bold text-base">{title}</h3>
          <button
            type="button"
            data-ocid="profile.close_button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-72 pb-6">
          {userIds.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-10">
              No users yet
            </p>
          ) : (
            userIds.map((u) => (
              <UserRow
                key={u.toString()}
                userId={u.toString()}
                isOwnProfile={isOwnProfile}
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}

export default function ProfilePage({ userId }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const { viewingProfileId, setCurrentPage, setViewingProfileId } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const effectiveUserId = viewingProfileId || userId;
  const myId = identity?.getPrincipal().toString();
  const isMyProfile = !effectiveUserId || effectiveUserId === myId;

  const { data: myProfile, isLoading: myLoading } = useGetCallerUserProfile();
  const { data: otherProfile, isLoading: otherLoading } = useGetProfile(
    isMyProfile ? null : effectiveUserId,
  );
  const { data: myGender } = useGetCallerGender();

  const targetId = isMyProfile ? (myId ?? null) : (effectiveUserId ?? null);
  const { data: isFollowing, isLoading: followCheckLoading } =
    useIsFollowingUser(isMyProfile ? null : (effectiveUserId ?? null));
  const { data: followerCount } = useGetFollowerCount(targetId);
  const { data: followingCount } = useGetFollowingCount(targetId);

  const { data: followersList } = useGetFollowersList(
    showFollowers ? targetId : null,
  );
  const { data: followingList } = useGetFollowingList(
    showFollowing ? targetId : null,
  );

  const profile = isMyProfile ? myProfile : otherProfile;
  const isLoading = isMyProfile ? myLoading : otherLoading;

  const { data: feedPosts } = useGetHomeFeed();
  const postCount = (feedPosts ?? []).filter(
    (p) => p.author.toString() === targetId,
  ).length;

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
  const profileGender = isMyProfile ? myGender || "" : "";

  const displayFollowers =
    followerCount !== undefined ? Number(followerCount) : 0;
  const displayFollowing =
    followingCount !== undefined ? Number(followingCount) : 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        {!isMyProfile ? (
          <button
            type="button"
            data-ocid="profile.link"
            onClick={() => {
              setViewingProfileId(null);
              setCurrentPage("explore");
            }}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <h1 className="text-xl font-bold" style={{ color: ICY_BLUE }}>
            Profile
          </h1>
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
              style={{ background: "white", padding: "2px" }}
              className="rounded-full"
            >
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-muted p-0 overflow-hidden">
                  <GenderAvatar gender={profileGender} size={96} />
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

            {/* Stats row — followers/following are tappable */}
            <div className="flex gap-8 py-2">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{postCount}</span>
                <span className="text-xs text-muted-foreground">Posts</span>
              </div>

              <button
                type="button"
                data-ocid="profile.tab"
                onClick={() => setShowFollowers(true)}
                className="flex flex-col items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-xl font-bold">{displayFollowers}</span>
                <span className="text-xs" style={{ color: ICY_BLUE }}>
                  Followers
                </span>
              </button>

              <button
                type="button"
                data-ocid="profile.tab"
                onClick={() => setShowFollowing(true)}
                className="flex flex-col items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-xl font-bold">{displayFollowing}</span>
                <span className="text-xs" style={{ color: ICY_BLUE }}>
                  Following
                </span>
              </button>
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
                <Button
                  data-ocid="profile.primary_button"
                  className="flex-1 h-10 rounded-xl border-0 font-semibold"
                  style={{
                    background: isFollowing
                      ? "oklch(0.2 0 0)"
                      : ICY_BLUE_GRADIENT,
                    color: isFollowing ? "oklch(0.6 0 0)" : "white",
                    border: isFollowing ? "1px solid oklch(0.3 0 0)" : "none",
                  }}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={following || unfollowing || followCheckLoading}
                >
                  {following || unfollowing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="border-t border-border/40">
            <div className="flex items-center justify-center py-3 gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            {postCount === 0 ? (
              <div
                data-ocid="profile.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center px-6 gap-3"
              >
                <MapPin className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {(feedPosts ?? [])
                  .filter((p) => p.author.toString() === targetId)
                  .map((p, i) => (
                    <div
                      key={p.id.toString()}
                      data-ocid={`profile.item.${i + 1}`}
                      className="aspect-square bg-card flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.22 195 / 30%) 0%, oklch(0.12 0 0) 100%)",
                      }}
                    >
                      <p className="text-xs text-muted-foreground text-center px-2 line-clamp-3">
                        {p.caption}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Followers sheet */}
      <AnimatePresence>
        {showFollowers && (
          <FollowListSheet
            title="Followers"
            userIds={followersList ?? []}
            isOwnProfile={isMyProfile}
            onClose={() => setShowFollowers(false)}
          />
        )}
      </AnimatePresence>

      {/* Following sheet */}
      <AnimatePresence>
        {showFollowing && (
          <FollowListSheet
            title="Following"
            userIds={followingList ?? []}
            isOwnProfile={isMyProfile}
            onClose={() => setShowFollowing(false)}
          />
        )}
      </AnimatePresence>

      {showEdit && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
