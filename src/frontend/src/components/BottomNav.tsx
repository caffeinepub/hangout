import { Home, MessageCircle, PlusCircle, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { type Page, useApp } from "../context/AppContext";

interface BottomNavProps {
  onCreatePress: () => void;
}

const NAV_ITEMS: {
  icon: typeof Home;
  page: Page | null;
  label: string;
  ocid: string;
}[] = [
  { icon: Home, page: "home", label: "Home", ocid: "nav.home" },
  { icon: Search, page: "explore", label: "Explore", ocid: "nav.explore" },
  { icon: PlusCircle, page: null, label: "Create", ocid: "nav.create" },
  {
    icon: MessageCircle,
    page: "messages",
    label: "Messages",
    ocid: "nav.messages",
  },
  { icon: User, page: "profile", label: "Profile", ocid: "nav.profile" },
];

export default function BottomNav({ onCreatePress }: BottomNavProps) {
  const { currentPage, setCurrentPage, setViewingProfileId } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto glass border-t border-border/50 z-20">
      <div className="flex items-center justify-around px-2 py-3">
        {NAV_ITEMS.map(({ icon: Icon, page, label, ocid }) => {
          const isActive = page && currentPage === page;
          const isCreate = page === null;

          return (
            <button
              key={label}
              type="button"
              data-ocid={ocid}
              onClick={() => {
                if (isCreate) {
                  onCreatePress();
                } else if (page) {
                  if (page === "profile") setViewingProfileId(null);
                  setCurrentPage(page);
                }
              }}
              className="flex flex-col items-center gap-0.5 relative px-3 py-1"
            >
              {isCreate ? (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
                  }}
                >
                  <Icon className="w-5 h-5 text-black" />
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon
                      className="w-6 h-6 transition-colors"
                      style={{
                        color: isActive
                          ? "oklch(0.75 0.18 220)"
                          : "oklch(0.55 0 0)",
                      }}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="w-1 h-1 rounded-full"
                      style={{ background: "oklch(0.75 0.18 220)" }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
