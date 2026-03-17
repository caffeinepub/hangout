import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import CreatePostModal from "./components/CreatePostModal";
import { AppProvider, useApp } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";

function AuthenticatedApp() {
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const { currentPage, setCurrentUserProfile } = useApp();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (profile) setCurrentUserProfile(profile);
  }, [profile, setCurrentUserProfile]);

  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const showProfileSetup = !!identity && isFetched && profile === null;

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
      </main>
      <BottomNav onCreatePress={() => setShowCreate(true)} />
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function AppInner() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === "logging-in";

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div
          className="w-12 h-12"
          style={{
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "oklch(0.65 0.28 305)",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
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
