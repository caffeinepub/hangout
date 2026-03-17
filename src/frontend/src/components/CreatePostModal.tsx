import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Image, Loader2, MapPin, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateHangout, useCreatePost } from "../hooks/useQueries";

type PostMode = "select" | "story" | "post" | "hangout";

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [mode, setMode] = useState<PostMode>("select");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [hangTitle, setHangTitle] = useState("");
  const [hangDesc, setHangDesc] = useState("");
  const [hangDate, setHangDate] = useState("");
  const [hangLocation, setHangLocation] = useState("");
  const [hangSpots, setHangSpots] = useState("10");

  const { mutateAsync: createPost, isPending: creatingPost } = useCreatePost();
  const { mutateAsync: createHangout, isPending: creatingHangout } =
    useCreateHangout();

  const isPending = creatingPost || creatingHangout;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handlePost = async () => {
    try {
      await createPost({ file, caption });
      toast.success(mode === "story" ? "Story shared!" : "Post shared!");
      onClose();
    } catch {
      toast.error("Failed to create post");
    }
  };

  const handleHangout = async () => {
    if (!hangTitle.trim() || !hangLocation.trim() || !hangDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const dateMs = new Date(hangDate).getTime();
      await createHangout({
        title: hangTitle.trim(),
        description: hangDesc.trim(),
        date: BigInt(dateMs) * 1_000_000n,
        location: hangLocation.trim(),
        maxSpots: BigInt(Number.parseInt(hangSpots) || 10),
      });
      toast.success("Hangout created!");
      onClose();
    } catch {
      toast.error("Failed to create hangout");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-lg mx-auto">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full bg-popover rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
            <button
              type="button"
              onClick={mode === "select" ? onClose : () => setMode("select")}
              className="p-1"
            >
              {mode === "select" ? (
                <X className="w-5 h-5" />
              ) : (
                <span className="text-sm text-muted-foreground">Back</span>
              )}
            </button>
            <h2 className="font-semibold">
              {mode === "select"
                ? "Create"
                : mode === "story"
                  ? "New Story"
                  : mode === "post"
                    ? "New Post"
                    : "New Hangout"}
            </h2>
            <div className="w-8" />
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4">
            {mode === "select" && (
              <div className="flex flex-col gap-3 py-2">
                {(
                  [
                    {
                      id: "story",
                      icon: BookOpen,
                      label: "Story",
                      desc: "Share a moment — disappears in 24h",
                      color: "oklch(0.7 0.22 20)",
                    },
                    {
                      id: "post",
                      icon: Image,
                      label: "Post",
                      desc: "Share a photo or video to your profile",
                      color: "oklch(0.65 0.28 305)",
                    },
                    {
                      id: "hangout",
                      icon: MapPin,
                      label: "Hangout Post",
                      desc: "Create an event for people to join",
                      color: "oklch(0.62 0.25 200)",
                    },
                  ] as const
                ).map(({ id, icon: Icon, label, desc, color }) => (
                  <button
                    key={id}
                    type="button"
                    data-ocid={`create.${
                      id === "story"
                        ? "tab"
                        : id === "post"
                          ? "secondary_button"
                          : "primary_button"
                    }`}
                    onClick={() => setMode(id)}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `color-mix(in oklch, ${color} 15%, transparent)`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(mode === "story" || mode === "post") && (
              <div className="flex flex-col gap-4">
                <label
                  htmlFor="post-file"
                  className="aspect-square w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden bg-card"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-10 h-10" />
                      <p className="text-sm">
                        Tap to upload{" "}
                        {mode === "story" ? "story" : "photo/video"}
                      </p>
                    </div>
                  )}
                  <input
                    id="post-file"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Caption</Label>
                  <Textarea
                    data-ocid="create.textarea"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="bg-card border-border rounded-xl resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  data-ocid="create.submit_button"
                  disabled={isPending}
                  onClick={handlePost}
                  className="w-full h-12 rounded-2xl text-white font-semibold border-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
                  }}
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Share ${mode === "story" ? "Story" : "Post"}`
                  )}
                </Button>
              </div>
            )}

            {mode === "hangout" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>
                    Title <span className="text-accent">*</span>
                  </Label>
                  <Input
                    data-ocid="create.input"
                    placeholder="Beach bonfire night 🔥"
                    value={hangTitle}
                    onChange={(e) => setHangTitle(e.target.value)}
                    className="bg-card border-border h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Textarea
                    data-ocid="create.textarea"
                    placeholder="Tell people what this hangout is about..."
                    value={hangDesc}
                    onChange={(e) => setHangDesc(e.target.value)}
                    className="bg-card border-border rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>
                      Date <span className="text-accent">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      value={hangDate}
                      onChange={(e) => setHangDate(e.target.value)}
                      className="bg-card border-border h-11 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Max Spots</Label>
                    <Input
                      type="number"
                      min="1"
                      value={hangSpots}
                      onChange={(e) => setHangSpots(e.target.value)}
                      className="bg-card border-border h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>
                    Location <span className="text-accent">*</span>
                  </Label>
                  <Input
                    placeholder="Where is this happening?"
                    value={hangLocation}
                    onChange={(e) => setHangLocation(e.target.value)}
                    className="bg-card border-border h-11 rounded-xl"
                  />
                </div>

                <Button
                  data-ocid="create.submit_button"
                  disabled={isPending}
                  onClick={handleHangout}
                  className="w-full h-12 rounded-2xl text-white font-semibold border-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
                  }}
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create Hangout"
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
