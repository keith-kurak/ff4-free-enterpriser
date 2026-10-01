// Turns a FlagSet into readable rules, using the titles and descriptions
// from the ff4fe.com flag UI (client/lib/fe/data/flag-info-*.json).

import flagInfo460 from "./data/flag-info-4.6.0.json";
import { FlagSet } from "./flagset";
import { manualFlagsOf } from "./input";

interface FlagInfo {
  section: string;
  title: string;
  description?: string;
  group?: string;
}

const FLAG_INFO = flagInfo460.flags as Record<string, FlagInfo>;
const SECTIONS = flagInfo460.sections as string[];

// Implicit flags that have no entry in the site's UI spec.
const EXTRA_INFO: Record<string, FlagInfo> = {
  Onone: { section: "OBJECTIVES", title: "No extra objectives" },
  Pnone: { section: "PASS", title: "No Pass in this seed" },
  Gnone: { section: "GLITCHES", title: "No major glitches allowed" },
};

const SECTION_TITLES: Record<string, string> = {
  OBJECTIVES: "Objectives",
  "KEY ITEMS": "Key Items",
  PASS: "Pass",
  CHARACTERS: "Characters",
  TREASURES: "Treasures",
  SHOPS: "Shops",
  BOSSES: "Bosses",
  ENCOUNTERS: "Encounters",
  GLITCHES: "Glitches",
  OTHER: "Other",
  SPOILERS: "Spoilers",
};

export interface RuleItem {
  /** The flags this rule comes from, e.g. ["Cno:fusoya", "Cno:edge"]. */
  flags: string[];
  title: string;
  description?: string;
}

export interface RuleSection {
  key: string;
  title: string;
  items: RuleItem[];
}

export function flagInfo(flag: string): FlagInfo | undefined {
  return FLAG_INFO[flag] ?? EXTRA_INFO[flag];
}

function sectionOf(flag: string): string {
  return flagInfo(flag)?.section ?? "OTHER";
}

function item(flag: string): RuleItem {
  const info = flagInfo(flag);
  return {
    flags: [flag],
    title: info?.title ?? flag,
    description: info?.description,
  };
}

const CHARACTER_NAMES: Record<string, string> = {
  cecil: "Cecil",
  kain: "Kain",
  rydia: "Rydia",
  tellah: "Tellah",
  edward: "Edward",
  rosa: "Rosa",
  yang: "Yang",
  palom: "Palom",
  porom: "Porom",
  cid: "Cid",
  edge: "Edge",
  fusoya: "FuSoYa",
};

function characterList(flags: string[], prefix: string): string {
  return flags
    .map(
      (f) => CHARACTER_NAMES[f.slice(prefix.length)] ?? f.slice(prefix.length),
    )
    .join(", ");
}

export interface ObjectiveSummary {
  none: boolean;
  /** Fixed objectives from Omode:* and O1..O8, as display text. */
  fixed: { flag: string; text: string }[];
  randomCount: number;
  /** Titles of the Orandom:<type> flags, for example "Tough quests allowed". */
  randomTypes: string[];
  total: number;
  /** Number required; equal to total when Oreq:all or no Oreq is set. */
  required: number;
  win: "game" | "crystal" | null;
}

export function summarizeObjectives(flagset: FlagSet): ObjectiveSummary {
  const fixed = flagset
    .getList(/^O(mode|\d+):/)
    .map((flag) => ({ flag, text: flagInfo(flag)?.title ?? flag }));
  const randomCount = parseInt(flagset.getSuffix("Orandom:") ?? "", 10);
  const count = Number.isNaN(randomCount) ? 0 : randomCount;
  const randomTypes = flagset
    .getList(/^Orandom:[^\d]/)
    .map((f) => flagInfo(f)?.title ?? f);
  const total = fixed.length + count;
  const req = flagset.getSuffix("Oreq:");
  const required =
    req && req !== "all" ? Math.min(parseInt(req, 10), total) : total;
  const win = flagset.has("Owin:crystal")
    ? "crystal"
    : flagset.has("Owin:game")
      ? "game"
      : null;
  return {
    none: flagset.has("Onone"),
    fixed,
    randomCount: count,
    randomTypes,
    total,
    required,
    win,
  };
}

