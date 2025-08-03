"use client";
import TimelineView from "./timeline/TimelineView";

export default function TeamContent() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Team Timeline
      </h1>
      <TimelineView />
    </div>
  );
}
