"use client";
import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";

export default function TimelineView() {
  const members = [
    { id: 1, name: "田中" },
    { id: 2, name: "佐藤" },
    { id: 3, name: "鈴木" },
  ];

  const schedules = [
    {
      id: 1,
      memberId: 1,
      start: "09:00",
      end: "10:00",
      flag: "事務所",
      project: "案件A",
      notes: "資料作成",
    },
    {
      id: 2,
      memberId: 1,
      start: "09:30",
      end: "11:00",
      flag: "現場",
      project: "案件B",
      notes: "現場立会い",
    },
    {
      id: 3,
      memberId: 1,
      start: "10:30",
      end: "12:00",
      flag: "打ち合わせ",
      project: "案件C",
      notes: "顧客MTG",
    },
    {
      id: 4,
      memberId: 2,
      start: "13:00",
      end: "14:00",
      flag: "現場",
      project: "案件D",
      notes: "進捗確認",
    },
    {
      id: 5,
      memberId: 3,
      start: "08:00",
      end: "09:30",
      flag: "事務所",
      project: "案件E",
      notes: "レポート作成",
    },
    {
      id: 6,
      memberId: 3,
      start: "09:00",
      end: "10:00",
      flag: "打ち合わせ",
      project: "案件F",
      notes: "チームMTG",
    },
  ];

  const startHour = 6;
  const endHour = 20;
  const pxPerMinute = 2;
  const memberColumnWidth = 120;

  // 重なり判定して slotIndex/slotCount を割り当て
  function assignSlots(schedules: any[]) {
    const grouped: Record<number, any[]> = {};

    schedules.forEach((s) => {
      if (!grouped[s.memberId]) grouped[s.memberId] = [];
      grouped[s.memberId].push(s);
    });

    Object.keys(grouped).forEach((memberId) => {
      const arr = grouped[Number(memberId)];
      arr.sort((a, b) => a.start.localeCompare(b.start));

      const active: any[] = [];
      arr.forEach((s) => {
        for (let i = active.length - 1; i >= 0; i--) {
          if (active[i].end <= s.start) active.splice(i, 1);
        }
        const usedSlots = active.map((a) => a.slotIndex);
        let slotIndex = 0;
        while (usedSlots.includes(slotIndex)) slotIndex++;
        s.slotIndex = slotIndex;
        active.push(s);
      });

      const maxSlot = Math.max(...arr.map((s) => s.slotIndex), 0) + 1;
      arr.forEach((s) => (s.slotCount = maxSlot));
    });

    return Object.values(grouped).flat();
  }

  const slottedSchedules = assignSlots(schedules);

  return (
    <div className="relative">
      {/* 上部：メンバー名ヘッダー（縦線なし） */}
      <div className="flex" style={{ marginLeft: "48px" }}>
        {members.map((m) => (
          <div
            key={m.id}
            className="text-center font-semibold text-gray-800"
            style={{ width: `${memberColumnWidth}px` }}
          >
            {m.name}
          </div>
        ))}
      </div>

      {/* 下部：時間グリッド & バー */}
      <div className="flex">
        {/* 左側：時間ラベルの余白 */}
        <div style={{ width: "48px" }} />
        {/* グリッド & バー */}
        <div className="relative">
          <TimelineGrid
            startHour={startHour}
            endHour={endHour}
            pxPerMinute={pxPerMinute}
            memberCount={members.length}
            memberColumnWidth={memberColumnWidth}
          />
          {slottedSchedules.map((s) => (
            <TimelineBar
              key={s.id}
              schedule={s}
              members={members}
              startHour={startHour}
              pxPerMinute={pxPerMinute}
              memberColumnWidth={memberColumnWidth}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
