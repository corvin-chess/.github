import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = resolve(__dirname, "../..")
const style = readFileSync(join(workspaceRoot, "README_STYLE.md"), "utf8")
const startMarker = "````markdown\n"
const startMarkerCr = "````markdown\r\n"
const endMarker = "\n````\n\n## Repository README template"
const endMarkerCr = "\r\n````\r\n\r\n## Repository README template"

let start = style.indexOf(startMarkerCr)
let end = -1
let body = ""
if (start >= 0) {
  end = style.indexOf(endMarkerCr, start)
  if (end < 0) {
    console.error("end marker CRLF not found")
    process.exit(1)
  }
  body = style.slice(start + startMarkerCr.length, end).replace(/\r\n/g, "\n")
} else {
  start = style.indexOf(startMarker)
  if (start < 0) {
    console.error("start marker not found")
    process.exit(1)
  }
  end = style.indexOf(endMarker, start)
  if (end < 0) {
    console.error("end marker not found")
    process.exit(1)
  }
  body = style.slice(start + startMarker.length, end)
}

const out = join(__dirname, "../profile/README.md")
writeFileSync(out, body.endsWith("\n") ? body : body + "\n")
console.log(`wrote ${out}`)
