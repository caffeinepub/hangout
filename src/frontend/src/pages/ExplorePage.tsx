import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Flame, MapPin, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const TRENDING_HANGOUTS = [
  {
    id: 1,
    title: "Beach Bonfire Night 🔥",
    location: "Santa Monica Beach",
    spots: 8,
    date: "Sat, Mar 21",
    color: "oklch(0.7 0.22 20)",
  },
  {
    id: 2,
    title: "Rooftop Movie Night 🎬",
    location: "Downtown LA",
    spots: 12,
    date: "Sun, Mar 22",
    color: "oklch(0.65 0.28 305)",
  },
  {
    id: 3,
    title: "Morning Hike & Breakfast 🥾",
    location: "Runyon Canyon",
    spots: 5,
    date: "Sat, Mar 21",
    color: "oklch(0.62 0.25 200)",
  },
  {
    id: 4,
    title: "Vinyl Record Swap Meet 🎵",
    location: "Silver Lake",
    spots: 20,
    date: "Fri, Mar 27",
    color: "oklch(0.68 0.2 130)",
  },
  {
    id: 5,
    title: "Midnight Bowling Crew 🎳",
    location: "Lucky Strike Lanes",
    spots: 16,
    date: "Fri, Mar 27",
    color: "oklch(0.72 0.24 260)",
  },
  {
    id: 6,
    title: "Farmers Market Brunch 🍳",
    location: "Hollywood Farmers Market",
    spots: 6,
    date: "Sun, Mar 29",
    color: "oklch(0.75 0.18 60)",
  },
];

const TAGS = ["All", "Outdoors", "Music", "Food", "Sports", "Art", "Nightlife"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = TRENDING_HANGOUTS.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 sticky top-0 glass z-10 border-b border-border/50">
        <h1 className="text-xl font-bold gradient-text mb-3">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="explore.search_input"
            placeholder="Search hangouts, people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-11 rounded-xl"
          />
        </div>
      </div>

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
                ? "text-white border-0"
                : "bg-card border border-border text-muted-foreground"
            }`}
            style={
              activeTag === tag
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
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
        <Flame className="w-4 h-4 text-accent" />
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
            className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div
              className="h-28 flex items-end p-3"
              style={{
                background: `linear-gradient(135deg, ${h.color} 0%, oklch(0.15 0 0) 100%)`,
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
    </div>
  );
}
