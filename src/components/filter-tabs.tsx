"use client";

export type FilterState = {
  type: string;
  schedule: string;
  faculty: string;
};

export type FilterAction = {
  type: "type" | "schedule" | "faculty";
  value: string;
};

type Props = {
  state: FilterState;
  onChange: (action: FilterAction) => void;
};

const TYPE_TABS = [
  { label: "すべて", value: "" },
  { label: "国立", value: "国立" },
  { label: "公立", value: "公立" },
  { label: "私立", value: "私立" },
];

const SCHEDULE_TABS = [
  { label: "すべて", value: "" },
  { label: "前期", value: "前" },
  { label: "後期", value: "後" },
  { label: "中期", value: "中" },
  { label: "共通", value: "共" },
];

const FACULTY_TABS = [
  { label: "すべて", value: "" },
  { label: "文系", value: "文系" },
  { label: "理系", value: "理系" },
  { label: "医療系", value: "医療系" },
  { label: "芸術系", value: "芸術系" },
  { label: "体育系", value: "体育系" },
];

function TabRow({
  tabs,
  current,
  onSelect,
}: {
  tabs: { label: string; value: string }[];
  current: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onSelect(t.value)}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            current === t.value
              ? "bg-[#4a6fa5] text-white"
              : "bg-white border border-gray-300 text-gray-500 hover:text-[#4a6fa5] hover:border-[#4a6fa5]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function FilterTabs({ state, onChange }: Props) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-8 shrink-0">区分</span>
        <TabRow
          tabs={TYPE_TABS}
          current={state.type}
          onSelect={(v) => onChange({ type: "type", value: v })}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-8 shrink-0">学部</span>
        <TabRow
          tabs={FACULTY_TABS}
          current={state.faculty}
          onSelect={(v) => onChange({ type: "faculty", value: v })}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-8 shrink-0">日程</span>
        <TabRow
          tabs={SCHEDULE_TABS}
          current={state.schedule}
          onSelect={(v) => onChange({ type: "schedule", value: v })}
        />
      </div>
    </div>
  );
}
