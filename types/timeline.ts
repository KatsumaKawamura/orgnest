// /types/timeline.ts
import { Member, Schedule } from "./schedule";

export interface TimelineViewProps {
  members?: Member[];
  schedules?: Schedule[];
}

export interface TimelineHeaderProps {
  members: Member[];
  memberColumnWidth: number;
}

export interface TimelineBarProps {
  schedule: Schedule;
  members: Member[];
  startHour: number;
  pxPerMinute: number;
  memberColumnWidth: number;
}
