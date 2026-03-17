import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateGroupChat,
  useGetAllUsers,
  useGetConversations,
  useGetGroupChat,
  useGetMessagesWith,
  useGetProfile,
  useSendGroupMessage,
  useSendMessage,
} from "../hooks/useQueries";

const ICY_BLUE = "oklch(0.75 0.18 220)";
const ICY_BLUE_GRADIENT =
  "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))";

function relativeTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function UserAvatar({ userId, size = 40 }: { userId: string; size?: number }) {
  const { data: profile } = useGetProfile(userId);
  const initial = (profile?.username || userId)[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "oklch(0.75 0.18 220 / 18%)",
        color: ICY_BLUE,
        fontSize: size * 0.38,
        border: "1.5px solid oklch(0.75 0.18 220 / 30%)",
      }}
    >
      {initial}
    </div>
  );
}

function ConversationRow({
  partnerId,
  lastMessage,
  lastTimestamp,
  onClick,
}: {
  partnerId: string;
  lastMessage: string;
  lastTimestamp: bigint;
  onClick: () => void;
}) {
  const { data: profile } = useGetProfile(partnerId);
  const name = profile?.username || `${partnerId.slice(0, 10)}...`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 active:bg-white/10 transition-colors text-left"
    >
      <UserAvatar userId={partnerId} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm truncate">{name}</span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {relativeTime(lastTimestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {lastMessage || "Start a conversation"}
        </p>
      </div>
    </button>
  );
}

function UserPickerRow({
  userId,
  onSelect,
}: {
  userId: string;
  onSelect: () => void;
}) {
  const { data: profile } = useGetProfile(userId);
  const name = profile?.username || `${userId.slice(0, 10)}...`;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 active:bg-white/10 transition-colors text-left"
    >
      <UserAvatar userId={userId} size={42} />
      <span className="font-medium text-sm">{name}</span>
    </button>
  );
}

