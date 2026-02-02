"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { Category } from "@/lib/types";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryDialogProps {
  category?: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Simple curated list of emojis for categories
const EMOJI_OPTIONS = [
  "🍔",
  "🛒",
  "🚗",
  "🏠",
  "💡",
  "🎮",
  "💊",
  "✈️",
  "🎓",
  "💼",
  "💰",
  "🎁",
  "🐶",
  "👶",
  "🔧",
  "💳",
  "📈",
  "📉",
  "🛡️",
  "🎉",
  "☕",
  "🍕",
  "👕",
  "💇",
  "📱",
  "🎬",
  "🏋️",
  "🎵",
  "📚",
  "🚌",
];

export function CategoryDialog({
  category,
  open,
  onOpenChange,
}: CategoryDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(
    category?.icon || EMOJI_OPTIONS[0],
  );

  const isEdit = !!category;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);

    try {
      let result;
      if (isEdit) {
        result = await updateCategory(category.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit ? t.categories.update_success : t.categories.create_success,
        );
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.categories.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.categories.edit_title : t.categories.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.categories.name_label}</Label>
              <Input
                name="name"
                defaultValue={category?.name}
                placeholder="e.g., Food, Transport, Salary"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.categories.type_label}</Label>
              <Select name="type" defaultValue={category?.type || "expense"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    {t.categories.types.expense}
                  </SelectItem>
                  <SelectItem value="income">
                    {t.categories.types.income}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.categories.icon_label}</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-[150px] overflow-y-auto">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedIcon(emoji)}
                    className={`text-2xl p-2 rounded-md hover:bg-accent transition-colors ${selectedIcon === emoji ? "bg-accent ring-2 ring-primary" : ""}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
