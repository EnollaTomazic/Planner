import * as React from "react";

export type NeonPhase = "steady-on" | "ignite" | "off" | "powerdown";

export function useNeonPhase(on: boolean) {
  const prev = React.useRef(on);
  const [phase, setPhase] = React.useState<NeonPhase>(on ? "steady-on" : "off");

  React.useEffect(() => {
    if (on !== prev.current) {
      if (on) {
        setPhase("ignite");
        const t = window.setTimeout(() => setPhase("steady-on"), 620);
        prev.current = on;
        return () => window.clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = window.setTimeout(() => setPhase("off"), 360);
        prev.current = on;
        return () => window.clearTimeout(t);
      }
    }
    prev.current = on;
  }, [on]);

  const retrigger = React.useCallback(() => {
    setPhase("ignite");
    const t = window.setTimeout(() => setPhase(on ? "steady-on" : "off"), 620);
    return () => window.clearTimeout(t);
  }, [on]);

  const lit = phase === "ignite" || phase === "steady-on";

  return { phase, lit, retrigger };
}

export default useNeonPhase;
