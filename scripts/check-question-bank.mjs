import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "content/questions.json"), "utf8"));
const centres = JSON.parse(await readFile(join(root, "content/centres.json"), "utf8"));
const centreIds = new Set(centres.map((centre) => centre.id));
const allowedLicenses = new Set(["CC BY-SA 4.0", "CC BY 4.0", "CC BY 2.5"]);
const ids = new Set();
const referencedImages = new Set();
const problems = [];

function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    if (!length) break;
    offset += 2 + length;
  }
  return null;
}

for (const question of questions) {
  const label = question.id || "<missing id>";
  if (typeof question.id !== "string" || !question.id) problems.push("Entry is missing an id");
  if (ids.has(question.id)) problems.push(`${label}: duplicate id`);
  ids.add(question.id);
  if (!["LOCATION", "PRICE"].includes(question.kind)) problems.push(`${label}: invalid kind`);
  if (!centreIds.has(question.centreId)) problems.push(`${label}: unknown centreId`);
  if (typeof question.prompt !== "string" || !question.prompt) problems.push(`${label}: missing prompt`);
  if (typeof question.fact !== "string" || !question.fact) problems.push(`${label}: missing fact`);
  if (!Array.isArray(question.clues) || question.clues.some((clue) => typeof clue !== "string" || !clue)) {
    problems.push(`${label}: clues must be non-empty strings`);
  }
  if (![1, 2, 3].includes(question.difficulty)) problems.push(`${label}: difficulty must be 1, 2, or 3`);
  if (typeof question.verified !== "boolean") problems.push(`${label}: verified must be boolean`);
  if (question.redactions !== undefined) {
    if (!Array.isArray(question.redactions) || question.redactions.length === 0) {
      problems.push(`${label}: redactions must be a non-empty array`);
    } else {
      for (const redaction of question.redactions) {
        const values = [redaction.x, redaction.y, redaction.width, redaction.height];
        if (values.some((value) => !Number.isFinite(value)) ||
            redaction.x < 0 || redaction.y < 0 || redaction.width <= 0 || redaction.height <= 0 ||
            redaction.x + redaction.width > 100 || redaction.y + redaction.height > 100) {
          problems.push(`${label}: redaction rectangles must stay within normalized image bounds`);
        }
      }
    }
  }

  if (question.kind === "LOCATION" && question.verified && !question.image) {
    problems.push(`${label}: verified location is missing an image`);
  }
  if (question.kind === "PRICE" && (!Number.isFinite(question.answerPriceCents) || question.answerPriceCents <= 0)) {
    problems.push(`${label}: verified price is missing a positive answerPriceCents`);
  }

  if (question.image) {
    for (const field of ["imageCredit", "imageSourceUrl", "imageLicense"]) {
      if (typeof question[field] !== "string" || !question[field]) {
        problems.push(`${label}: image is missing ${field}`);
      }
    }
    if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(question.imageSourceUrl ?? "")) {
      problems.push(`${label}: imageSourceUrl must be a Wikimedia Commons file page`);
    }
    if (!allowedLicenses.has(question.imageLicense)) problems.push(`${label}: unsupported image licence`);
    if (!/^\/hawkers\/photo-\d{2}(?:-blurred)?\.jpg$/.test(question.image)) {
      problems.push(`${label}: image path must use an answer-neutral photo filename`);
    }

    const relative = question.image.replace(/^\//, "");
    referencedImages.add(relative);
    const imagePath = join(root, "public", relative);
    try {
      const info = await stat(imagePath);
      const bytes = await readFile(imagePath);
      const dimensions = jpegDimensions(bytes);
      if (!info.isFile()) problems.push(`${label}: image path is not a file`);
      if (info.size < 50_000) problems.push(`${label}: image is unexpectedly small`);
      if (!dimensions || dimensions.width < 800 || dimensions.height < 500) {
        problems.push(`${label}: image must be a valid JPEG at least 800×500`);
      }
    } catch {
      problems.push(`${label}: image file does not exist`);
    }
  }
}

const publicImages = (await readdir(join(root, "public/hawkers")))
  .filter((name) => name.endsWith(".jpg"))
  .map((name) => `hawkers/${name}`);
for (const image of publicImages) {
  if (!referencedImages.has(image)) problems.push(`${image}: public image is not referenced by the question bank`);
}

if (problems.length) {
  console.error(`Question bank has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
} else {
  const playable = questions.filter(
    (question) => question.kind === "LOCATION" && question.image && question.verified,
  );
  console.log(`${questions.length} authored questions; ${playable.length} playable image rounds; ${referencedImages.size} reviewed images.`);
}
