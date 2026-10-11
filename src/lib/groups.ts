/**
 * University groups dictionary and mapping utilities.
 * Supports popular Japanese university entrance exam groupings (MARCH, 日東駒専, 関関同立, 旧帝大, etc.)
 * including English alphabetic, katakana, hiragana, and common abbreviations.
 */

export const UNIVERSITY_GROUPS: Record<string, string[]> = {
  // 国公立大学群
  旧帝大: [
    "東京大学",
    "京都大学",
    "大阪大学",
    "名古屋大学",
    "東北大学",
    "九州大学",
    "北海道大学",
  ],
  東京一工: ["東京大学", "京都大学", "一橋大学", "東京科学大学"],
  金岡千広: ["金沢大学", "岡山大学", "千葉大学", "広島大学"],
  "5S": ["埼玉大学", "信州大学", "静岡大学", "滋賀大学", "新潟大学"],
  STARS: ["佐賀大学", "鳥取大学", "秋田大学", "琉球大学", "島根大学"],
  電農名繊: [
    "電気通信大学",
    "東京農工大学",
    "名古屋工業大学",
    "京都工芸繊維大学",
  ],
  旧三商大: ["一橋大学", "神戸大学", "大阪公立大学"],

  // 首都圏・東日本私立大学群
  早慶: ["早稲田大学", "慶應義塾大学"],
  早慶上理: [
    "早稲田大学",
    "慶應義塾大学",
    "上智大学",
    "東京理科大学",
  ],
  MARCH: ["明治大学", "青山学院大学", "立教大学", "中央大学", "法政大学"],
  GMARCH: [
    "学習院大学",
    "明治大学",
    "青山学院大学",
    "立教大学",
    "中央大学",
    "法政大学",
  ],
  成成明学獨國武: [
    "成蹊大学",
    "成城大学",
    "明治学院大学",
    "獨協大学",
    "國學院大学",
    "武蔵大学",
  ],
  日東駒専: ["日本大学", "東洋大学", "駒澤大学", "専修大学"],
  大東亜帝国: [
    "大東文化大学",
    "東海大学",
    "亜細亜大学",
    "帝京大学",
    "国士舘大学",
  ],
  東京四工大: [
    "芝浦工業大学",
    "東京都市大学",
    "東京電機大学",
    "工学院大学",
  ],
  女子大御三家: ["津田塾大学", "東京女子大学", "日本女子大学"],
  関東上流江戸桜: [
    "関東学園大学",
    "上武大学",
    "流通経済大学",
    "江戸川大学",
    "桜美林大学",
  ],

  // 関西・西日本私立大学群
  関関同立: ["関西大学", "関西学院大学", "同志社大学", "立命館大学"],
  産近甲龍: ["京都産業大学", "近畿大学", "甲南大学", "龍谷大学"],
  摂神追桃: ["摂南大学", "神戸学院大学", "追手門学院大学", "桃山学院大学"],
  外外経工佛: [
    "京都外国語大学",
    "関西外国語大学",
    "大阪経済大学",
    "大阪工業大学",
    "佛教大学",
  ],

  // 中部私立大学群
  愛愛名中: ["愛知大学", "愛知学院大学", "名古屋学院大学", "中京大学"],
  名名中日: ["名古屋学院大学", "名古屋学芸大学", "中部大学", "日本福祉大学"],
};

/**
 * Reading, spelling, and casing aliases mapped to canonical group names in UNIVERSITY_GROUPS.
 */
