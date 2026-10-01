import { FE_VERSION, FlagParseError, FlagSet, fixFlags } from "./flagset";

export type FlagInputMethod = "flagset" | "code" | "manual";

export interface ManualFlagOption {
  flag: string;
  title: string;
  description: string;
}

// The flags that a manual run tracks. Everything else about the seed is unknown.
export const MANUAL_FLAG_GROUPS: {
  title: string;
  options: ManualFlagOption[];
}[] = [
  {
    title: "Key item locations",
    options: [
      {
        flag: "Ksummon",
        title: "Summon quest rewards",
        description: "Sylphs, Feymarch king and queen, Odin, Cave Bahamut",
      },
      {
        flag: "Kmoon",
        title: "Moon boss rewards",
        description: "Lunar Subterrane bosses",
      },
      {
        flag: "Kmiab",
        title: "Monster-in-a-box chests",
        description: "MIAB chests can hold key items",
      },
      {
        flag: "Knofree",
        title: "No free key item in Toroia",
        description: "Rydia's mom in Mist gives it after the Mist Dragon",
      },
      {
        flag: "Pkey",
        title: "Pass in key item locations",
        description: "The Pass can be a key item reward",
      },
    ],
  },
  {
    title: "Characters",
    options: [
      {
        flag: "Cnofree",
        title: "No free characters",
        description:
          "No one joins in the Watery Pass, Damcyan, Mysidia, or Mt. Ordeals",
      },
      {
        flag: "Cnoearned",
        title: "No earned characters",
        description:
          "No one joins in Kaipo, Mt. Hobs, Baron, Zot, Dwarf Castle, Cave Eblan, the Lunar Palace, or the Giant",
      },
    ],
  },
];

export const MANUAL_FLAGS = MANUAL_FLAG_GROUPS.flatMap((g) =>
  g.options.map((o) => o.flag),
);

export type FlagReadResult =
  | {
      ok: true;
      flagset: FlagSet;
      /** Canonical text form, after the site's corrections. */
      flagString: string;
      /** The ff4fe.com binary code ("b...") for the same flags; null for manual runs. */
      binary: string | null;
      /** Changes that the site's rules made to the input. */
      corrections: string[];
      /** Problems the site would report for this flagset. */
      warnings: string[];
    }
  | { ok: false; error: string };

function finish(flagset: FlagSet): FlagReadResult {
  const log = fixFlags(flagset);
  return {
    ok: true,
    flagset,
    flagString: flagset.toString(),
    binary: flagset.toBinary(),
    corrections: log
      .filter(([kind]) => kind === "correction")
      .map(([, msg]) => msg),
    warnings: log.filter(([kind]) => kind === "error").map(([, msg]) => msg),
  };
}

export function readFlagInput(
  method: "flagset" | "code",
  input: string,
): FlagReadResult {
  const text = input.trim();
  if (!text) {
    return {
      ok: false,
      error: method === "code" ? "Paste the flag code" : "Paste the flagset",
    };
  }
  const looksBinary = /^b[A-Za-z0-9_-]+=*$/.test(text);
  if (method === "code" && !looksBinary) {
    return {
      ok: false,
      error: 'A flag code starts with "b", for example bBAYA…',
    };
  }
  if (method === "flagset" && looksBinary) {
    return {
      ok: false,
      error: "This looks like a flag code. Choose Code to read it.",
    };
  }

  let flagset: FlagSet;
  try {
    flagset = FlagSet.from(text);
  } catch (err) {
    if (err instanceof FlagParseError) return { ok: false, error: err.message };
    throw err;
  }
  const unknown = flagset.unknownFlags();
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Unknown flag${unknown.length > 1 ? "s" : ""} for FE v${FE_VERSION}: ${unknown.join(", ")}`,
    };
  }
  return finish(flagset);
}

export function readManualFlags(selected: string[]): FlagReadResult {
  const flagset = new FlagSet();
  flagset.set("Kmain");
  for (const flag of selected) {
    if (MANUAL_FLAGS.includes(flag)) flagset.set(flag);
  }
  const result = finish(flagset);
  if (!result.ok) return result;
  // The full text and code would claim the other sections are vanilla, which a
  // manual run does not know. Keep only the flags that were entered.
  const entered = manualFlagsOf(flagset);
  const bySection = new Map<string, string[]>();
  for (const flag of entered) {
    bySection.set(flag[0], [...(bySection.get(flag[0]) ?? []), flag.slice(1)]);
  }
  const flagString = [...bySection]
    .map(([letter, subs]) => letter + subs.join("/"))
    .join(" ");
  return { ...result, flagString, binary: null };
}

/** The Kmain flag plus the manual options that are set, in spec order. */
export function manualFlagsOf(flagset: FlagSet): string[] {
  return flagset
    .getList()
    .filter((f) => f === "Kmain" || MANUAL_FLAGS.includes(f));
}
