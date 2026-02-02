"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recommendation {
  type: "warning" | "tip" | "success";
  title: string;
  message: string;
  priority: number;
}

interface SmartRecommendationsProps {
  recommendations: Recommendation[];
}

export function SmartRecommendations({
  recommendations,
}: SmartRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />;
      case "tip":
        return <Lightbulb className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBgColor = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800";
      case "success":
        return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
      case "tip":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Rekomendasi Pintar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                getBgColor(rec.type),
              )}
            >
              {getIcon(rec.type)}
              <div>
                <h4 className="font-semibold text-sm">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