type ActiveChat =
  | { type: "dm"; userId: string }
  | { type: "group"; groupId: bigint; name: string };

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString();
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<
    { content: string; fromMe: boolean; ts: number; key: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: sendDm, isPending: sendingDm } = useSendMessage();
  const { mutateAsync: createGroup, isPending: creatingGroup } =
    useCreateGroupChat();
  const { mutateAsync: sendGroupMsg, isPending: sendingGroupMsg } =
    useSendGroupMessage();

  const { data: conversations, isLoading: convsLoading } =
    useGetConversations();
  const { data: allUsers } = useGetAllUsers();

  const dmUserId = activeChat?.type === "dm" ? activeChat.userId : null;
  const groupChatId = activeChat?.type === "group" ? activeChat.groupId : null;
  const { data: dmMessages } = useGetMessagesWith(dmUserId);
  const { data: groupChat } = useGetGroupChat(groupChatId);
  const { data: activeDmProfile } = useGetProfile(dmUserId);

  // Auto-scroll to bottom when messages update
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages, groupChat, optimisticMessages]);

  // Clear optimistic messages when real ones arrive
  useEffect(() => {
    if (dmMessages && dmMessages.length > 0) {
      setOptimisticMessages([]);
    }
  }, [dmMessages]);

  const handleSend = async () => {
    if (!msgInput.trim() || !activeChat) return;
    const content = msgInput.trim();
    setMsgInput("");
    const key = `opt-${Date.now()}-${Math.random()}`;
    setOptimisticMessages((prev) => [
      ...prev,
      { content, fromMe: true, ts: Date.now(), key },
    ]);
    try {
      if (activeChat.type === "dm") {
        await sendDm({ recipientId: activeChat.userId, content });
      } else {
        await sendGroupMsg({ groupId: activeChat.groupId, content });
      }
    } catch {
      toast.error("Failed to send message");
      setOptimisticMessages((prev) => prev.filter((m) => m.key !== key));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    const members = groupMembers
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const group = await createGroup({ name: groupName.trim(), members });
      setActiveChat({ type: "group", groupId: group.id, name: group.name });
      setOptimisticMessages([]);
      setShowNewGroup(false);
      setGroupName("");
      setGroupMembers("");
      toast.success("Group created!");
    } catch {
      toast.error("Failed to create group");
    }
  };

  // --- THREAD VIEW ---
  if (activeChat) {
    const activeName =
      activeChat.type === "dm"
        ? activeDmProfile?.username || `${activeChat.userId.slice(0, 10)}...`
        : activeChat.name;

    const realMessages =
      activeChat.type === "dm"
        ? (dmMessages ?? []).map((m) => ({
            content: m.content,
            fromMe: m.sender.toString() === myId,
            ts: Number(m.timestamp / 1_000_000n),
            key: m.id.toString(),
          }))
        : (groupChat?.messages ?? []).map((m) => ({
            content: m.content,
            fromMe: m.sender.toString() === myId,
            ts: Number(m.timestamp / 1_000_000n),
            key: m.id.toString(),
          }));

    // Merge real + optimistic, deduplicate by key
    const realKeys = new Set(realMessages.map((m) => m.key));
    const allMessages = [
      ...realMessages,
      ...optimisticMessages.filter((m) => !realKeys.has(m.key)),
    ].sort((a, b) => a.ts - b.ts);

    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border/30 sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
          <button
            type="button"
            data-ocid="messages.link"
            onClick={() => {
              setActiveChat(null);
              setOptimisticMessages([]);
            }}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <UserAvatar
            userId={activeChat.type === "dm" ? activeChat.userId : "group"}
            size={36}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{activeName}</p>
            {activeChat.type === "group" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Group chat
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          data-ocid="messages.panel"
          className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-4 pb-4"
        >
          {allMessages.length === 0 ? (
            <div
              data-ocid="messages.empty_state"
              className="flex flex-col items-center justify-center h-full gap-2 text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.75 0.18 220 / 10%)" }}
              >
                <MessageCircle
                  className="w-7 h-7"
                  style={{ color: ICY_BLUE }}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello! 👋
              </p>
            </div>
          ) : (
            allMessages.map((msg, i) => (
              <motion.div
                key={msg.key}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                data-ocid={`messages.item.${i + 1}`}
                className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.fromMe
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm text-foreground"
                  }`}
                  style={
                    msg.fromMe
                      ? { background: ICY_BLUE_GRADIENT }
                      : {
                          background: "#1a1a1a",
                          border: "1px solid oklch(0.3 0 0)",
                        }
                  }
                >
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 pb-24 pt-2 border-t border-border/30">
          <div
            className="flex gap-2 rounded-2xl p-2"
            style={{
              background: "#111",
              border: "1px solid oklch(0.3 0 0)",
            }}
          >
            <Input
              data-ocid="messages.input"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message..."
              className="border-0 bg-transparent focus-visible:ring-0 h-9 text-sm placeholder:text-muted-foreground/50"
            />
            <Button
              data-ocid="messages.submit_button"
              size="icon"
              disabled={!msgInput.trim() || sendingDm || sendingGroupMsg}
              onClick={handleSend}
              className="w-9 h-9 rounded-xl flex-shrink-0 border-0"
              style={{ background: ICY_BLUE_GRADIENT, color: "white" }}
            >
              {sendingDm || sendingGroupMsg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- INBOX VIEW ---
  const otherUsers = (allUsers ?? []).filter((u) => u.toString() !== myId);
  const filteredUsers = searchQuery
    ? otherUsers.filter((u) =>
        u.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : otherUsers;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b border-border/30">
        <h1 className="text-xl font-bold" style={{ color: ICY_BLUE }}>
          Messages
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="messages.open_modal_button"
            onClick={() => setShowNewGroup(true)}
            className="p-2 rounded-full hover:bg-white/10"
            title="New group chat"
          >
            <Users className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            data-ocid="messages.secondary_button"
            onClick={() => setShowCompose(true)}
            className="p-2 rounded-full hover:bg-white/10"
            title="New message"
          >
            <Edit className="w-5 h-5" style={{ color: ICY_BLUE }} />
          </button>
        </div>
      </div>

      {/* Conversation list */}
      {convsLoading ? (
        <div data-ocid="messages.loading_state" className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : (conversations ?? []).length > 0 ? (
        <div className="flex flex-col">
          {(conversations ?? []).map((conv) => (
            <ConversationRow
              key={conv.partner.toString()}
              partnerId={conv.partner.toString()}
              lastMessage={conv.lastMessage}
              lastTimestamp={conv.lastTimestamp}
              onClick={() => {
                setActiveChat({ type: "dm", userId: conv.partner.toString() });
                setOptimisticMessages([]);
              }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          data-ocid="messages.empty_state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.75 0.18 220 / 10%)",
              border: "1px solid oklch(0.75 0.18 220 / 20%)",
            }}
          >
            <MessageCircle className="w-9 h-9" style={{ color: ICY_BLUE }} />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">No messages yet</h3>
            <p className="text-muted-foreground text-sm">
              Tap the compose icon to start a conversation
            </p>
          </div>
        </motion.div>
      )}

      {/* Compose / New DM bottom sheet */}
      <AnimatePresence>
        {showCompose && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowCompose(false)}
            />
            <motion.div
              data-ocid="messages.dialog"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 bg-[#111] rounded-t-3xl"
              style={{ border: "1px solid oklch(0.25 0 0)" }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="font-bold text-base">New Message</h3>
                <button
                  type="button"
                  data-ocid="messages.close_button"
                  onClick={() => {
                    setShowCompose(false);
                    setSearchQuery("");
                  }}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 pb-3">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    data-ocid="messages.search_input"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-72 pb-6">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No users found
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <UserPickerRow
                      key={u.toString()}
                      userId={u.toString()}
                      onSelect={() => {
                        setActiveChat({ type: "dm", userId: u.toString() });
                        setOptimisticMessages([]);
                        setShowCompose(false);
                        setSearchQuery("");
                      }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New group bottom sheet */}
      <AnimatePresence>
        {showNewGroup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowNewGroup(false)}
            />
            <motion.div
              data-ocid="messages.dialog"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 bg-[#111] rounded-t-3xl p-5 flex flex-col gap-3"
              style={{ border: "1px solid oklch(0.25 0 0)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base">New Group Chat</h3>
                <button
                  type="button"
                  data-ocid="messages.close_button"
                  onClick={() => setShowNewGroup(false)}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Input
                data-ocid="messages.input"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-white/5 border-white/10 h-11 rounded-xl"
              />
              <Input
                placeholder="Member IDs (comma separated)"
                value={groupMembers}
                onChange={(e) => setGroupMembers(e.target.value)}
                className="bg-white/5 border-white/10 h-11 rounded-xl"
              />
              <Button
                data-ocid="messages.confirm_button"
                onClick={handleCreateGroup}
                disabled={creatingGroup || !groupName.trim()}
                className="w-full h-11 rounded-xl border-0 text-white"
                style={{ background: ICY_BLUE_GRADIENT }}
              >
                {creatingGroup ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Group"
                )}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
