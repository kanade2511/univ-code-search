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
  const tagBtn =
    "inline-flex items-center px-3 py-[7px] text-[13px] font-medium border border-border rounded-[10px] bg-popover text-foreground cursor-pointer transition-colors duration-150 hover:border-accent hover:bg-accent/5 active:scale-[0.97] select-none max-[480px]:px-2.5 max-[480px]:py-[6px] max-[480px]:text-xs";

  return (
    <div className="mb-10 space-y-6">
      <section aria-labelledby="national-heading">
        <h2
          id="national-heading"
          className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.04em] uppercase text-muted-foreground mb-2.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
          国公立
        </h2>
        <div className="flex flex-wrap gap-1.5 max-[480px]:gap-[7px]">
          {NATIONAL.map((u) => (
            <button key={u.label} onClick={() => onSelect(u.query)} className={tagBtn}>
              {u.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="private-heading">
        <h2
          id="private-heading"
          className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.04em] uppercase text-muted-foreground mb-2.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
          私立
        </h2>
        <div className="flex flex-wrap gap-1.5 max-[480px]:gap-[7px]">
          {PRIVATE.map((u) => (
            <button key={u.label} onClick={() => onSelect(u.query)} className={tagBtn}>
              {u.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
