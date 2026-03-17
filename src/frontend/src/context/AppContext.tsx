import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Profile } from "../backend";

export type Page =
  | "home"
  | "explore"
  | "messages"
  | "profile"
  | "chat"
  | "hangoutDetail"
  | "notifications";

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  goBack: () => void;
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
  pageHistory: Page[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageRaw] = useState<Page>("home");
  const [pageHistory, setPageHistory] = useState<Page[]>([]);
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

  const setCurrentPage = useCallback(
    (page: Page) => {
      setPageHistory((prev) => {
        if (prev[prev.length - 1] === currentPage) return prev;
        return [...prev, currentPage];
      });
      setCurrentPageRaw(page);
    },
    [currentPage],
  );

  const goBack = useCallback(() => {
    setPageHistory((prev) => {
      if (prev.length === 0) {
        if (currentPage !== "home") {
          setCurrentPageRaw("home");
        }
        return prev;
      }
      const next = [...prev];
      const target = next.pop() as Page;
      setCurrentPageRaw(target);
      return next;
    });
  }, [currentPage]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        goBack,
        pageHistory,
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
