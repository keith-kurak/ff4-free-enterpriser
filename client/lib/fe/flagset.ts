// TypeScript port of FlagSetCore and FlagLogicCore from Free Enterprise
// (FreeEnt/flagsetcore.py, and the transpiled copy that https://ff4fe.com runs).
// Free Enterprise is MIT licensed, Copyright (c) 2018-2023 Henry Truong.
// https://github.com/HungryTenor/FreeEnterprise4
//
// The spec data comes from the live site; regenerate it with
// `node scripts/fe/build-flag-data.mjs`.

import spec460 from "./data/flagspec-4.6.0.json";

type Condition = string | [string, ...Condition[]];

interface RawFlagSpec {
  version: number[];
  order: string[];
  mutex: string[][];
  implicit: Record<string, Condition>;
  binary: [flag: string, offset: number, size: number, value: number][];
}

class FlagSpec {
  readonly version: number[];
  readonly versionString: string;
  readonly order: string[];
  readonly known: Set<string>;
  readonly implicit: Map<string, Condition>;
  readonly binary: RawFlagSpec["binary"];
  private readonly mutexByFlag = new Map<string, string[]>();

  constructor(raw: RawFlagSpec) {
    this.version = raw.version;
    this.versionString = raw.version.join(".");
    this.order = raw.order;
    this.known = new Set(raw.order);
    this.implicit = new Map(Object.entries(raw.implicit));
    this.binary = raw.binary;
    for (const group of raw.mutex) {
      for (const flag of group) {
        if (!this.mutexByFlag.has(flag)) this.mutexByFlag.set(flag, group);
      }
    }
  }

  mutexGroup(flag: string): string[] | undefined {
    return this.mutexByFlag.get(flag);
  }
}

export const FLAG_SPEC = new FlagSpec(spec460 as unknown as RawFlagSpec);
export const FE_VERSION = FLAG_SPEC.versionString;

export class FlagParseError extends Error {}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlDecode(text: string): number[] {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of text.replace(/=+$/, "")) {
    const value = B64.indexOf(ch === "+" ? "-" : ch === "/" ? "_" : ch);
    if (value < 0)
      throw new FlagParseError(`Invalid character '${ch}' in flag code`);
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

function base64UrlEncode(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n =
      (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const chars = Math.ceil((Math.min(3, bytes.length - i) * 8) / 6);
    for (let c = 0; c < chars; c++) out += B64[(n >> (18 - 6 * c)) & 0x3f];
  }
  return out;
}

export class FlagSet {
  private flags = new Set<string>();
  private embeddedVersion: number[] | null = null;

  constructor(private readonly spec: FlagSpec = FLAG_SPEC) {}

  static from(flagString: string): FlagSet {
    const flagset = new FlagSet();
    flagset.load(flagString);
    return flagset;
  }

  load(flagString: string): void {
    if (flagString.length > 0 && flagString[0] === "b") {
      this.loadBinary(flagString);
    } else {
      this.loadText(flagString);
    }
  }

  private loadText(input: string): void {
    this.flags = new Set();
    this.embeddedVersion = null;
    let superflag: string | null = null;
    let rest = input.replace(/\s/g, "");

    while (rest.length > 0) {
      let m = rest.match(/^[A-Z]/);
      if (m) {
        superflag = m[0];
        rest = rest.slice(superflag.length);
        continue;
      }

      m = rest.match(/^-[a-z0-9_]+:?/);
      if (m) {
        superflag = m[0];
        rest = rest.slice(superflag.length);
        if (!superflag.endsWith(":")) this.set(superflag);
        continue;
      }

      m = rest.match(/^([a-z0-9_]+:)?([a-z0-9_]+(,[a-z0-9_]+)*)\/?/);
      if (m) {
        if (superflag === null) {
          throw new FlagParseError(
            `Found a flag without a section letter near '${m[0]}'`,
          );
        }
        const prefix = m[1] ?? "";
        for (const subflag of m[2].split(","))
          this.set(superflag + prefix + subflag);
        rest = rest.slice(m[0].length);
        continue;
      }

      throw new FlagParseError(
        `Cannot read the flags near '${rest.slice(0, 20)}'`,
      );
    }
  }

