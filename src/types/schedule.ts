// @/types/schedule.ts

// 既存の型
export interface Member {
  id: string; // ← UUID 文字列に統一
  name: string;
}

// DBから取得する生データ（Supabaseレスポンス）
export interface ScheduleDB {
  id: string;
  user_id: string;
  start: string; // "HH:MM:SS"（開発時の名残：今回のTeamタイムラインでは未使用）
  end: string; // "HH:MM:SS"（同上）
  flag: string;
  project_name: string;
  notes: string | null;
}

// フロントで使う型（UI用に整形済み）
// B案：minベースに刷新（"HH:MM" は持たない）
export interface Schedule {
  id: string;
  userId: string; // UUID
  startMin: number; // 分単位
  endMin: number; // 分単位
  flag: string;
  project: string;
  notes: string | null;
  slotIndex: number;
  slotCount: number;
}

// MyPageカード用（既存そのまま）
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

// 新規作成用入力型（既存そのまま）
export interface ScheduleCreateInput {
  user_id: string;
  project_name: string;
  start: string; // "HH:MM:SS"
  end: string; // "HH:MM:SS"
  flag: string;
  notes: string;
}

// --- MyPage系コンポーネント共通Props（既存そのまま） ---
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