function objectiveItems(flagset: FlagSet): RuleItem[] {
  const summary = summarizeObjectives(flagset);
  if (summary.none) return [item("Onone")];

  const items: RuleItem[] = summary.fixed.map(({ flag, text }) => ({
    flags: [flag],
    title: text,
    description: flagInfo(flag)?.description,
  }));
  if (summary.randomCount > 0) {
    const randomFlags = flagset.getList(/^Orandom:/);
    items.push({
      flags: randomFlags,
      title: `${summary.randomCount} random objective${summary.randomCount === 1 ? "" : "s"}`,
      description:
        (summary.randomTypes.length > 0
          ? `Pool: ${summary.randomTypes.join("; ")}. `
          : "") +
        "The seed picks these. Check the in-game Track menu to see them.",
    });
  }
  items.push({
    flags: flagset.getList(/^Oreq:/),
    title:
      summary.required === summary.total
        ? `Complete all ${summary.total} objectives`
        : `Complete ${summary.required} of ${summary.total} objectives`,
  });
  if (summary.win) items.push(item(`Owin:${summary.win}`));
  return items;
}

function characterItems(flags: string[]): RuleItem[] {
  const items: RuleItem[] = [];
  const pick = (regex: RegExp) => flags.filter((f) => regex.test(f));
  const only = pick(/^Conly:/);
  const excluded = pick(/^Cno:/);
  const startAny = flags.includes("Cstart:any");
  const startIn = pick(/^Cstart:(?!not_|any)/);
  const startOut = pick(/^Cstart:not_/);
  const grouped = new Set([
    ...only,
    ...excluded,
    ...startIn,
    ...startOut,
    "Cstart:any",
  ]);

  for (const flag of flags) {
    if (!grouped.has(flag)) items.push(item(flag));
  }
  if (only.length)
    items.push({
      flags: only,
      title: `Only these characters: ${characterList(only, "Conly:")}`,
    });
  if (excluded.length) {
    items.push({
      flags: excluded,
      title: `Excluded characters: ${characterList(excluded, "Cno:")}`,
    });
  }
  if (startAny) {
    items.push(item("Cstart:any"));
  } else if (startIn.length) {
    items.push({
      flags: startIn,
      title: `May start with: ${characterList(startIn, "Cstart:")}`,
    });
  }
  if (startOut.length) {
    items.push({
      flags: startOut,
      title: `Cannot start with: ${characterList(startOut, "Cstart:not_")}`,
    });
  }
  return items;
}

export interface DescribeOptions {
  /** Describe only these flags (for manual runs, where other sections are unknown). */
  onlyFlags?: string[];
}

export function describeRules(
  flagset: FlagSet,
  options: DescribeOptions = {},
): RuleSection[] {
  const only = options.onlyFlags ? new Set(options.onlyFlags) : null;
  const flags = flagset.getList().filter((f) => !only || only.has(f));
  const bySection = new Map<string, string[]>();
  for (const flag of flags) {
    const key = sectionOf(flag);
    bySection.set(key, [...(bySection.get(key) ?? []), flag]);
  }

  const sections: RuleSection[] = [];
  for (const key of SECTIONS) {
    const sectionFlags = bySection.get(key);
    if (!sectionFlags?.length) continue;
    let items: RuleItem[];
    if (key === "OBJECTIVES" && !only) items = objectiveItems(flagset);
    else if (key === "CHARACTERS") items = characterItems(sectionFlags);
    else items = sectionFlags.map(item);
    sections.push({ key, title: SECTION_TITLES[key] ?? key, items });
  }
  return sections;
}

export interface TrackingFact {
  label: string;
  value: string;
  /** true/false for yes/no facts; null when the value is not a yes/no. */
  enabled: boolean | null;
}

export interface TrackingGroup {
  title: string;
  facts: TrackingFact[];
}

const yesNo = (label: string, enabled: boolean): TrackingFact => ({
  label,
  value: enabled ? "Yes" : "No",
  enabled,
});

