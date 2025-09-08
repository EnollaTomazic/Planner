import * as React from "react";
import IconButton from "@/components/ui/primitives/IconButton";
import { ArrowUp } from "lucide-react";

type ScrollTopFloatingButtonProps = {
  watchRef: React.RefObject<HTMLElement>;
  forceVisible?: boolean;
};

export default function ScrollTopFloatingButton({
  watchRef,
  forceVisible = false,
}: ScrollTopFloatingButtonProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const target = watchRef.current;
    if (!target) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => setVisible(!e.isIntersecting));
    });
    obs.observe(target);
    return () => obs.disconnect();
  }, [watchRef]);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible && !forceVisible) return null;

  return (
    <IconButton
      aria-label="Scroll to top"
      onClick={scrollTop}
      className="fixed bottom-8 right-2 z-50"
    >
      <ArrowUp />
    </IconButton>
  );
}
