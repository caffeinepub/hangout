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

  return (
    <div
      data-ocid="profile.modal"
      className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-lg mx-auto"
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        className="w-full bg-popover rounded-t-3xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
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
              <Camera className="w-3.5 h-3.5 text-white" />
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

        <div className="flex flex-col gap-2">
          <Label>Bio</Label>
          <Textarea
            data-ocid="profile.textarea"
            value={bio}
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
            className="flex-1 h-11 rounded-xl text-white font-semibold border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.22 20))",
            }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
