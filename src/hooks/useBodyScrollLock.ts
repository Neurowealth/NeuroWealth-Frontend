import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
}
