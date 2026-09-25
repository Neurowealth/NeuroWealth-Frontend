import { useEffect, RefObject } from "react";

import { createFocusTrap } from "@/hooks/focusTrap";

export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    return createFocusTrap(ref.current);
  }, [active, ref]);
}
