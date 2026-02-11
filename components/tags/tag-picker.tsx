"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Plus, X, Loader2 } from "lucide-react";
import { getTags, createTag, type Tag as TagType } from "@/lib/actions/tags";
import { toast } from "sonner";

const TAG_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#f97316", // orange
];

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagPicker({ selectedTags, onTagsChange }: TagPickerProps) {
  const [tags, setTags] = useState<TagType[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const data = await getTags();
    setTags(data);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreating(true);
    const result = await createTag(newTagName.trim(), selectedColor);
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setTags((prev) => [...prev, result.data]);
      onTagsChange([...selectedTags, result.data.id]);
      setNewTagName("");
      toast.success("Tag berhasil dibuat");
    }
    setCreating(false);
  };

  const selectedTagObjects = tags.filter((t) => selectedTags.includes(t.id));

  return (
    <div className="space-y-2">
      {/* Selected tags display */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTagObjects.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pl-2 pr-1"
              style={{
                backgroundColor: tag.color + "20",
                color: tag.color,
                borderColor: tag.color + "40",
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag picker popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <Tag className="h-3.5 w-3.5" />
            {selectedTags.length > 0
              ? `${selectedTags.length} tag dipilih`
              : "Tambah Tag"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          {/* Existing tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? "ring-2 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: tag.color + "20",
                    color: tag.color,
                    borderColor: tag.color,
                    ...(selectedTags.includes(tag.id)
                      ? { ringColor: tag.color }
                      : {}),
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {/* Create new tag */}
          <div className="border-t pt-2 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Buat Tag Baru
            </p>
            <div className="flex gap-1.5">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nama tag..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="h-8 px-2"
                disabled={creating || !newTagName.trim()}
                onClick={handleCreateTag}
              >
                {creating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === color
                      ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
