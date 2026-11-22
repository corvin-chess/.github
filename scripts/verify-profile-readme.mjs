#!/usr/bin/env node
/**
 * CV-010: assert org profile README matches README_STYLE template,
 * only claims planned work via template wording, and links only known repos.
 */
import { readFileSync, existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")
const workspaceRoot = resolve(repoRoot, "..")
const profilePath = join(repoRoot, "profile", "README.md")
const stylePath = join(workspaceRoot, "README_STYLE.md")
const goldenPath = join(__dirname, "fixtures", "org-profile.golden.md")
const reposPath = join(workspaceRoot, "REPOS.md")

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

const ok = (msg) => console.log(`OK: ${msg}`)

const normalizeLf = (text) => {
  const lf = text.replace(/\r\n/g, "\n")
  return lf.endsWith("\n") ? lf : lf + "\n"
}

const showDiff = (expectedNorm, actualNorm, label) => {
  fail(`profile/README.md does not match ${label} (LF-normalized)`)
  const lim = Math.min(actualNorm.length, expectedNorm.length)
  for (let i = 0; i < lim; i++) {
    if (actualNorm[i] !== expectedNorm[i]) {
      console.error(
        `  first diff at index ${i}: expected ${JSON.stringify(expectedNorm.slice(i, i + 40))} got ${JSON.stringify(actualNorm.slice(i, i + 40))}`
      )
      break
    }
  }
  if (actualNorm.length !== expectedNorm.length) {
    console.error(`  length expected=${expectedNorm.length} actual=${actualNorm.length}`)
  }
}

if (!existsSync(profilePath)) {
  fail(`missing ${profilePath}`)
  process.exit(1)
}

const profile = readFileSync(profilePath, "utf8")
const actualNorm = normalizeLf(profile)

let expectedSource = null
let expectedNorm = null

if (existsSync(stylePath)) {
  const style = readFileSync(stylePath, "utf8")
  const templateMatch = style.match(
    /## Organization profile template\r?\n\r?\nExact content for `\.github\/profile\/README\.md`:\r?\n\r?\n````markdown\r?\n([\s\S]*?)\r?\n````\r?\n\r?\n## Repository README template/
  )
  if (!templateMatch) {
    fail("could not extract organization profile template from README_STYLE.md")
  } else {
    expectedSource = "README_STYLE.md organization profile template"
    expectedNorm = normalizeLf(templateMatch[1])
  }
}

if (!expectedNorm) {
  if (!existsSync(goldenPath)) {
    fail(`missing golden fixture ${goldenPath}`)
    process.exit(1)
  }
  expectedSource = "scripts/fixtures/org-profile.golden.md"
  expectedNorm = normalizeLf(readFileSync(goldenPath, "utf8"))
}

if (actualNorm !== expectedNorm) {
  showDiff(expectedNorm, actualNorm, expectedSource)
} else {
  ok(`matches ${expectedSource}`)
}

if (existsSync(goldenPath)) {
  const goldenNorm = normalizeLf(readFileSync(goldenPath, "utf8"))
  if (actualNorm !== goldenNorm) {
    fail("profile/README.md drifted from scripts/fixtures/org-profile.golden.md")
  } else {
    ok("matches committed golden fixture")
  }
}

const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
if (emojiRe.test(profile)) {
  fail("emoji found in profile README")
} else {
  ok("no emoji")
}

// Capsule/typing SVG URLs use hex without '#'; README_STYLE template matches DESIGN.md.
const palette = ["0b0d12", "161b2b", "2f3d63", "8fa3d9", "c9a227", "e6e9f2", "F8FAFC"]
for (const hex of palette) {
  if (!profile.toLowerCase().includes(hex.toLowerCase())) {
    fail(`palette hex missing: ${hex}`)
  }
}
if (!process.exitCode) ok("DESIGN.md palette hexes present")

const requiredIcons = ["ts", "rust", "docker", "astro", "github"]
for (const icon of requiredIcons) {
  if (!profile.includes(`i=${icon}`)) {
    fail(`skill icon missing: i=${icon}`)
  }
}
if (!profile.includes("theme=dark")) {
  fail("skill icons must use theme=dark")
}
if (!process.exitCode) ok("skill icons and dark theme")

const claimedBuilt = /\b(Shipped|Production|Live at|users online|ELO|nps\s*=)/i
if (claimedBuilt.test(profile)) {
  fail("unverified performance or production claims found")
} else {
  ok("no unverified strength/production claims")
}

const linkRe = /https:\/\/github\.com\/corvin-chess\/([A-Za-z0-9._-]+)/g
const linked = new Set()
let m
while ((m = linkRe.exec(profile)) !== null) {
  linked.add(m[1])
}

const knownRepos = new Set([
  "web",
  "server",
  "chess-core",
  "engine",
  "engine-train",
  "worker",
  "fairplay",
  "puzzles",
  "explorer",
  "broadcast",
  "design-system",
  "assets",
  "mobile",
  "sdk",
  "bots",
  "translations",
  "infra",
  "website",
  ".github",
])

// Org root link https://github.com/corvin-chess has no trailing repo segment; ignore.
for (const name of linked) {
  if (!knownRepos.has(name)) {
    fail(`link to unknown repo: ${name}`)
  }
}
for (const name of knownRepos) {
  if (!linked.has(name)) {
    fail(`missing table/link for repo listed in REPOS.md: ${name}`)
  }
}
if (!process.exitCode) ok("all linked repos are in the REPOS.md set")

if (existsSync(reposPath)) {
  const reposDoc = readFileSync(reposPath, "utf8")
  for (const name of knownRepos) {
    if (name === ".github") {
      if (!reposDoc.includes("### .github") && !reposDoc.includes("`.github`")) {
        fail("REPOS.md missing .github entry")
      }
    } else if (!reposDoc.includes(`### ${name}`)) {
      fail(`REPOS.md missing ### ${name}`)
    }
  }
  if (!process.exitCode) ok("REPOS.md covers linked repositories")
}

if (!process.exitCode) {
  console.log("All CV-010 profile README checks passed.")
}
