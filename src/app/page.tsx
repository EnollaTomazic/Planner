// Root: "/" → Home
import { Suspense } from "react";
import { HomePage } from "@/components/home";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
