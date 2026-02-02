"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Goal } from "@/lib/types";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Target } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GOAL_ICONS = [
  "🎯",
  "🏠",
  "🚗",
  "✈️",
  "💰",
  "📱",
  "💻",
  "🎓",
  "💍",
  "🏥",
  "👶",
  "🎁",
];

interface GoalDialogProps {
  goal?: Goal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalDialog({ goal, open, onOpenChange }: GoalDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || "🎯");

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);

    try {
      const result = goal
        ? await updateGoal(goal.id, formData)
        : await createGoal(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(goal ? t.goals.update_success : t.goals.create_success);
        setDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!goal && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.goals.add_goal}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {goal ? t.goals.edit_goal : t.goals.add_goal}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.goals.icon_label}</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 text-xl rounded-md border-2 transition-colors ${
                    selectedIcon === icon
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-muted"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t.goals.name_label}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={goal?.name}
              placeholder={t.goals.name_placeholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">{t.goals.target_amount_label}</Label>
            <CurrencyInput
              name="target_amount"
              defaultValue={goal?.target_amount}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_amount">
              {t.goals.current_amount_label}
            </Label>
            <CurrencyInput
              name="current_amount"
              defaultValue={goal?.current_amount}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">{t.goals.target_date_label}</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={goal?.target_date?.split("T")[0]}
            />
          </div>

          {goal && (
            <div className="space-y-2">
              <Label htmlFor="status">{t.goals.status_label}</Label>
              <Select name="status" defaultValue={goal.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t.goals.status_active}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t.goals.status_completed}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t.goals.status_cancelled}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.common.saving : t.common.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
