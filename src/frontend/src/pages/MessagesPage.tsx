import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Plus, Send, Users, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateGroupChat,
  useGetGroupChat,
  useSendGroupMessage,
  useSendMessage,
} from "../hooks/useQueries";

const MOCK_CONVERSATIONS = [
  {
    id: "user1",
    name: "Alex Rivera",
    lastMsg: "Are you joining tonight? 🔥",
    time: "2m",
    unread: 2,
    initials: "AR",
    isRequest: false,
  },
  {
    id: "user2",
    name: "Jamie Chen",
    lastMsg: "That hangout was amazing!",
    time: "15m",
    unread: 0,
    initials: "JC",
    isRequest: false,
  },
  {
    id: "user3",
    name: "Sam Torres",
    lastMsg: "Message request",
    time: "1h",
    unread: 1,
    initials: "ST",
    isRequest: true,
  },
  {
    id: "user4",
    name: "Riley Park",
    lastMsg: "See you there! 👋",
    time: "3h",
    unread: 0,
    initials: "RP",
    isRequest: false,
  },
];

type DMView = { type: "dm"; userId: string; name: string };
type GroupView = { type: "group"; groupId: bigint; name: string };
type ActiveChat = DMView | GroupView;

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString();
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [newDmId, setNewDmId] = useState("");
  const [showNewDm, setShowNewDm] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { content: string; fromMe: boolean; time: string; key: string }[]
  >([]);

  const { mutateAsync: sendDm, isPending: sendingDm } = useSendMessage();
  const { mutateAsync: createGroup, isPending: creatingGroup } =
    useCreateGroupChat();
  const { mutateAsync: sendGroupMsg, isPending: sendingGroupMsg } =
    useSendGroupMessage();

  const groupChatId =
    activeChat?.type === "group" ? (activeChat as GroupView).groupId : null;
  const { data: groupChat } = useGetGroupChat(groupChatId);

  const handleSend = async () => {
    if (!msgInput.trim() || !activeChat) return;
    const content = msgInput.trim();
    setMsgInput("");
    const key = `${Date.now()}-${Math.random()}`;
    setLocalMessages((prev) => [
      ...prev,
      { content, fromMe: true, time: "now", key },
    ]);
    try {
      if (activeChat.type === "dm") {
        await sendDm({ recipientId: activeChat.userId, content });
      } else {
        await sendGroupMsg({
          groupId: (activeChat as GroupView).groupId,
          content,
        });
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleOpenDm = () => {
    if (!newDmId.trim()) return;
    setActiveChat({
      type: "dm",
      userId: newDmId.trim(),
      name: `${newDmId.trim().slice(0, 12)}...`,
    });
    setLocalMessages([]);
    setShowNewDm(false);
    setNewDmId("");
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
      setLocalMessages([]);
      setShowNewGroup(false);
      setGroupName("");
      setGroupMembers("");
      toast.success("Group created!");
    } catch {
      toast.error("Failed to create group");
    }
  };

  if (activeChat) {
    const messages =
      activeChat.type === "group" && groupChat
        ? groupChat.messages.map((m) => ({
            content: m.content,
            fromMe: m.sender.toString() === myId,
            time: new Date(Number(m.timestamp / 1_000_000n)).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            key: m.id.toString(),
          }))
        : localMessages;

    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border/50 glass sticky top-0 z-10">
          <button
            type="button"
            onClick={() => {
              setActiveChat(null);
              setLocalMessages([]);
            }}
            className="p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {activeChat.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{activeChat.name}</p>
            {activeChat.type === "group" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Group chat
              </p>
            )}
          </div>
        </div>

        <div
          data-ocid="messages.panel"
          className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-4 pb-24"
        >
          {messages.length === 0 ? (
            <div
              data-ocid="messages.empty_state"
              className="flex flex-col items-center justify-center h-full gap-2 text-center"
            >
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.fromMe
                      ? "text-white rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                  style={
                    msg.fromMe
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
                        }
                      : {}
                  }
                >
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-4 pb-2">
          <div className="flex gap-2 bg-card border border-border rounded-2xl p-2">
            <Input
              data-ocid="messages.input"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message..."
              className="border-0 bg-transparent focus-visible:ring-0 h-9"
            />
            <Button
              data-ocid="messages.submit_button"
              size="icon"
              disabled={!msgInput.trim() || sendingDm || sendingGroupMsg}
              onClick={handleSend}
              className="w-9 h-9 rounded-xl flex-shrink-0 text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
              }}
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

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-12 pb-4 sticky top-0 glass z-10 border-b border-border/50">
        <h1 className="text-xl font-bold gradient-text">Messages</h1>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="messages.open_modal_button"
            onClick={() => setShowNewGroup(true)}
            className="p-2 rounded-full bg-card border border-border"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-ocid="messages.secondary_button"
            onClick={() => setShowNewDm(true)}
            className="p-2 rounded-full bg-card border border-border"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showNewDm && (
        <div
          data-ocid="messages.dialog"
          className="fixed inset-0 bg-black/60 z-50 flex items-end"
        >
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className="w-full max-w-lg mx-auto bg-popover rounded-t-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">New Message</h3>
              <button type="button" onClick={() => setShowNewDm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              data-ocid="messages.input"
              placeholder="Enter user Principal ID"
              value={newDmId}
              onChange={(e) => setNewDmId(e.target.value)}
              className="bg-card border-border h-11 rounded-xl"
            />
            <Button
              data-ocid="messages.confirm_button"
              onClick={handleOpenDm}
              className="w-full h-11 rounded-xl text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
              }}
            >
              Open Chat
            </Button>
          </motion.div>
        </div>
      )}

      {showNewGroup && (
        <div
          data-ocid="messages.dialog"
          className="fixed inset-0 bg-black/60 z-50 flex items-end"
        >
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className="w-full max-w-lg mx-auto bg-popover rounded-t-2xl p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">New Group Chat</h3>
              <button type="button" onClick={() => setShowNewGroup(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              data-ocid="messages.input"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-card border-border h-11 rounded-xl"
            />
            <Input
              placeholder="Member IDs (comma separated)"
              value={groupMembers}
              onChange={(e) => setGroupMembers(e.target.value)}
              className="bg-card border-border h-11 rounded-xl"
            />
            <Button
              data-ocid="messages.confirm_button"
              onClick={handleCreateGroup}
              disabled={creatingGroup || !groupName.trim()}
              className="w-full h-11 rounded-xl text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
              }}
            >
              {creatingGroup ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Group"
              )}
            </Button>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col divide-y divide-border/40">
        {MOCK_CONVERSATIONS.map((conv, i) => (
          <motion.button
            key={conv.id}
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`messages.item.${i + 1}`}
            className="flex items-center gap-3 px-4 py-4 hover:bg-card/50 transition-colors text-left"
            onClick={() => {
              setActiveChat({ type: "dm", userId: conv.id, name: conv.name });
              setLocalMessages([]);
            }}
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    background: "oklch(0.65 0.28 305 / 20%)",
                    color: "oklch(0.75 0.2 305)",
                  }}
                >
                  {conv.initials}
                </AvatarFallback>
              </Avatar>
              {conv.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full gradient-primary text-white text-xs flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{conv.name}</p>
                <span className="text-xs text-muted-foreground">
                  {conv.time}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {conv.isRequest && (
                  <Badge
                    variant="outline"
                    className="text-xs border-accent/60 text-accent py-0 h-4"
                  >
                    Request
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {conv.lastMsg}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
