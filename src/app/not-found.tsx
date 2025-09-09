import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link href="/"><Button>Go home</Button></Link>
    </main>
  );
}
