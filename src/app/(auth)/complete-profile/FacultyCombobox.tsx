"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, CornerDownLeft, X } from "lucide-react";
import { isFacultyOrCollege } from "@/lib/faculties";

interface FacultyComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  // แบ่งรายการเป็นคณะ/วิทยาลัย กับหน่วยงาน (ใช้กับบุคลากรที่เห็นทั้งหมด)
  grouped?: boolean;
}

type Row =
  | { kind: "header"; label: string }
  | { kind: "option"; value: string; index: number }
  | { kind: "custom"; value: string; index: number };

// จำกัด delay ของ animation ไม่ให้รายการท้าย ๆ รอนานเกินไป
const STAGGER_MS = 18;
const MAX_STAGGER_STEPS = 10;

function Highlight({ text, query }: { text: string; query: string }) {
  const start = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (start < 0) return <>{text}</>;
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-blue-100/70 px-0.5 text-blue-700">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

export default function FacultyCombobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  grouped = false,
}: FacultyComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // เปิดใหม่แต่ละครั้งให้รายการเล่น animation ใหม่
  const [openCount, setOpenCount] = useState(0);
  // กรองเฉพาะตอนผู้ใช้พิมพ์ ถ้าเพิ่งเลือกจากรายการให้เห็นทั้งหมด
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = isFiltering ? value.trim() : "";

  const { rows, selectable } = useMemo(() => {
    const matches = options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase()),
    );
    const sections = grouped
      ? [
          { label: "คณะ / วิทยาลัย", items: matches.filter(isFacultyOrCollege) },
          {
            label: "หน่วยงาน",
            items: matches.filter((option) => !isFacultyOrCollege(option)),
          },
        ]
      : [{ label: "", items: matches }];

    const nextRows: Row[] = [];
    const nextSelectable: string[] = [];
    for (const section of sections) {
      if (section.items.length === 0) continue;
      if (section.label) nextRows.push({ kind: "header", label: section.label });
      for (const item of section.items) {
        nextRows.push({ kind: "option", value: item, index: nextSelectable.length });
        nextSelectable.push(item);
      }
    }
    const isExactMatch = options.some((option) => option === query);
    if (query && !isExactMatch) {
      nextRows.push({ kind: "custom", value: query, index: nextSelectable.length });
      nextSelectable.push(query);
    }
    return { rows: nextRows, selectable: nextSelectable };
  }, [options, query, grouped]);

  const open = () => {
    if (isOpen) return;
    setIsOpen(true);
    setOpenCount((count) => count + 1);
    setActiveIndex(Math.max(0, options.indexOf(value)));
  };

  const close = () => {
    setIsOpen(false);
    setIsFiltering(false);
    setActiveIndex(-1);
  };

  const choose = (next: string) => {
    onChange(next);
    close();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!isOpen) return open();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) =>
          selectable.length === 0
            ? -1
            : (index + step + selectable.length) % selectable.length,
        );
        break;
      }
      case "Enter":
        if (isOpen && selectable[activeIndex] !== undefined) {
          event.preventDefault();
          choose(selectable[activeIndex]);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`group flex h-12 items-center gap-2 rounded-xl border bg-white px-3 transition-[border-color,box-shadow] duration-200 ${
          isOpen
            ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => {
          inputRef.current?.focus();
          open();
        }}
      >
        <Building2
          aria-hidden
          className={`size-5 shrink-0 transition-colors duration-200 ${
            isOpen || value ? "text-blue-600" : "text-gray-400"
          }`}
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          required
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          value={value}
          onFocus={open}
          onChange={(event) => {
            onChange(event.target.value);
            setIsFiltering(true);
            setActiveIndex(0);
            if (!isOpen) open();
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          aria-label="ล้างค่า"
          tabIndex={-1}
          className={`grid size-7 place-items-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 ${
            value ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onChange("");
            setIsFiltering(false);
            inputRef.current?.focus();
            open();
          }}
        >
          <X className="size-4" />
        </button>
        <ChevronDown
          aria-hidden
          className={`size-5 shrink-0 text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </div>

      <div
        className={`absolute inset-x-0 top-full z-20 mt-2 origin-top overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-[0.97] opacity-0"
        }`}
      >
        <ul
          key={openCount}
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="max-h-72 overflow-y-auto overscroll-contain p-1.5"
        >
          {rows.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-gray-400">
              ไม่มีรายการ
            </li>
          )}
          {rows.map((row) => {
            if (row.kind === "header") {
              return (
                <li
                  key={`header-${row.label}`}
                  role="presentation"
                  className="sticky top-0 z-10 bg-white/95 px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 backdrop-blur"
                >
                  {row.label}
                </li>
              );
            }

            const isActive = row.index === activeIndex;
            const isSelected = row.kind === "option" && row.value === value;
            return (
              <li
                key={`${row.kind}-${row.value}`}
                id={`${listboxId}-${row.index}`}
                data-index={row.index}
                role="option"
                aria-selected={isSelected}
                className={`combobox-option flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
                } ${row.kind === "custom" ? "mt-1 border-t border-dashed border-gray-200" : ""}`}
                style={{
                  animationDelay: `${Math.min(row.index, MAX_STAGGER_STEPS) * STAGGER_MS}ms`,
                }}
                onPointerDown={(event) => event.preventDefault()}
                onPointerEnter={() => setActiveIndex(row.index)}
                onClick={() => choose(row.value)}
              >
                {row.kind === "custom" ? (
                  <>
                    <CornerDownLeft className="size-4 shrink-0 text-blue-500" />
                    <span className="min-w-0 flex-1 truncate">
                      ใช้ชื่อที่พิมพ์{" "}
                      <span className="font-semibold text-gray-900">
                        “{row.value}”
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate">
                      <Highlight text={row.value} query={query} />
                    </span>
                    <Check
                      aria-hidden
                      className={`size-4 shrink-0 text-blue-600 transition-all duration-200 ${
                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
