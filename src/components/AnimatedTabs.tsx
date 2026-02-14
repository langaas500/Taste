"use client";

import { useRef, useState, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function AnimatedTabs({ tabs, active, onChange }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-tab="${active}"]`) as HTMLElement;
    if (activeEl) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [active]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className={`btn-press relative px-3.5 py-2 text-sm font-medium rounded-[var(--radius-md)] whitespace-nowrap transition-colors duration-200 ${
              active === tab.id
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 text-xs ${active === tab.id ? "text-[var(--accent-light)]" : "text-[var(--text-tertiary)]"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div
        className="absolute bottom-0 h-0.5 bg-[var(--accent)] rounded-full transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}
