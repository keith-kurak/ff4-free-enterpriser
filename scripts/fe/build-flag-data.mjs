#!/usr/bin/env node
// Regenerates the Free Enterprise flag data in client/lib/fe/data from the
// files that https://ff4fe.com/make runs. The live site is the source of truth:
// its spec is not bit-compatible with the FreeEnterprise4 repo (it adds Tmintier).
//
// Usage:
//   node scripts/fe/build-flag-data.mjs              # download from ff4fe.com
//   node scripts/fe/build-flag-data.mjs <dir>        # use <dir>/flags.js and <dir>/uispec.js
//
// Free Enterprise is MIT licensed, Copyright (c) 2018-2023 Henry Truong.
// https://github.com/HungryTenor/FreeEnterprise4

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://ff4fe.com/script";
const OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../client/lib/fe/data",
);

async function readSource(dir, name) {
  if (dir) return fs.readFile(path.join(dir, name), "utf8");
  const res = await fetch(`${SITE}/${name}`);
  if (!res.ok) throw new Error(`GET ${SITE}/${name} failed: ${res.status}`);
  return res.text();
}

// Extracts the object literal that starts after `marker`, by matching brackets.
function extractLiteral(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Cannot find ${marker}`);
  let i = source.indexOf(marker.trim().endsWith("[") ? "[" : "{", start);
  const open = source[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  for (let j = i; j < source.length; j++) {
    const c = source[j];
    if (inString) {
      if (c === "\\") j++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return source.slice(i, j + 1);
  }
  throw new Error(`Unterminated literal after ${marker}`);
}

function plainText(html) {
  return html
    .replace(/<li>/g, "\n• ")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

async function main() {
  const dir = process.argv[2];
  const flagsJs = await readSource(dir, "flags.js");
  const uispecJs = await readSource(dir, "uispec.js");

  const spec = JSON.parse(extractLiteral(flagsJs, "const _FE_FLAGSPEC = {"));
  const uispec = JSON.parse(extractLiteral(uispecJs, "var FLAG_UISPEC = ["));

  const flags = {};
  const sections = [];
  const walk = (controls, section, trail) => {
    for (const control of controls ?? []) {
      const isGroup = control.flag.startsWith("@");
      if (!isGroup && !flags[control.flag]) {
        const info = { section, title: plainText(control.title) };
        if (control.description)
          info.description = plainText(control.description);
        if (trail.length) info.group = trail.join(" › ");
        flags[control.flag] = info;
      }
      const nextTrail =
        isGroup || control.subcontrols?.length
          ? [...trail, plainText(control.title)]
          : trail;
      walk(control.subcontrols, section, nextTrail);
    }
  };
  for (const section of uispec) {
    sections.push(section.title);
    walk(section.controls, section.title, []);
  }

  const version = spec.version.join(".");
  const flagspec = {
    source: `${SITE}/flags.js`,
    version: spec.version,
    order: spec.order,
    mutex: spec.mutex,
    implicit: spec.implicit,
    binary: spec.binary.map((b) => [b.flag, b.offset, b.size, b.value]),
  };
  const flagInfo = { source: `${SITE}/uispec.js`, version, sections, flags };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUT_DIR, `flagspec-${version}.json`),
    JSON.stringify(flagspec) + "\n",
  );
  await fs.writeFile(
    path.join(OUT_DIR, `flag-info-${version}.json`),
    JSON.stringify(flagInfo) + "\n",
  );
  const missing = spec.order.filter((f) => !flags[f]);
  console.log(
    `FE ${version}: ${spec.order.length} flags, ${spec.binary.length} binary fields, ` +
      `${Object.keys(flags).length} UI entries. No UI entry: ${missing.join(", ") || "none"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
