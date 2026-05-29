"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setMessage(msg);
      timeoutRef.current = window.setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const toast = (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <Check className="size-4 shrink-0 text-emerald-400" />
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return { showToast, toast };
}
