"use client";

interface MemberListProps {
  members: { id: number; name: string }[];
}

export default function MemberList({ members }: MemberListProps) {
  return (
    <div className="w-24">
      {members.map((member) => (
        <div
          key={member.id}
          className="h-20 flex items-center justify-center text-sm text-gray-800"
        >
          {member.name}
        </div>
      ))}
    </div>
  );
}
