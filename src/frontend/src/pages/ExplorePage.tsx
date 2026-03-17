import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Loader2,
  MapPin,
  Search,
  UserSearch,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetAllUsers,
  useGetProfile,
  useUnfollowUser,
} from "../hooks/useQueries";

const TRENDING_HANGOUTS = [
  {
    id: 1,
    title: "Beach Bonfire Night \uD83D\uDD25",
    location: "Santa Monica Beach",
    spots: 8,
    date: "Sat, Mar 21",
    color: "oklch(0.72 0.22 195)",
  },
  {
    id: 2,
    title: "Rooftop Movie Night \uD83C\uDFAC",
    location: "Downtown LA",
    spots: 12,
    date: "Sun, Mar 22",
    color: "oklch(0.65 0.2 185)",
  },
  {
    id: 3,
    title: "Morning Hike & Breakfast \uD83E\uDD7E",
    location: "Runyon Canyon",
    spots: 5,
    date: "Sat, Mar 21",
    color: "oklch(0.62 0.22 190)",
  },
  {
    id: 4,
    title: "Vinyl Record Swap Meet \uD83C\uDFB5",
    location: "Silver Lake",
    spots: 20,
    date: "Fri, Mar 27",
    color: "oklch(0.68 0.18 200)",
  },
  {
    id: 5,
    title: "Midnight Bowling Crew \uD83C\uDFB3",
    location: "Lucky Strike Lanes",
    spots: 16,
    date: "Fri, Mar 27",
    color: "oklch(0.6 0.2 180)",
  },
  {
    id: 6,
    title: "Farmers Market Brunch \uD83C\uDF73",
    location: "Hollywood Farmers Market",
    spots: 6,
    date: "Sun, Mar 29",
    color: "oklch(0.7 0.24 195)",
  },
];

const TAGS = ["All", "Outdoors", "Music", "Food", "Sports", "Art", "Nightlife"];

function handleCardEnter(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.borderColor = "oklch(0.72 0.22 195 / 0.5)";
}

function handleCardLeave(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.borderColor = "oklch(0.24 0 0)";
}

// Single user card
function UserCard({
  userId,
  searchTerm,
  myId,
}: { userId: string; searchTerm: string; myId: string | undefined }) {
  const { data: profile, isLoading } = useGetProfile(userId);
  const { mutate: follow, isPending: following } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowUser();
  const [isFollowing, setIsFollowing] = useState(false);

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

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollow(userId, { onSuccess: () => setIsFollowing(false) });
    } else {
      follow(userId, { onSuccess: () => setIsFollowing(true) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 border-b border-border/40 hover:bg-card/40 transition-colors"
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
        disabled={following || unfollowing}
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

  // All registered user IDs
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
            Search by username to find and follow people
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

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [mainTab, setMainTab] = useState<"hangouts" | "people">("hangouts");

  const filtered = TRENDING_HANGOUTS.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase()),
  );

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
        <>
          {/* Tags */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                data-ocid="explore.tab"
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTag === tag
                    ? "text-black border-0"
                    : "bg-card border border-border text-muted-foreground"
                }`}
                style={
                  activeTag === tag
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.22 195), oklch(0.6 0.18 185))",
                      }
                    : {}
                }
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Trending header */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <Flame
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.22 195)" }}
            />
            <span className="text-sm font-semibold">Trending Hangouts</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {filtered.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`explore.item.${i + 1}`}
                className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-colors"
                style={{ borderColor: "oklch(0.24 0 0)" }}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                <div
                  className="h-28 flex items-end p-3"
                  style={{
                    background: `linear-gradient(135deg, ${h.color} 0%, oklch(0.12 0 0) 100%)`,
                  }}
                >
                  <Badge className="text-xs bg-black/40 text-white border-0 backdrop-blur-sm">
                    {h.date}
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-2 leading-tight mb-2">
                    {h.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{h.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{h.spots} spots left</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
