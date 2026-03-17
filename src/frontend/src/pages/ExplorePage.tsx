import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MapPin, Search, UserSearch, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { PostType } from "../backend";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetAllUsers,
  useGetHomeFeed,
  useGetProfile,
  useIsFollowingUser,
  useUnfollowUser,
} from "../hooks/useQueries";

const CARD_COLORS = [
  "oklch(0.72 0.22 195)",
  "oklch(0.65 0.2 185)",
  "oklch(0.62 0.22 190)",
  "oklch(0.68 0.18 200)",
  "oklch(0.6 0.2 180)",
  "oklch(0.7 0.24 195)",
];

// Single user card
function UserCard({
  userId,
  searchTerm,
  myId,
}: { userId: string; searchTerm: string; myId: string | undefined }) {
  const { data: profile, isLoading } = useGetProfile(userId);
  const { data: isFollowing, isLoading: followLoading } =
    useIsFollowingUser(userId);
  const { mutate: follow, isPending: following } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowUser();
  const { setViewingProfileId, setCurrentPage } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-full bg-card animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-card rounded w-28 animate-pulse" />
          <div className="h-2 bg-card rounded w-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const username = profile.username ?? "";
  if (!username.toLowerCase().includes(searchTerm.toLowerCase())) return null;
  if (userId === myId) return null;

  const initials = username.slice(0, 2).toUpperCase();

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      unfollow(userId);
    } else {
      follow(userId);
    }
  };

  const handleViewProfile = () => {
    setViewingProfileId(userId);
    setCurrentPage("profile");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 border-b border-border/40 hover:bg-card/40 transition-colors cursor-pointer"
      onClick={handleViewProfile}
    >
      <Avatar className="w-11 h-11 flex-shrink-0">
        <AvatarFallback
          className="text-sm font-semibold"
          style={{
            background: "oklch(0.75 0.18 220 / 20%)",
            color: "oklch(0.75 0.18 220)",
          }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">@{username}</p>
        {profile.bio ? (
          <p className="text-xs text-muted-foreground truncate">
            {profile.bio}
          </p>
        ) : null}
      </div>
      <Button
        size="sm"
        className="rounded-full text-xs h-8 px-4 border-0 flex-shrink-0"
        style={{
          background: isFollowing
            ? "oklch(0.2 0 0)"
            : "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
          color: isFollowing ? "oklch(0.6 0 0)" : "white",
          border: isFollowing ? "1px solid oklch(0.3 0 0)" : "none",
        }}
        disabled={following || unfollowing || followLoading}
        onClick={handleToggleFollow}
      >
        {following || unfollowing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          "Following"
        ) : (
          "Follow"
        )}
      </Button>
    </motion.div>
  );
}

function UserSearchResults({
  userIds,
  searchTerm,
  myId,
}: { userIds: string[]; searchTerm: string; myId: string | undefined }) {
  if (userIds.length === 0) {
    return (
      <div
        data-ocid="explore.empty_state"
        className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6"
      >
        <UserSearch className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No users found for "{searchTerm}"
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {userIds.map((uid) => (
        <UserCard key={uid} userId={uid} searchTerm={searchTerm} myId={myId} />
      ))}
    </div>
  );
}

function PeopleSearch() {
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString();
  const [peopleSearch, setPeopleSearch] = useState("");
  const { data, isLoading: usersLoading } = useGetAllUsers();

  const allUserIds: string[] = data ? data.map((p: any) => p.toString()) : [];

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "oklch(0.75 0.18 220)" }}
          />
          <Input
            data-ocid="explore.search_input"
            placeholder="Search by username..."
            value={peopleSearch}
            onChange={(e) => setPeopleSearch(e.target.value)}
            className="pl-9 bg-card border-border h-11 rounded-xl"
            style={{ caretColor: "oklch(0.75 0.18 220)" }}
          />
        </div>
      </div>

      {!peopleSearch.trim() ? (
        <div
          data-ocid="explore.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6"
        >
          <UserSearch className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-semibold text-sm">Find people on HangOut</p>
          <p className="text-xs text-muted-foreground">
            Tap a profile to view it, or follow to connect
          </p>
        </div>
      ) : usersLoading ? (
        <div
          data-ocid="explore.loading_state"
          className="flex justify-center py-10"
        >
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "oklch(0.75 0.18 220)" }}
          />
        </div>
      ) : (
        <UserSearchResults
          userIds={allUserIds}
          searchTerm={peopleSearch}
          myId={myId}
        />
      )}
    </div>
  );
}

function HangoutsTab({ search }: { search: string }) {
  const { data: posts, isLoading } = useGetHomeFeed();

  if (isLoading) {
    return (
      <div
        data-ocid="explore.loading_state"
        className="grid grid-cols-2 gap-3 px-4 pb-4 pt-3"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <Skeleton className="h-28 w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hangouts = (posts ?? []).filter(
    (p) =>
      p.postType === PostType.hangout &&
      (p.caption ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (hangouts.length === 0) {
    return (
      <motion.div
        data-ocid="explore.empty_state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.15 0.04 195)" }}
        >
          <Users
            className="w-8 h-8"
            style={{ color: "oklch(0.72 0.22 195)" }}
          />
        </div>
        <p className="font-semibold text-sm">No hangouts yet</p>
        <p className="text-xs text-muted-foreground">
          Create a hangout to get things started!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-3">
      {hangouts.map((h, i) => {
        const color = CARD_COLORS[i % CARD_COLORS.length];
        const date = new Date(
          Number(h.timestamp) / 1_000_000,
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const authorShort = `${h.author.toString().slice(0, 8)}...`;
        return (
          <motion.div
            key={h.id.toString()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            data-ocid={`explore.item.${i + 1}`}
            className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-[oklch(0.72_0.22_195/0.5)] transition-colors"
          >
            <div
              className="h-28 flex items-end p-3"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, oklch(0.12 0 0) 100%)`,
              }}
            >
              <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {date}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold line-clamp-2 leading-tight mb-2">
                {h.caption || "Hangout"}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{authorShort}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [mainTab, setMainTab] = useState<"hangouts" | "people">("hangouts");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 sticky top-0 glass z-10 border-b border-border/50">
        <h1 className="text-xl font-bold gradient-text-cyan mb-3">Explore</h1>

        {/* Main tab switcher */}
        <div className="flex gap-1 bg-card rounded-xl p-1 mb-3">
          <button
            type="button"
            data-ocid="explore.tab"
            onClick={() => setMainTab("hangouts")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === "hangouts" ? "text-black" : "text-muted-foreground"
            }`}
            style={
              mainTab === "hangouts"
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.22 195), oklch(0.6 0.18 185))",
                  }
                : {}
            }
          >
            Hangouts
          </button>
          <button
            type="button"
            data-ocid="explore.tab"
            onClick={() => setMainTab("people")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === "people" ? "text-black" : "text-muted-foreground"
            }`}
            style={
              mainTab === "people"
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
                  }
                : {}
            }
          >
            People
          </button>
        </div>

        {/* Search bar for Hangouts tab */}
        {mainTab === "hangouts" && (
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "oklch(0.72 0.22 195)" }}
            />
            <Input
              data-ocid="explore.search_input"
              placeholder="Search hangouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border h-11 rounded-xl"
              style={{ caretColor: "oklch(0.72 0.22 195)" }}
            />
          </div>
        )}
      </div>

      {mainTab === "people" ? (
        <PeopleSearch />
      ) : (
        <HangoutsTab search={search} />
      )}
    </div>
  );
}