/** The facts that matter while tracking a run: where key items and characters can be. */
export function trackingSummary(
  flagset: FlagSet,
  options: { manual?: boolean } = {},
): TrackingGroup[] {
  // A manual run records only a few flags, so skip facts that depend on the others.
  const manual = options.manual ?? false;
  const groups: TrackingGroup[] = [];

  const keyFacts: TrackingFact[] = [];
  if (flagset.has("Kvanilla")) {
    keyFacts.push({
      label: "Key items",
      value: "Not randomized",
      enabled: null,
    });
  } else {
    keyFacts.push(yesNo("Main quest rewards", flagset.has("Kmain")));
    keyFacts.push(yesNo("Summon quest rewards", flagset.has("Ksummon")));
    keyFacts.push(yesNo("Moon boss rewards", flagset.has("Kmoon")));
    keyFacts.push(yesNo("Monster-in-a-box chests", flagset.has("Kmiab")));
  }
  keyFacts.push({
    label: "Free key item",
    value: flagset.has("Knofree")
      ? "Rydia's mom in Mist (after Mist Dragon)"
      : "Edward in Toroia",
    enabled: null,
  });
  const passPlaces = [
    flagset.has("Pkey") && "key item locations",
    flagset.has("Pshop") && "a shop",
    flagset.has("Pchests") && "treasure chests",
  ].filter(Boolean);
  if (manual) {
    keyFacts.push(yesNo("Pass in key item locations", flagset.has("Pkey")));
  } else {
    keyFacts.push({
      label: "Pass",
      value: passPlaces.length
        ? `In ${passPlaces.join(", ")}`
        : "Not in this seed",
      enabled: null,
    });
  }
  groups.push({ title: "Key item locations", facts: keyFacts });

  const charFacts: TrackingFact[] = [];
  if (!manual && flagset.has("Cvanilla")) {
    charFacts.push({
      label: "Characters",
      value: "Not randomized",
      enabled: null,
    });
  }
  charFacts.push(yesNo("Free characters", !flagset.has("Cnofree")));
  charFacts.push(yesNo("Earned characters", !flagset.has("Cnoearned")));
  const distinct = flagset.getSuffix("Cdistinct:");
  if (distinct)
    charFacts.push({
      label: "Distinct characters",
      value: distinct,
      enabled: null,
    });
  const excluded = flagset.getList(/^Cno:/);
  if (excluded.length) {
    charFacts.push({
      label: "Excluded",
      value: characterList(excluded, "Cno:"),
      enabled: null,
    });
  }
  groups.push({ title: "Characters", facts: charFacts });

  const objectives = summarizeObjectives(flagset);
  if (!manual && !objectives.none) {
    const facts: TrackingFact[] = [
      {
        label: "Objectives required",
        value: `${objectives.required} of ${objectives.total}`,
        enabled: null,
      },
    ];
    if (objectives.randomCount) {
      facts.push({
        label: "Random objectives",
        value: String(objectives.randomCount),
        enabled: null,
      });
    }
    if (objectives.win) {
      facts.push({
        label: "Reward",
        value:
          objectives.win === "crystal"
            ? "The Crystal, then fight Zeromus"
            : "Win the game",
        enabled: null,
      });
    }
    groups.push({ title: "Objectives", facts });
  }

  return groups;
}

export interface RunRules {
  tracking: TrackingGroup[];
  /** Full rules. For manual runs, only the flags that were entered. */
  sections: RuleSection[];
}

/** Rules for a saved run. Returns null if its stored flags cannot be read. */
export function rulesForRun(run: {
  inputMethod: string;
  flags: string;
}): RunRules | null {
  let flagset: FlagSet;
  try {
    flagset = FlagSet.from(run.flags);
  } catch {
    return null;
  }
  const manual = run.inputMethod === "manual";
  return {
    tracking: trackingSummary(flagset, { manual }),
    sections: describeRules(
      flagset,
      manual ? { onlyFlags: manualFlagsOf(flagset) } : {},
    ),
  };
}
