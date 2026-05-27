"use client";

import type { QuickSearchItem } from "@/lib/types";

const NATIONAL: QuickSearchItem[] = [
  { label: "東京大", query: "東京大学" }, { label: "京都大", query: "京都大学" },
  { label: "東科大", query: "東京科学大学" }, { label: "一橋大", query: "一橋大学" },
  { label: "北海道大", query: "北海道大学" }, { label: "東北大", query: "東北大学" },
  { label: "名古屋大", query: "名古屋大学" }, { label: "大阪大", query: "大阪大学" },
  { label: "九州大", query: "九州大学" }, { label: "筑波大", query: "筑波大学" },
  { label: "千葉大", query: "千葉大学" }, { label: "横浜国立大", query: "横浜国立大学" },
  { label: "東京外国語大", query: "東京外国語大学" }, { label: "東京都立大", query: "東京都立大学" },
  { label: "横浜市立大", query: "横浜市立大学" },
];

const PRIVATE: QuickSearchItem[] = [
  { label: "早稲田大", query: "早稲田大学" }, { label: "慶應義塾大", query: "慶應義塾大学" },
  { label: "上智大", query: "上智大学" }, { label: "東京理科大", query: "東京理科大学" },
  { label: "明治大", query: "明治大学" }, { label: "青山学院大", query: "青山学院大学" },
  { label: "立教大", query: "立教大学" }, { label: "中央大", query: "中央大学" },
  { label: "法政大", query: "法政大学" }, { label: "学習院大", query: "学習院大学" },
  { label: "日本大", query: "日本大学" }, { label: "東洋大", query: "東洋大学" },
  { label: "駒澤大", query: "駒澤大学" }, { label: "専修大", query: "専修大学" },
  { label: "成城大", query: "成城大学" }, { label: "成蹊大", query: "成蹊大学" },
  { label: "明治学院大", query: "明治学院大学" }, { label: "獨協大", query: "獨協大学" },
  { label: "國學院大", query: "國學院大学" }, { label: "武蔵大", query: "武蔵大学" },
];

type Props = {
  onSelect: (query: string) => void;
};

export function QuickSearch({ onSelect }: Props) {
  const btn =
    "px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 text-gray-500 hover:text-[#4a6fa5] hover:border-[#4a6fa5] transition-colors cursor-pointer";

  return (
    <div className="mb-6 space-y-3">
      <div>
        <div className="text-xs font-medium text-gray-400 mb-1.5">国公立</div>
        <div className="flex flex-wrap gap-1.5">
          {NATIONAL.map((u) => (
            <button key={u.label} onClick={() => onSelect(u.query)} className={btn}>
              {u.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-400 mb-1.5">私立</div>
        <div className="flex flex-wrap gap-1.5">
          {PRIVATE.map((u) => (
            <button key={u.label} onClick={() => onSelect(u.query)} className={btn}>
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
