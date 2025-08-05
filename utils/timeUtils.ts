// utils/timeUtils.ts

// UIのhour, minute -> DB保存用 (HH:MM:SS)
export const toTimeString = (hour: string, minute: string): string =>
  `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;

// DBのtime (HH:MM:SS) -> UIのhour, minute
export const fromTimeString = (
  time: string
): { hour: string; minute: string } => {
  const [h = "00", m = "00"] = time.split(":");
  return { hour: h, minute: m };
};

// hour + minute -> 分換算
export const toMinutes = (hour: string, minute: string): number =>
  parseInt(hour || "0") * 60 + parseInt(minute || "0");
