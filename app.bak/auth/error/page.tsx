import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Coins } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  return (
    <p className="text-sm font-medium text-destructive">
      Error: {params?.error || "Unknown Authentication Failure"}
    </p>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Coins className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            System Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center text-destructive">
            <AlertCircle size={64} />
          </div>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading...</p>
            }
          >
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
