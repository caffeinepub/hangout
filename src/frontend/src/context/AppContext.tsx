import { type ReactNode, createContext, useContext, useState } from "react";
import type { Profile } from "../backend";

export type Page =
  | "home"
  | "explore"
  | "messages"
  | "profile"
  | "chat"
  | "hangoutDetail";

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedHangoutId: bigint | null;
  setSelectedHangoutId: (id: bigint | null) => void;
  selectedChatUserId: string | null;
  setSelectedChatUserId: (id: string | null) => void;
  selectedGroupId: bigint | null;
  setSelectedGroupId: (id: bigint | null) => void;
  viewingProfileId: string | null;
  setViewingProfileId: (id: string | null) => void;
  currentUserProfile: Profile | null;
  setCurrentUserProfile: (profile: Profile | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHangoutId, setSelectedHangoutId] = useState<bigint | null>(
    null,
  );
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<bigint | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(
    null,
  );

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedHangoutId,
        setSelectedHangoutId,
        selectedChatUserId,
        setSelectedChatUserId,
        selectedGroupId,
        setSelectedGroupId,
        viewingProfileId,
        setViewingProfileId,
        currentUserProfile,
        setCurrentUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
