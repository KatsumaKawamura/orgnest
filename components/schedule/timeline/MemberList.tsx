"use client";

interface MemberListProps {
  members: { id: number; name: string }[];
}

export default function MemberList({ members }: MemberListProps) {
  return (
    <div className="w-24 border-r border-gray-300">
      {members.map((member) => (
        <div
          key={member.id}
          className="h-20 flex items-center justify-center border-b border-gray-200 text-sm"
        >
          {member.name}
        </div>
      ))}
    </div>
  );
}