  private loadBinary(code: string): void {
    const bytes = base64UrlDecode(code.slice(1));
    if (bytes.length < 3)
      throw new FlagParseError("The flag code is too short");
    this.embeddedVersion = bytes.slice(0, 3);
    const embedded = this.embeddedVersion.join(".");
    if (embedded !== this.spec.versionString) {
      throw new FlagParseError(
        `This code is for Free Enterprise v${embedded}. This app reads v${this.spec.versionString} codes only.`,
      );
    }

    const payload = bytes.slice(3);
    this.flags = new Set();
    for (const [flag, offset, size, expected] of this.spec.binary) {
      let fieldSize = size;
      let byteIndex = offset >> 3;
      let bitIndex = offset & 0x7;
      let value = 0;
      let valueBitIndex = 0;
      while (fieldSize > 0) {
        const subfieldSize = Math.min(fieldSize, 8 - bitIndex);
        const src = payload[byteIndex] ?? 0;
        value |=
          ((src >> bitIndex) & ((1 << subfieldSize) - 1)) << valueBitIndex;
        valueBitIndex += subfieldSize;
        fieldSize -= subfieldSize;
        byteIndex += 1;
        bitIndex = 0;
      }
      if (value === expected) this.set(flag);
    }
  }

  /** Flags that were set but are not in the spec (typos, other FE versions). */
  unknownFlags(): string[] {
    return [...this.flags].filter((f) => !this.spec.known.has(f));
  }

  getList(regex?: RegExp): string[] {
    return this.spec.order.filter(
      (f) => this.has(f) && (!regex || regex.test(f)),
    );
  }

  getSuffix(prefix: string): string | null {
    const found = this.getList(
      new RegExp("^" + prefix.replace(/[-:]/g, "\\$&")),
    );
    return found.length > 0 ? found[0].slice(prefix.length) : null;
  }

  has(flag: string): boolean {
    if (!this.spec.known.has(flag)) throw new Error(`Invalid flag ${flag}`);
    const condition = this.spec.implicit.get(flag);
    if (condition !== undefined) return this.evaluate(condition);
    return this.flags.has(flag);
  }

  hasAny(...flags: string[]): boolean {
    return flags.some((f) => this.has(f));
  }

  set(flag: string): void {
    if (this.spec.implicit.has(flag)) return;
    for (const other of this.spec.mutexGroup(flag) ?? []) {
      if (other !== flag) this.flags.delete(other);
    }
    this.flags.add(flag);
  }

  unset(flag: string): void {
    this.flags.delete(flag);
  }

  private evaluate(condition: Condition): boolean {
    if (typeof condition === "string") return this.has(condition);
    const [op, ...args] = condition;
    switch (op) {
      case "not":
        return !this.evaluate(args[0]);
      case "and":
        return args.every((c) => this.evaluate(c));
      case "or":
        return args.some((c) => this.evaluate(c));
      default:
        throw new Error(`Unsupported condition type ${op}`);
    }
  }

  private parse(): [string, [string, string[]][]][] {
    const results: [string, [string, string[]][]][] = [];
    for (const flag of this.spec.order) {
      if (!this.has(flag)) continue;
      let superflag: string;
      let subflag: string | undefined;
      let subsubflag: string | undefined;
      if (flag[0] === "-") {
        const m = flag.match(/^(-[a-z0-9_]+:?)([a-z0-9_]+)?$/)!;
        superflag = m[1];
        subflag = m[2];
      } else {
        const m = flag.match(/^([A-Z])(([a-z0-9_]+:)?([a-z0-9_]+))?$/)!;
        superflag = m[1];
        subflag = m[3] ? m[3] : m[4];
        subsubflag = m[3] ? m[4] : undefined;
      }

      let superObj = results.find((r) => r[0] === superflag);
      if (!superObj) {
        superObj = [superflag, []];
        results.push(superObj);
      }
      if (subflag) {
        let subObj = superObj[1].find((s) => s[0] === subflag);
        if (!subObj) {
          subObj = [subflag, []];
          superObj[1].push(subObj);
        }
        if (subsubflag) subObj[1].push(subsubflag);
      }
    }
    return results;
  }

  toString(): string {
    const parts: string[] = [];
    for (const [superflag, subflags] of this.parse()) {
      if (parts.length > 0) parts.push(" ");
      parts.push(superflag);
      const list: [string, string[]][] =
        superflag[0] === "-" && subflags.length > 0
          ? [["", subflags.map((s) => s[0])]]
          : subflags;
      list.forEach(([sub, subsubs], i) => {
        if (i > 0) parts.push("/");
        parts.push(sub + subsubs.join(","));
      });
    }
    return parts.join("");
  }

