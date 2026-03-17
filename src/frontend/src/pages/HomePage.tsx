import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus } from "lucide-react";
import { motion } from "motion/react";
import PostCard from "../components/PostCard";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetHomeFeed } from "../hooks/useQueries";

interface HomePageProps {
  onCreatePost: () => void;
}

export default function HomePage({ onCreatePost }: HomePageProps) {
  const { data: posts, isLoading } = useGetHomeFeed();
  const { identity } = useInternetIdentity();
  const { setCurrentPage, setSelectedHangoutId, currentUserProfile } = useApp();
  const myId = identity?.getPrincipal().toString();

  const avatarUrl = currentUserProfile?.avatar
    ? typeof currentUserProfile.avatar === "string"
      ? currentUserProfile.avatar
      : null
    : null;
  const initials = currentUserProfile?.username
    ? currentUserProfile.username.slice(0, 2).toUpperCase()
    : "ME";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 sticky top-0 glass z-10 border-b border-border/50">
        <h1 className="text-xl font-bold gradient-text">HangOut</h1>
        <button
          type="button"
          data-ocid="notifications.open_modal_button"
          onClick={() => setCurrentPage("notifications")}
          className="p-2 -mr-2 rounded-full hover:bg-muted/30 transition-colors relative"
          aria-label="Notifications"
        >
          <MapPin
            className="w-5 h-5"
            style={{ color: "oklch(0.75 0.18 220)" }}
          />
        </button>
      </div>

      {/* Stories row */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar border-b border-border/40">
        <button
          type="button"
          className="flex flex-col items-center gap-1 flex-shrink-0"
          onClick={onCreatePost}
        >
          <div
            className="w-16 h-16 rounded-full p-0.5 relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
            }}
          >
            <Avatar className="w-full h-full border-2 border-background">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Your story" />}
              <AvatarFallback
                style={{
                  background: "oklch(0.15 0.04 220)",
                  color: "oklch(0.75 0.18 220)",
                }}
                className="text-sm font-bold"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
              style={{ background: "oklch(0.75 0.18 220)" }}
            >
              <Plus className="w-3 h-3 text-black" strokeWidth={3} />
            </span>
          </div>
          <span className="text-xs text-muted-foreground truncate w-16 text-center">
            Your story
          </span>
        </button>
      </div>

      {/* Feed */}
      <div className="flex flex-col">
        {isLoading ? (
          <div
            data-ocid="feed.loading_state"
            className="flex flex-col gap-4 p-4"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="w-full h-64 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <motion.div
            data-ocid="feed.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
              }}
            >
              <MapPin className="w-10 h-10 text-black" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">No posts yet</h3>
              <p className="text-muted-foreground text-sm">
                Follow people or create your first hangout to get started!
              </p>
            </div>
          </motion.div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`feed.item.${i + 1}`}
            >
              <PostCard
                post={post}
                myId={myId}
                onHangoutClick={(id) => {
                  setSelectedHangoutId(id);
                  setCurrentPage("hangoutDetail");
                }}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/40 mt-4">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.75 0.18 220)" }}
          className="hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
