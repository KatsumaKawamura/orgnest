// types/schedule.ts

// 既存の型
export interface Member {
  id: number;
  name: string;
}

export interface ScheduleDB {
  id: number;
  member_id: number;
  start: string;
  end: string;
  flag: string;
  project_name: string;
  notes: string;
  members: Member;
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

// MyPageカード用
export interface MyPageCard {
  id: number;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  project: string;
  notes: string;
  flag: string;
}

// --- MyPage系コンポーネント共通Props ---
export interface MyPageContentProps {
  projectList: string[];
}

export interface ScheduleCardProps extends MyPageCard {
  isEditing: boolean;
  projectList: string[];
  onChange: (updated: Partial<MyPageCard>) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export interface MyPageActionBarProps {
  deleteMode: boolean;
  onAdd: () => void;
  onToggleDeleteMode: () => void;
  onShowConfirm: () => void;
  showConfirm: boolean;
  onCancelConfirm: () => void;
  onConfirmDelete: () => void;
}

export interface MyPageProjectSelectProps {
  value: string;
  options: string[];
  flag: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onFlagChange: (flag: string) => void;
}

export interface MyPageTimeSelectProps {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  isEditing: boolean;
  onChange: (updated: Partial<MyPageCard>) => void;
}

export interface MyPageNotesProps {
  notes: string;
  isEditing: boolean;
  onChange: (updated: { notes: string }) => void;
}
