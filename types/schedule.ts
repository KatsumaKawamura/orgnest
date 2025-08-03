// /types/schedule.ts
export interface Member {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  memberId: number;
  start: string;
  end: string;
  flag: string;
  project: string;
  notes: string;
  slotIndex: number;
  slotCount: number;
}
