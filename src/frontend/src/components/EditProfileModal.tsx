import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Profile } from "../backend";
import { useApp } from "../context/AppContext";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

type Gender = "male" | "female" | "other" | "";

function getBioPlaceholder(gender: Gender) {
  if (gender === "male") return "The way i think of myself 💪🦴";
  if (gender === "female") return "I love being ...💅";
  return "Tell people about yourself...";
}

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
}

export default function EditProfileModal({
  profile,
  onClose,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [gender, setGender] = useState<Gender>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar?.getDirectURL() || null,
  );
  const { mutateAsync: save, isPending } = useSaveCallerUserProfile();
  const { setCurrentUserProfile } = useApp();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAvatarFile(f);
      setAvatarPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    try {
      let avatar = profile.avatar;
      if (avatarFile) {
        const bytes = new Uint8Array(await avatarFile.arrayBuffer());
        avatar = ExternalBlob.fromBytes(bytes);
      }
      const updated = {
        ...profile,
        username: username.trim(),
        bio: bio.trim(),
        avatar,
      };
      await save(updated);
      setCurrentUserProfile(updated);
      toast.success("Profile updated!");
      onClose();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div
      data-ocid="profile.modal"
      className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-lg mx-auto"
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        className="w-full bg-popover rounded-t-3xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Edit Profile</h2>
          <button
            type="button"
            data-ocid="profile.close_button"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary/30">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="bg-muted text-xl">
                {username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="edit-avatar"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-black" />
            </label>
            <input
              id="edit-avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Username</Label>
          <Input
            data-ocid="profile.input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-card border-border h-11 rounded-xl"
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
                data-ocid={`profile.gender_${opt.value}`}
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
          <Label>Bio</Label>
          <Textarea
            data-ocid="profile.textarea"
            value={bio}
            placeholder={getBioPlaceholder(gender)}
            onChange={(e) => setBio(e.target.value)}
            className="bg-card border-border rounded-xl resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button
            data-ocid="profile.cancel_button"
            variant="outline"
            className="flex-1 h-11 rounded-xl border-border"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="profile.save_button"
            disabled={isPending || !username.trim()}
            onClick={handleSave}
            className="flex-1 h-11 rounded-xl font-semibold border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.18 220), oklch(0.65 0.22 200))",
              color: "black",
            }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
