// pages/sandbox/index.tsx
"use client";

import { useState } from "react";
import { MotionConfig, LayoutGroup, motion } from "framer-motion";

function FramerSanityTest() {
  const [left, setLeft] = useState(true);
  return (
    <MotionConfig reducedMotion="never">
      <LayoutGroup>
        <div className="p-4 border rounded mb-8">
          <div className="mb-3 space-x-2">
            <button className="border px-3 py-1" onClick={() => setLeft(true)}>
              Left
            </button>
            <button className="border px-3 py-1" onClick={() => setLeft(false)}>
              Right
            </button>
          </div>
          <div className="relative mt-4 h-8 w-full max-w-sm">
            <div className="absolute inset-0 flex justify-between text-xs text-gray-600">
              <div className="w-24 text-center">LEFT</div>
              <div className="w-24 text-center">RIGHT</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200" />
            <div className="absolute inset-0 flex justify-between">
              <div className="relative w-24">
                {left && (
                  <motion.span
                    layoutId="fm-underline"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600 rounded"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                      mass: 0.2,
                    }}
                  />
                )}
              </div>
              <div className="relative w-24">
                {!left && (
                  <motion.span
                    layoutId="fm-underline"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600 rounded"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                      mass: 0.2,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function TabsDemoFramer() {
  type TabKey = "team" | "myschedule" | "project";
  const [active, setActive] = useState<TabKey>("myschedule");
  const labels: Record<TabKey, string> = {
    team: "Team",
    myschedule: "My Schedule",
    project: "Project List",
  };
  const keys: TabKey[] = ["team", "myschedule", "project"];

  return (
    <MotionConfig reducedMotion="never">
      <LayoutGroup>
        <div className="mb-4 border-b border-gray-300">
          <div className="relative flex space-x-4">
            {keys.map((key) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={[
                    "relative px-4 py-2 text-sm font-semibold",
                    isActive
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {labels[key]}
                  {isActive && (
                    <motion.span
                      layoutId="tabs-underline"
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 rounded"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 0.25,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-3 text-sm text-gray-700">
          Active: <b>{labels[active]}</b>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

import { useEffect, useLayoutEffect, useRef } from "react";

function TabsDemoTransform() {
  type TabKey = "team" | "myschedule" | "project";
  const [active, setActive] = useState<TabKey>("myschedule");
  const keys: TabKey[] = ["team", "myschedule", "project"];
  const labels: Record<TabKey, string> = {
    team: "Team",
    myschedule: "My Schedule",
    project: "Project List",
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    team: null,
    myschedule: null,
    project: null,
  });

  const [pos, setPos] = useState({ left: 0, width: 0, ready: false });

  const measure = () => {
    const parent = containerRef.current;
    const el = btnRefs.current[active];
    if (!parent || !el) return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPos({ left: r.left - pr.left, width: r.width, ready: true });
  };

  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [active]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    Object.values(btnRefs.current).forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const transform = `translateX(${pos.left}px) scaleX(${Math.max(
    pos.width,
    1
  )})`;

  return (
    <div className="mb-4 border-b border-gray-300">
      <div ref={containerRef} className="relative flex space-x-4">
        {keys.map((key) => (
          <button
            key={key}
            ref={(el) => {
              btnRefs.current[key] = el;
            }}
            onClick={() => setActive(key)}
            className={[
              "relative px-4 py-2 text-sm font-semibold",
              active === key
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {labels[key]}
          </button>
        ))}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded origin-left"
          style={{
            width: 1,
            transform,
            transition: pos.ready
              ? "transform 300ms cubic-bezier(0.22,1,0.36,1)"
              : "none",
          }}
        />
      </div>
      <div className="p-3 text-sm text-gray-700">
        Active: <b>{labels[active]}</b>
      </div>
    </div>
  );
}

// pages/sandbox/index.tsx（続き）
export default function SandboxPage() {
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-xl font-bold">Sandbox</h1>

      <section>
        <h2 className="font-semibold mb-2">Framer sanity</h2>
        <FramerSanityTest />
      </section>

      <section>
        <h2 className="font-semibold mb-2">Tabs (Framer)</h2>
        <TabsDemoFramer />
      </section>

      <section>
        <h2 className="font-semibold mb-2">Tabs (transform only)</h2>
        <TabsDemoTransform />
      </section>
    </div>
  );
}
