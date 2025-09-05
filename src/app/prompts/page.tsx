import type { Metadata } from "next";
import { Button, SectionCard, TitleBar, TabBar, ThemeToggle, Progress } from "@/components/ui";

export const metadata: Metadata = { title: "Prompts · 13 League Review" };

export default function Page() {
  const tabs = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
    { key: "three", label: "Three" },
  ];

  return (
    <main className="p-6 bg-background text-foreground">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Button</span>
          <Button className="w-56">Click me</Button>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Card</span>
          <SectionCard className="w-56 h-40 flex items-center justify-center">
            Card content
          </SectionCard>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Navbar</span>
          <div className="w-56">
            <TitleBar label="Navigation" />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Tabs</span>
          <TabBar items={tabs} className="w-56" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Progress</span>
          <div className="w-56">
            <Progress value={50} />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Theme</span>
          <div className="w-56 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </main>
  );
}

