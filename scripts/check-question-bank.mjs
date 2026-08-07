import { readFile } from "node:fs/promises";

const file = new URL("../content/questions.json", import.meta.url);
const questions = JSON.parse(await readFile(file, "utf8"));
const ids = new Set();
const problems = [];

for (const question of questions) {
  if (!question.id) problems.push("Entry is missing an id");
  if (ids.has(question.id)) problems.push(`${question.id}: duplicate id`);
  ids.add(question.id);

  if (!question.centreId) problems.push(`${question.id}: missing centreId`);
  if (!question.prompt) problems.push(`${question.id}: missing prompt`);
  if (!question.fact) problems.push(`${question.id}: missing fact`);

  if (question.image) {
    for (const field of ["imageCredit", "imageSourceUrl", "imageLicense"]) {
      if (!question[field]) problems.push(`${question.id}: image is missing ${field}`);
    }
  }
}

if (problems.length) {
  console.error(`Question bank has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
} else {
  const playable = questions.filter(
    (question) => question.kind === "LOCATION" && question.image && question.verified,
  );
  console.log(`${questions.length} authored questions; ${playable.length} playable image rounds.`);
}
