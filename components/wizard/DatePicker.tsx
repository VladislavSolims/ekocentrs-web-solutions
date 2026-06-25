"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { lv } from "date-fns/locale";
import { format, isValid, parse } from "date-fns";
import "react-day-picker/style.css";

const DATE_FORMAT = "dd.MM.yyyy";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

export function DatePicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const parsedValue = value ? parse(value, DATE_FORMAT, new Date()) : undefined;
  const selected = parsedValue && isValid(parsedValue) ? parsedValue : undefined;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          placeholder="DD.MM.GGGG"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          aria-label="Atvērt kalendāru"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-slate-500 hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute right-0 z-10 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            locale={lv}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, DATE_FORMAT));
                setOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
