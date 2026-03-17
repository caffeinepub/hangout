import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import BottomNav from "./components/BottomNav";
import CreatePostModal from "./components/CreatePostModal";
import { AppProvider, useApp } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";

function AuthenticatedApp() {
  const {
    data: profile,
    isLoading,
    isFetched,
    isError,
  } = useGetCallerUserProfile();
  const { identity, clear } = useInternetIdentity();
  const { currentPage, setCurrentUserProfile, goBack, pageHistory } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile) setCurrentUserProfile(profile);
  }, [profile, setCurrentUserProfile]);

  // Safety timeout
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimedOut(false);

    if (isLoading || !isFetched) {
      timerRef.current = setTimeout(() => setTimedOut(true), 15000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFetched]);

  // Back button handling
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (pageHistory.length > 0 || currentPage !== "home") {
        goBack();
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [goBack, pageHistory, currentPage]);

  const effectivelyDone = isFetched || isError;
  const effectivelyLoading = isLoading && !isError;

  if (effectivelyLoading && !effectivelyDone) {
    if (timedOut) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <p className="text-foreground font-semibold">Taking too long...</p>
            <p className="text-muted-foreground text-sm">
              Something went wrong connecting to the server.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 220), oklch(0.78 0.14 200))",
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                window.location.reload();
              }}
              className="text-xs text-muted-foreground underline"
            >
              Sign out and try again
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const showProfileSetup = !!identity && (profile === null || isError);

  if (showProfileSetup) {
    return <ProfileSetupPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-20">
        {currentPage === "home" && (
          <HomePage onCreatePost={() => setShowCreate(true)} />
        )}
        {currentPage === "explore" && <ExplorePage />}
        {currentPage === "messages" && <MessagesPage />}
        {currentPage === "profile" && <ProfilePage userId={null} />}
        {currentPage === "notifications" && <NotificationsPage />}
      </main>
      <BottomNav onCreatePress={() => setShowCreate(true)} />
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 rounded-full gradient-primary animate-pulse" />
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <Toaster position="top-center" theme="dark" />
    </AppProvider>
  );
}
