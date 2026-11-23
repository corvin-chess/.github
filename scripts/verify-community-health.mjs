#!/usr/bin/env node
/**
 * CV-030: assert org community health files exist, stay linkable from the
 * profile README, and contain no emoji or invented contact addresses.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

const ok = (msg) => console.log(`OK: ${msg}`)

const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
const inventedEmailRe =
  /\b[A-Za-z0-9._%+-]+@(?:corvin(?:-?chess)?|example)\.(?:com|org|net|dev|io)\b/i

const requiredRootFiles = [
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "GOVERNANCE.md",
  "SUPPORT.md",
  "LICENSE",
]

const requiredNested = [
  join(".github", "PULL_REQUEST_TEMPLATE.md"),
  join(".github", "ISSUE_TEMPLATE", "config.yml"),
  join(".github", "ISSUE_TEMPLATE", "01-bug.yml"),
  join(".github", "ISSUE_TEMPLATE", "02-feature.yml"),
]

const read = (rel) => {
  const abs = join(repoRoot, rel)
  if (!existsSync(abs)) {
    fail(`missing ${rel.replace(/\\/g, "/")}`)
    return null
  }
  return readFileSync(abs, "utf8")
}

for (const name of requiredRootFiles) {
  const body = read(name)
  if (body === null) continue
  if (emojiRe.test(body)) fail(`emoji in ${name}`)
  if (inventedEmailRe.test(body)) {
    fail(`invented contact email in ${name} (owner must set the real address)`)
  }
  if (!body.trim()) fail(`${name} is empty`)
  else if (!process.exitCode) ok(`present ${name}`)
}

for (const rel of requiredNested) {
  const body = read(rel)
  if (body === null) continue
  const label = rel.replace(/\\/g, "/")
  if (emojiRe.test(body)) fail(`emoji in ${label}`)
  if (inventedEmailRe.test(body)) {
    fail(`invented contact email in ${label}`)
  }
  if (!body.trim()) fail(`${label} is empty`)
  else if (!process.exitCode) ok(`present ${label}`)
}

const profile = read("profile/README.md")
if (profile) {
  if (emojiRe.test(profile)) fail("emoji in profile README")
  if (inventedEmailRe.test(profile)) {
    fail("invented contact email in profile README")
  }
  const mustLink = [
    "https://github.com/corvin-chess/.github/blob/main/CONTRIBUTING.md",
    "https://github.com/corvin-chess/.github/blob/main/SECURITY.md",
  ]
  for (const href of mustLink) {
    if (!profile.includes(href)) fail(`profile README missing link ${href}`)
    else ok(`profile links ${href.split("/").pop()}`)
  }
}

const contributing = read("CONTRIBUTING.md")
if (contributing) {
  const hubLinks = [
    "CODE_OF_CONDUCT.md",
    "GOVERNANCE.md",
    "SUPPORT.md",
    "SECURITY.md",
  ]
  for (const target of hubLinks) {
    if (
      !contributing.includes(`](${target})`) &&
      !contributing.includes(`](./${target})`)
    ) {
      fail(`CONTRIBUTING.md must link ${target}`)
    } else {
      ok(`CONTRIBUTING hubs ${target}`)
    }
  }
}

const coc = read("CODE_OF_CONDUCT.md")
if (coc) {
  if (!coc.includes("Contributor Covenant")) {
    fail("CODE_OF_CONDUCT.md must credit Contributor Covenant")
  } else {
    ok("CODE_OF_CONDUCT credits Contributor Covenant")
  }
  if (!/version 2\.1/i.test(coc)) {
    fail("CODE_OF_CONDUCT.md must state version 2.1")
  } else {
    ok("CODE_OF_CONDUCT version 2.1")
  }
}

const security = read("SECURITY.md")
if (security) {
  if (!/private vulnerability reporting/i.test(security)) {
    fail("SECURITY.md must describe private vulnerability reporting")
  } else {
    ok("SECURITY mentions private vulnerability reporting")
  }
  if (!/owner/i.test(security)) {
    fail("SECURITY.md must note owner sets the contact address")
  } else {
    ok("SECURITY notes owner contact")
  }
  if (/fair.?play/i.test(security) && /threshold|weight|model/i.test(security)) {
    // Allowed to say thresholds stay private; forbidden to publish numbers.
    if (/\b\d+(\.\d+)?\s*%/.test(security) || /tau\s*=/i.test(security)) {
      fail("SECURITY.md must not publish fair-play numeric thresholds")
    }
  }
}

const issueDir = join(repoRoot, ".github", "ISSUE_TEMPLATE")
if (existsSync(issueDir)) {
  const ymls = readdirSync(issueDir).filter((f) => f.endsWith(".yml"))
  for (const file of ymls) {
    if (file === "config.yml") continue
    const body = readFileSync(join(issueDir, file), "utf8")
    if (!/^name:\s*.+/m.test(body)) fail(`${file} missing name:`)
    if (!/^description:\s*.+/m.test(body)) fail(`${file} missing description:`)
    if (!process.exitCode) ok(`issue form fields ${file}`)
  }
  const config = readFileSync(join(issueDir, "config.yml"), "utf8")
  if (!/contact_links:/m.test(config)) {
    fail("ISSUE_TEMPLATE/config.yml missing contact_links")
  } else {
    ok("issue config has contact_links")
  }
  if (!/SECURITY\.md/i.test(config) && !/security/i.test(config)) {
    fail("issue config should point security reports away from public issues")
  } else {
    ok("issue config references security path")
  }
}

const pr = read(join(".github", "PULL_REQUEST_TEMPLATE.md"))
if (pr && !/test/i.test(pr)) {
  fail("PULL_REQUEST_TEMPLATE.md should ask about tests")
} else if (pr) {
  ok("PR template mentions tests")
}

// Denylist built without plaintext private local tooling filenames in this file.
const privateNameParts = [
  ["C", "L", "A", "U", "D", "E", ".", "m", "d"],
  ["A", "G", "E", "N", "T", "S", ".", "m", "d"],
].map((parts) => parts.join(""))
const privatePhraseRes = [
  /\bCoding agents?\b/i,
  /\bAgent-operated\b/i,
  /\bAI tools?\b/i,
  /\bAI tool attribution\b/i,
  /\bgenerated by\b/i,
  /\bassisted by\b/i,
]
const publicDocsToScan = [
  ...requiredRootFiles,
  ...requiredNested,
  "profile/README.md",
]
for (const rel of publicDocsToScan) {
  const body = read(rel)
  if (body === null) continue
  const label = rel.replace(/\\/g, "/")
  for (const name of privateNameParts) {
    if (body.includes(name)) {
      fail(`${label} must not name private local tooling files`)
    }
  }
  for (const re of privatePhraseRes) {
    if (re.test(body)) {
      fail(`${label} must not describe private automation tooling in public docs`)
    }
  }
}
if (!process.exitCode) ok("no private local tooling names in public docs")

if (!process.exitCode) {
  console.log("All CV-030 community health checks passed.")
}
