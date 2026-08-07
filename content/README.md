# Hawker Guessr question bank

`questions.json` is the source of truth for authored rounds. The app automatically includes an entry in the daily image pool when all of these are true:

- `kind` is `LOCATION`
- `image` points to a file under `public/hawkers/`
- `verified` is `true`
- `imageCredit`, `imageSourceUrl`, and `imageLicense` are present

## Adding an image question

1. Add the hawker centre to `src/server/repository/centres.ts` if it is not already there.
2. Save a web-sized, privacy-safe image in `public/hawkers/`. Blur identifiable faces before publishing.
3. Append an entry to `questions.json` using a stable id such as `q-centre-name-01`.
4. Record the original photographer, source page, and licence. Do not use an image unless its licence permits reuse.
5. Verify the location, fact, spelling, and attribution, then set `verified` to `true`.
6. Run `npm run bank:check`.

## Entry template

```json
{
  "id": "q-example-centre-01",
  "kind": "LOCATION",
  "centreId": "example-centre",
  "image": "/hawkers/example-centre-blurred.jpg",
  "imageCredit": "Photographer name",
  "imageSourceUrl": "https://source.example/photo",
  "imageLicense": "CC BY-SA 4.0",
  "prompt": "Which hawker centre is this?",
  "clues": ["Internal clue one", "Internal clue two"],
  "fact": "A verified reveal fact.",
  "difficulty": 2,
  "verified": true
}
```

Clues and answer fields stay server-side. The browser receives only the image, prompt, difficulty, and round index before a guess.
