import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bell } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";

const ICY_BLUE = "oklch(0.75 0.18 220)";

export default function NotificationsPage() {
  const { goBack } = useApp();
  const isLoading = false;

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

      {/* Skeleton loading state */}
      {isLoading ? (
        <div
          data-ocid="notifications.loading_state"
          className="flex flex-col gap-1 px-4 pt-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
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
      )}
    </div>
  );
}