export const GROUP_ALIASES: Record<string, string> = {
  // MARCH
  march: "MARCH",
  MARCH: "MARCH",
  ｍａｒｃｈ: "MARCH",
  マーチ: "MARCH",
  まーち: "MARCH",

  // GMARCH
  gmarch: "GMARCH",
  GMARCH: "GMARCH",
  ジーマーチ: "GMARCH",
  じーまーち: "GMARCH",

  // 早慶
  早慶: "早慶",
  早慶大: "早慶",
  そうけい: "早慶",

  // 早慶上理・早慶上智
  早慶上理: "早慶上理",
  早慶上智: "早慶上理",
  そうけいじょうり: "早慶上理",
  そうけいじょうち: "早慶上理",

  // 日東駒専
  日東駒専: "日東駒専",
  にっとうこません: "日東駒専",
  ニットウコマセン: "日東駒専",

  // 成成明学獨國武
  成成明学獨國武: "成成明学獨國武",
  成成明学独国武: "成成明学獨國武",
  成成明学: "成成明学獨國武",
  せいせいめいがく: "成成明学獨國武",

  // 大東亜帝国
  大東亜帝国: "大東亜帝国",
  だいとうあていこく: "大東亜帝国",

  // 四工大
  四工大: "東京四工大",
  東京四工大: "東京四工大",
  よんこうだい: "東京四工大",

  // 女子大御三家
  女子大御三家: "女子大御三家",
  御三家女子大: "女子大御三家",
  じょしだいごさんけ: "女子大御三家",

  // 関関同立
  関関同立: "関関同立",
  かんかんどうりつ: "関関同立",
  カンカンドウリツ: "関関同立",

  // 産近甲龍
  産近甲龍: "産近甲龍",
  さんきんこうりゅう: "産近甲龍",
  サンキンコウリュウ: "産近甲龍",

  // 摂神追桃
  摂神追桃: "摂神追桃",
  せっしんついとう: "摂神追桃",

  // 旧帝大
  旧帝大: "旧帝大",
  旧帝: "旧帝大",
  旧七帝大: "旧帝大",
  七帝大: "旧帝大",
  きゅうていだい: "旧帝大",
  きゅうてい: "旧帝大",

  // 東京一工
  東京一工: "東京一工",
  とうきょういっこう: "東京一工",

  // 旧三商大
  旧三商大: "旧三商大",
  きゅうさんしょうだい: "旧三商大",

  // 金岡千広
  金岡千広: "金岡千広",
  かねおかちひろ: "金岡千広",

  // 5S
  "5s": "5S",
  "5S": "5S",
  "５Ｓ": "5S",
  "５ｓ": "5S",
  ファイブエス: "5S",
  ふぁいぶえす: "5S",

  // STARS
  stars: "STARS",
  STARS: "STARS",
  スターズ: "STARS",
  すたーず: "STARS",

  // 電農名繊
  電農名繊: "電農名繊",
  でんのうめいせん: "電農名繊",

  // 愛愛名中
  愛愛名中: "愛愛名中",
  あいあいめいちゅう: "愛愛名中",

  // 名名中日
  名名中日: "名名中日",
  めいめいちゅうにち: "名名中日",

  // 外外経工佛
  外外経工佛: "外外経工佛",
  外外経工仏: "外外経工佛",
  がいがいけいこうぶつ: "外外経工佛",
};

/**
 * Returns canonical group key from an input token (if recognized as a group).
 */
export function getCanonicalGroup(input: string): string | undefined {
  const trimmed = input.trim();
  if (UNIVERSITY_GROUPS[trimmed]) return trimmed;
  const alias = GROUP_ALIASES[trimmed] || GROUP_ALIASES[trimmed.toLowerCase()];
  return alias;
}

/**
 * Checks whether the input string represents a known university group.
 */
export function isUniversityGroup(input: string): boolean {
  return getCanonicalGroup(input) !== undefined;
}

/**
 * Returns the array of universities in the given group (if input matches a group).
 */
export function getUniversitiesInGroup(input: string): string[] | undefined {
  const canonical = getCanonicalGroup(input);
  if (!canonical) return undefined;
  return UNIVERSITY_GROUPS[canonical];
}

/**
 * Reverse lookup: returns all canonical group names that a university belongs to.
 */
export function getGroupsForUniversity(universityName: string): string[] {
  const trimmed = universityName.trim();
  const groups: string[] = [];

  for (const [groupName, univList] of Object.entries(UNIVERSITY_GROUPS)) {
    if (
      univList.includes(trimmed) ||
      univList.some((u) => trimmed.startsWith(u) || u.startsWith(trimmed))
    ) {
      groups.push(groupName);
    }
  }

  return groups;
}

/**
 * Primary groups recommended for quick access chips in the search UI.
 */
export const POPULAR_UNIVERSITY_GROUPS = [
  { name: "MARCH", query: "MARCH" },
  { name: "早慶", query: "早慶" },
  { name: "関関同立", query: "関関同立" },
  { name: "日東駒専", query: "日東駒専" },
  { name: "旧帝大", query: "旧帝大" },
  { name: "産近甲龍", query: "産近甲龍" },
  { name: "早慶上理", query: "早慶上理" },
  { name: "GMARCH", query: "GMARCH" },
  { name: "東京一工", query: "東京一工" },
  { name: "金岡千広", query: "金岡千広" },
  { name: "5S", query: "5S" },
  { name: "大東亜帝国", query: "大東亜帝国" },
  { name: "四工大", query: "四工大" },
];
