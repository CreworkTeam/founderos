"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { classifyIdea } from "@/lib/classifierClient";

const MIN = 20;
const MAX = 400;

export function Q2Idea({
  value,
  onChange,
  violation,
}: {
  value: string;
  onChange: (val: string) => void;
  violation?: string | null;
}) {
  const [detected, setDetected] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 15) {
      setDetected(null);
      setDetecting(false);
      return;
    }
    setDetecting(true);
    setDetected(null);
    debounceRef.current = setTimeout(() => {
      const result = classifyIdea(value);
      setDetected(result.label);
      setDetecting(false);
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <section className="rounded-xl bg-[#F3EDE2] px-5 py-6 sm:px-7">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-black text-[11px] font-bold text-white">
          02
        </span>
        <h3 className="text-[24px] font-semibold leading-7 tracking-[-0.02em] text-[#191c1d] sm:text-[26px]">
          Describe your core idea
        </h3>
      </div>

      <div className="relative mt-5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX}
          rows={4}
          placeholder="Ex: A collaborative platform for local pet sitters and pet owners with integrated health tracking..."
          className="w-full resize-none rounded-md border border-[#E7E2D7] bg-[#FCF8EE] px-4 py-4 text-[14px] leading-6 text-[#0a0a0a] outline-none transition-colors duration-150 placeholder:text-[#a1a1aa] focus:border-[#171717]"
          style={{ fontFamily: "var(--font-geist-sans)", minHeight: "120px" }}
        />

        <div className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-[#AAF4B5] px-2.5 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#2B713F]" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#2B713F]">
            AI Analysis Active
          </span>
        </div>

        <div className="mt-2 flex min-h-5.5 items-center justify-between">
          <div>
            {detecting && (
              <span
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#dfe3e5] px-2 py-1 text-[10px] text-[#6f6b63]"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6f6b63] pulse-dot" />
                DETECTING...
              </span>
            )}
            {!detecting && violation ? (
              <span
                className="rounded-[4px] border border-red-300 bg-red-50 px-2 py-1 text-[10px] text-red-600"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                ▸ POLICY VIOLATION
              </span>
            ) : !detecting && detected ? (
              <span
                className="rounded-[4px] border border-[#dfe3e5] px-2 py-1 text-[10px] text-[#525252]"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                ▸ DETECTED: {detected}
              </span>
            ) : null}
            {!detecting &&
              !detected &&
              !violation &&
              value.length > 0 &&
              value.trim().length < MIN && (
                <span
                  className="text-[10px] text-[#a3a3a3]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {MIN - value.trim().length} more chars needed
                </span>
              )}
          </div>
          {value.length > MAX - 100 && (
            <span
              className="text-[10px] text-[#a3a3a3]"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {MAX - value.length} left
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
