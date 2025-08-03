"use client";
import TimelineView from "./timeline/TimelineView";

export default function TeamContent() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Team Timeline
      </h2>
      <TimelineView />
    </div>
  );
}
