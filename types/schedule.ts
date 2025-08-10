// types/schedule.ts

// 既存の型
export interface Member {
  id: number;
  name: string;
}

// DBから取得する生データ（Supabaseレスポンス）
export interface ScheduleDB {
  id: number;
  user_id: string; // ← member_id を user_id に変更
  start: string; // "HH:MM:SS"
  end: string; // "HH:MM:SS"
  flag: string;
  project_name: string;
  notes: string;
}

// フロントで使う型（UI用に整形済み）
export interface Schedule {
  id: number;
  userId: string; // ← camelCase で userId
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  flag: string;
  project: string; // project_name の整形済み
  notes: string;
  slotIndex: number;
  slotCount: number;
}

// MyPageカード用
export interface MyPageCard {
  id: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  project: string;
  notes: string;
  flag: string;
}

// 新規作成用入力型
export interface ScheduleCreateInput {
  user_id: string;
  project_name: string;
  start: string; // "HH:MM:SS"
  end: string; // "HH:MM:SS"
  flag: string;
  notes: string;
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
