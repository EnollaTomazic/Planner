import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { PlannerProvider, useFocusDate } from "@/components/planner";
import { toISODate } from "@/lib/date";

const RealDate = Date;

describe("PlannerProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    globalThis.Date = RealDate;
    window.localStorage.clear();
  });

  it("initializes focus using the client local day", async () => {
    const offsetMs = 36 * 60 * 60 * 1000;

    type DateConstructorArgs =
      | []
      | ConstructorParameters<typeof Date>;

    class ClientDate extends RealDate {
      constructor(...args: DateConstructorArgs) {
        if (args.length === 0) {
          super(RealDate.now() - offsetMs);
          return;
        }
        super(...args);
      }

      static override now() {
        return RealDate.now() - offsetMs;
      }
    }

    function ClientTimezone({ children }: { children: React.ReactNode }) {
      React.useLayoutEffect(() => {
        globalThis.Date = ClientDate as unknown as typeof Date;
        return () => {
          globalThis.Date = RealDate;
        };
      }, []);
      return <>{children}</>;
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ClientTimezone>
        <PlannerProvider>{children}</PlannerProvider>
      </ClientTimezone>
    );

    const { result, unmount } = renderHook(() => useFocusDate(), {
      wrapper,
    });

    const immediate = toISODate(new Date());
    expect(result.current.iso).toBe(immediate);
    expect(result.current.today).toBe(immediate);

    const expected = toISODate(new ClientDate());

    await waitFor(() => {
      expect(result.current.iso).toBe(expected);
      expect(result.current.today).toBe(expected);
    });

    unmount();
  });
});
