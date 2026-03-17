import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useApp } from "../context/AppContext";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

type Gender = "male" | "female" | "other" | "";

function getBioPlaceholder(gender: Gender) {
  if (gender === "male") return "The way i think of myself 💪🦴";
  if (gender === "female") return "I love being ...💅";
  return "Tell people about yourself...";
}

export default function ProfileSetupPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();
  const { setCurrentUserProfile } = useApp();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    try {
      let avatar: ExternalBlob | undefined;
      if (avatarFile) {
        const bytes = new Uint8Array(await avatarFile.arrayBuffer());
        avatar = ExternalBlob.fromBytes(bytes);
      }
      const profile = {
        username: username.trim(),
        bio: bio.trim(),
        followers: 0n,
        following: 0n,
        avatar,
      };
      await saveProfile(profile);
      setCurrentUserProfile(profile);
      toast.success("Profile created!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "oklch(0.75 0.18 220)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-1">
            Set Up Your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Let people know who you are
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary/40">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-muted text-2xl">
                  {username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Tap to add a photo
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username <span className="text-accent">*</span>
            </Label>
            <Input
              data-ocid="setup.input"
              id="username"
              placeholder="@yourusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-card border-border h-12 rounded-xl"
            />
          </div>

          {/* Gender selector */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Gender</Label>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-ocid={`setup.gender_${opt.value}`}
                  onClick={() =>
                    setGender((prev) => (prev === opt.value ? "" : opt.value))
                  }
                  className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={
                    gender === opt.value
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
                          color: "black",
                          border: "1px solid transparent",
                        }
                      : {
                          background: "transparent",
                          color: "oklch(0.65 0 0)",
                          border: "1px solid oklch(0.28 0 0)",
                        }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              data-ocid="setup.textarea"
              id="bio"
              placeholder={getBioPlaceholder(gender)}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-card border-border rounded-xl resize-none"
              rows={3}
            />
          </div>

          <Button
            data-ocid="setup.submit_button"
            type="submit"
            disabled={isPending || !username.trim()}
            className="w-full h-12 text-base font-semibold rounded-2xl border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
              color: "black",
            }}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Start Hanging Out"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