  toBinary(): string {
    const bytes = [...this.spec.version];
    for (const [flag, offset, size, flagValue] of this.spec.binary) {
      if (!this.has(flag)) continue;
      let value = flagValue;
      let fieldSize = size;
      let byteIndex = (offset >> 3) + 3;
      let bitIndex = offset & 0x7;
      while (fieldSize > 0) {
        while (byteIndex >= bytes.length) bytes.push(0);
        const subfieldSize = Math.min(fieldSize, 8 - bitIndex);
        bytes[byteIndex] |= (value & ((1 << subfieldSize) - 1)) << bitIndex;
        value >>= subfieldSize;
        fieldSize -= subfieldSize;
        bitIndex = 0;
        byteIndex += 1;
      }
    }
    return "b" + base64UrlEncode(bytes);
  }
}

export type FixLogEntry = ["correction" | "error", string];

function disable(
  flagset: FlagSet,
  log: FixLogEntry[],
  reason: string,
  flags: string[],
) {
  for (const flag of flags) {
    if (flagset.has(flag)) {
      flagset.unset(flag);
      log.push(["correction", `${reason}; removed ${flag}`]);
    }
  }
}

function disableRegex(
  flagset: FlagSet,
  log: FixLogEntry[],
  reason: string,
  regex: RegExp,
) {
  disable(flagset, log, reason, flagset.getList(regex));
}

const ALL_CHARACTERS = [
  "cecil",
  "kain",
  "rydia",
  "edward",
  "tellah",
  "rosa",
  "yang",
  "palom",
  "porom",
  "cid",
  "edge",
  "fusoya",
];

/** Port of FlagLogicCore.fix (live 4.6.0). Changes the flagset in place. */
export function fixFlags(flagset: FlagSet): FixLogEntry[] {
  const log: FixLogEntry[] = [];

  if (flagset.hasAny("Ksummon", "Kmoon", "Kmiab") && !flagset.has("Kmain")) {
    flagset.set("Kmain");
    log.push([
      "correction",
      "Advanced key item randomizations are enabled; forced to add Kmain",
    ]);
  }
  if (flagset.has("Kvanilla"))
    disable(flagset, log, "Key items not randomized", ["Kunsafe"]);

  if (flagset.has("Cvanilla")) {
    disableRegex(
      flagset,
      log,
      "Characters not randomized",
      /^C(maybe|distinct:|only:|no:)/,
    );
  } else if (flagset.getList(/^Conly:/).length > 0) {
    disableRegex(flagset, log, "Conly:* flag(s) are specified", /^Cno:/);
  }
  if (flagset.has("Chero")) {
    disableRegex(
      flagset,
      log,
      "Hero challenge includes smith weapon",
      /^-smith:/,
    );
  }

  const startInclude = flagset.getList(/^Cstart:(?!not_)/);
  const startExclude = flagset.getList(/^Cstart:not_/);
  if (startExclude.length > 0 && startInclude.length > 0) {
    disableRegex(
      flagset,
      log,
      "Inclusive Cstart:* flags are specified",
      /^Cstart:not_/,
    );
  }
  if (startInclude.length > 1 && flagset.has("Cstart:any")) {
    disableRegex(
      flagset,
      log,
      "Cstart:any is specified",
      /^Cstart:(?!any|not_)/,
    );
  }

  if (flagset.has("Tempty"))
    disableRegex(flagset, log, "Treasures are empty", /^Tsparse:/);
  if (flagset.hasAny("Tempty", "Tvanilla", "Tshuffle")) {
    disableRegex(
      flagset,
      log,
      "Treasures are not random",
      /^(Tmaxtier:|Tmintier:)/,
    );
  }
  const minTier = flagset.getSuffix("Tmintier:");
  const maxTier = flagset.getSuffix("Tmaxtier:");
  if (minTier && maxTier && parseInt(minTier, 10) > parseInt(maxTier, 10)) {
    disableRegex(
      flagset,
      log,
      "Tmaxtier cannot be less than Tmintier; Setting Tmintier to same value as Tmaxtier",
      /^Tmintier:/,
    );
    flagset.set(`Tmintier:${maxTier}`);
  }

  if (flagset.hasAny("Svanilla", "Scabins", "Sempty")) {
    disableRegex(flagset, log, "Shops are not random", /^Sno:([^j]|j.)/);
    disable(flagset, log, "Shops are not random", ["Sunsafe"]);
  }
  if (flagset.has("Sshuffle"))
    disable(flagset, log, "Shops are only shuffled", ["Sno:life"]);
  if (flagset.has("Bvanilla"))
    disable(flagset, log, "Bosses not randomized", ["Bunsafe"]);
  if (flagset.has("Evanilla")) {
    disable(flagset, log, "Encounters are vanilla", [
      "Ekeep:behemoths",
      "Ekeep:doors",
      "Edanger",
    ]);
  }

  const spoilers = flagset.getList(/^-spoil:/);
  const sparseSpoilers = flagset.getList(/^-spoil:sparse/);
  if (spoilers.length > 0 && spoilers.length === sparseSpoilers.length) {
    disableRegex(flagset, log, "No spoilers requested", /^-spoil:sparse/);
  }

  if (flagset.has("Onone")) {
    disableRegex(flagset, log, "No objectives set", /^O(win|req):/);
    return log;
  }

  // The Python source also adds Oreq:all here and later drops Orandom:<type> when no
  // random count is set. The site's transpiled JS never runs those two rules
  // (`!array` is always false in JS), so we skip them to match ff4fe.com output.
  if (flagset.has("Omode:classicforge") && !flagset.has("Owin:crystal")) {
    flagset.set("Owin:crystal");
    log.push([
      "correction",
      "Classic Forge is enabled; forced to add Owin:crystal",
    ]);
  } else if (flagset.getList(/^Owin:/).length === 0) {
    flagset.set("Owin:game");
    log.push([
      "correction",
      "Objectives set without outcome specified; added Owin:game",
    ]);
  }

  if (flagset.getList(/^O\d+:quest_pass$/).length > 0 && flagset.has("Pnone")) {
    flagset.set("Pkey");
    log.push([
      "correction",
      "Pass objective is set without a pass flag; forced to add Pkey",
    ]);
  }

  const charObjectives = flagset.getList(/^O\d+:char_/);
  if (charObjectives.length > 0) {
    const required = charObjectives.map((f) => f.replace(/^O\d+:char_/, ""));
    if (flagset.has("Cvanilla")) {
      let unavailable = false;
      if (required.includes("cecil")) {
        unavailable = true;
      } else if (flagset.has("Cnofree")) {
        unavailable = ["edward", "tellah", "palom", "porom"].some((c) =>
          required.includes(c),
        );
      } else if (flagset.has("Cnoearned")) {
        unavailable = [
          "rydia",
          "kain",
          "rosa",
          "yang",
          "cid",
          "edge",
          "fusoya",
        ].some((c) => required.includes(c));
      }
      if (unavailable) {
        log.push([
          "error",
          "Character objectives are set for characters that cannot be found in vanilla character assignment",
        ]);
      }
    } else {
      const only = flagset
        .getList(/^Conly:/)
        .map((f) => f.replace(/^Conly:/, ""));
      const excluded = flagset
        .getList(/^Cno:/)
        .map((f) => f.replace(/^Cno:/, ""));
      const pool =
        only.length > 0
          ? only
          : ALL_CHARACTERS.filter((c) => !excluded.includes(c));
      if (required.some((c) => !pool.includes(c))) {
        log.push([
          "error",
          "Character objectives are set for characters excluded from the randomization.",
        ]);
      }
      const distinct = flagset.getSuffix("Cdistinct:");
      if (distinct && parseInt(distinct, 10) < required.length) {
        log.push([
          "error",
          "More character objectives are set than distinct characters allowed in the randomization.",
        ]);
      }
    }
    if (flagset.has("Cnofree") && flagset.has("Cnoearned")) {
      log.push([
        "error",
        "Character objectives are set while no character slots will be filled",
      ]);
    }
  }

  if (
    flagset.has("Orandom:char") &&
    flagset.has("Cnoearned") &&
    flagset.has("Cnofree")
  ) {
    flagset.unset("Orandom:char");
    log.push([
      "correction",
      "Random character objectives in the pool while no character slots will be filled. Removed Orandom:char.",
    ]);
  }
  return log;
}
