import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Post } from "../backend";
import { PostType } from "../backend";
import { useApp } from "../context/AppContext";
import { useDeletePost, useRequestJoinHangout } from "../hooks/useQueries";

interface PostCardProps {
  post: Post;
  myId?: string;
  onHangoutClick?: (id: bigint) => void;
}

export default function PostCard({
  post,
  myId,
  onHangoutClick,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50));
  const { mutateAsync: requestJoin, isPending: joiningHangout } =
    useRequestJoinHangout();
  const { mutateAsync: deletePost } = useDeletePost();
  const { setCurrentPage, setViewingProfileId } = useApp();

  const isMyPost = myId && post.author.toString() === myId;
  const authorShort = `${post.author.toString().slice(0, 8)}...`;
  const imageUrl = post.content?.getDirectURL();

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleJoinHangout = async () => {
    try {
      await requestJoin(post.id);
      toast.success("Join request sent!");
    } catch {
      toast.error("Failed to send join request");
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const timeAgo = (timestamp: bigint) => {
    const ms = Number(timestamp / 1_000_000n);
    const diff = Date.now() - ms;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="flex flex-col border-b border-border/40 pb-2 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => {
            setViewingProfileId(post.author.toString());
            setCurrentPage("profile" as any);
          }}
        >
          <Avatar className="w-9 h-9 border border-primary/30">
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {authorShort[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-semibold">{authorShort}</p>
            <p className="text-xs text-muted-foreground">
              {timeAgo(post.timestamp)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {post.postType === PostType.hangout && (
            <Badge
              className="text-xs font-medium border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
                color: "white",
              }}
            >
              <MapPin className="w-3 h-3 mr-1" /> Hangout
            </Badge>
          )}
          {post.postType === PostType.story && (
            <Badge
              variant="outline"
              className="text-xs border-accent/60 text-accent"
            >
              Story
            </Badge>
          )}

          {isMyPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  data-ocid="post.delete_button"
                  className="text-destructive cursor-pointer"
                  onClick={handleDeletePost}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Image/Video */}
      {imageUrl && (
        <div className="w-full aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt="post content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Hangout card details */}
      {post.postType === PostType.hangout && (
        <div
          className="mx-4 my-2 rounded-xl p-3 border border-primary/20"
          style={{ background: "oklch(0.65 0.28 305 / 8%)" }}
        >
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Event</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>Limited spots</span>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              data-ocid="post.primary_button"
              size="sm"
              className="flex-1 h-8 text-xs font-semibold rounded-lg text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
              }}
              onClick={() => onHangoutClick?.(post.id)}
            >
              View Details
            </Button>
            {!isMyPost && (
              <Button
                data-ocid="post.secondary_button"
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs rounded-lg border-primary/40 text-primary"
                onClick={handleJoinHangout}
                disabled={joiningHangout}
              >
                {joiningHangout ? "Requesting..." : "Request to Join"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pt-1">
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-1.5 p-2 rounded-full transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              liked ? "fill-accent text-accent" : "text-foreground/70"
            }`}
          />
          <span className="text-sm text-muted-foreground">{likeCount}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 p-2 rounded-full"
        >
          <MessageCircle className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-4 pb-2 text-sm">
          <span className="font-semibold mr-1">{authorShort}</span>
          {post.caption}
        </p>
      )}
    </div>
  );
}
