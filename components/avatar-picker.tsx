"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface AvatarPickerProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarPicker({
  currentAvatar,
  onAvatarChange,
}: AvatarPickerProps) {
  const { t } = useTranslation();
  const [seed, setSeed] = useState("");
  const [debouncedSeed] = useDebounce(seed, 500);

  const baseUrl = "https://api.dicebear.com/9.x/notionists/svg";

  // If seed is empty, we might show a default or the current avatar
  // If debouncedSeed is present, we show the generated one.

  const generatedUrl = debouncedSeed
    ? `${baseUrl}?seed=${encodeURIComponent(debouncedSeed)}`
    : currentAvatar || `${baseUrl}?seed=default`;

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setSeed(randomSeed);
  };

  const handleApply = () => {
    onAvatarChange(generatedUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border">
          <Image
            src={generatedUrl}
            alt="Avatar Preview"
            fill
            className="object-cover"
            unoptimized // Dicebear returns SVG
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Generate Avatar</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter seed (e.g. your name)"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRandomize}
              title="Randomize"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Button onClick={handleApply} disabled={!seed && !currentAvatar}>
        Use this Avatar
      </Button>
    </div>
  );
}
