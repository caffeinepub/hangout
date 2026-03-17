import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import PostCard from "../components/PostCard";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetHomeFeed } from "../hooks/useQueries";

interface HomePageProps {
  onCreatePost: () => void;
}

const STORIES = [
  { name: "Alex", color: "oklch(0.65 0.28 305)" },
  { name: "Jamie", color: "oklch(0.7 0.22 20)" },
  { name: "Sam", color: "oklch(0.62 0.25 200)" },
  { name: "Riley", color: "oklch(0.68 0.2 130)" },
  { name: "Jordan", color: "oklch(0.72 0.24 260)" },
];

export default function HomePage({ onCreatePost }: HomePageProps) {
  const { data: posts, isLoading } = useGetHomeFeed();
  const { identity } = useInternetIdentity();
  const { setCurrentPage, setSelectedHangoutId } = useApp();
  const myId = identity?.getPrincipal().toString();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 sticky top-0 glass z-10 border-b border-border/50">
        <h1 className="text-xl font-bold gradient-text">HangOut</h1>
        <MapPin className="w-5 h-5 text-primary" />
      </div>

      {/* Stories */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar border-b border-border/40">
        <button
          type="button"
          className="flex flex-col items-center gap-1 flex-shrink-0"
          onClick={onCreatePost}
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center bg-card">
            <span className="text-2xl font-light text-primary">+</span>
          </div>
          <span className="text-xs text-muted-foreground truncate w-16 text-center">
            Your story
          </span>
        </button>

        {STORIES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className="w-16 h-16 rounded-full p-0.5"
              style={{
                background: `linear-gradient(135deg, ${s.color}, oklch(0.7 0.22 20))`,
              }}
            >
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarFallback
                  style={{ background: s.color }}
                  className="text-white font-semibold"
                >
                  {s.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-foreground/70 truncate w-16 text-center">
              {s.name}
            </span>
          </motion.div>
        ))}
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
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <MapPin className="w-10 h-10 text-white" />
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
                  setCurrentPage("hangoutDetail" as any);
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
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
