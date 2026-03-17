import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";

const ICY_BLUE = "oklch(0.75 0.18 220)";

interface Notification {
  id: number;
  type: "like" | "follow" | "comment" | "approval";
  text: string;
  subtext: string;
  time: string;
  initial: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "like",
    text: "alex_vibes liked your post",
    subtext: "Double tapped your hangout photo ❤️",
    time: "2m ago",
    initial: "A",
  },
  {
    id: 2,
    type: "follow",
    text: "zara.cool started following you",
    subtext: "You can follow them back",
    time: "15m ago",
    initial: "Z",
  },
  {
    id: 3,
    type: "comment",
    text: "jay.out commented on your hangout",
    subtext: '"This looks so fun, count me in!"',
    time: "1h ago",
    initial: "J",
  },
  {
    id: 4,
    type: "approval",
    text: "Your hangout request was approved",
    subtext: "You're in for Saturday Night Rooftop 🎉",
    time: "3h ago",
    initial: "R",
  },
];

function NotifIcon({ type }: { type: Notification["type"] }) {
  const size = "w-4 h-4";
  switch (type) {
    case "like":
      return (
        <Heart
          className={size}
          style={{ color: "oklch(0.65 0.22 10)" }}
          fill="oklch(0.65 0.22 10)"
        />
      );
    case "follow":
      return <UserPlus className={size} style={{ color: ICY_BLUE }} />;
    case "comment":
      return <MessageCircle className={size} style={{ color: ICY_BLUE }} />;
    case "approval":
      return (
        <CheckCircle
          className={size}
          style={{ color: "oklch(0.72 0.17 155)" }}
        />
      );
  }
}

export default function NotificationsPage() {
  const { goBack } = useApp();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 glass z-10 border-b border-border/50">
        <button
          type="button"
          data-ocid="notifications.link"
          onClick={goBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted/30 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold gradient-text">Notifications</h1>
      </div>

      {/* Content */}
      {MOCK_NOTIFICATIONS.length === 0 ? (
        <motion.div
          data-ocid="notifications.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 px-6 text-center gap-4"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.15 0.04 220)" }}
          >
            <Bell className="w-10 h-10" style={{ color: ICY_BLUE }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">
              When people interact with you, it'll show up here.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col">
          {/* Section header */}
          <div className="px-4 py-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: ICY_BLUE }}
            >
              Today
            </span>
          </div>

          {/* Notification items */}
          <div className="flex flex-col">
            {MOCK_NOTIFICATIONS.map((notif, i) => (
              <motion.div
                key={notif.id}
                data-ocid={`notifications.item.${i + 1}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors active:bg-muted/30"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-black"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
                    }}
                  >
                    {notif.initial}
                  </div>
                  {/* Type badge */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
                    style={{ background: "oklch(0.12 0.03 220)" }}
                  >
                    <NotifIcon type={notif.type} />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {notif.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {notif.subtext}
                  </p>
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {notif.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
