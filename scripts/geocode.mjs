// Builds content/centres.json from OneMap's public geocoder.
// Run: npm run geocode
import { writeFile } from "node:fs/promises";

// region: C central · E east · W west · N north · NE north-east
const LIST = [
  ["Maxwell Food Centre", "C"],
  ["Chinatown Complex", "C"],
  ["Hong Lim Market and Food Centre", "C"],
  ["People's Park Food Centre", "C"],
  ["Amoy Street Food Centre", "C"],
  ["Lau Pa Sat", "C"],
  ["Telok Ayer Market", "C"],
  ["Tanjong Pagar Plaza Market and Food Centre", "C"],
  ["Tekka Centre", "C"],
  ["Berseh Food Centre", "C"],
  ["Albert Centre Market and Food Centre", "C"],
  ["North Bridge Road Market and Food Centre", "C"],
  ["Golden Mile Food Centre", "C"],
  ["Newton Food Centre", "C"],
  ["Adam Road Food Centre", "C"],
  ["Whampoa Makan Place", "C"],
  ["Toa Payoh Lorong 8 Market and Food Centre", "C"],
  ["Tiong Bahru Market", "C"],
  ["Zion Riverside Food Centre", "C"],
  ["Havelock Road Cooked Food Centre", "C"],
  ["Beo Crescent Market", "C"],
  ["Bukit Merah View Market and Food Centre", "C"],
  ["Redhill Food Centre", "C"],
  ["ABC Brickworks Food Centre", "C"],
  ["Alexandra Village Food Centre", "C"],
  ["Commonwealth Crescent Market", "C"],
  ["Ghim Moh Market and Food Centre", "C"],
  ["Holland Village Market and Food Centre", "C"],
  ["Bukit Timah Market", "C"],
  ["Old Airport Road Food Centre", "E"],
  ["Dunman Food Centre", "E"],
  ["Geylang Serai Market", "E"],
  ["Haig Road Market and Food Centre", "E"],
  ["Circuit Road Food Centre", "E"],
  ["Marine Parade Central Market and Food Centre", "E"],
  ["Bedok Interchange Hawker Centre", "E"],
  ["Fengshan Market and Food Centre", "E"],
  ["Tampines Round Market and Food Centre", "E"],
  ["Our Tampines Hub Hawker Centre", "E"],
  ["Pasir Ris Central Hawker Centre", "E"],
  ["Changi Village Hawker Centre", "E"],
  ["Clementi 448 Market and Food Centre", "W"],
  ["Taman Jurong Market and Food Centre", "W"],
  ["Yuhua Village Market and Food Centre", "W"],
  ["Boon Lay Place Food Village", "W"],
  ["Bukit Batok West Avenue 8 Market", "W"],
  ["Jurong West 505 Market and Food Centre", "W"],
  ["Chong Pang Market and Food Centre", "N"],
  ["Yishun Park Hawker Centre", "N"],
  ["Kampung Admiralty Hawker Centre", "N"],
  ["Sembawang Hills Food Centre", "N"],
  ["Woodlands Street 12 Market", "N"],
  ["Ang Mo Kio 724 Market and Food Centre", "NE"],
  ["Mayflower Market and Food Centre", "NE"],
  ["Serangoon Garden Market and Food Centre", "NE"],
  ["Kovan Market and Food Centre", "NE"],
  ["Hougang 105 Hainanese Village Centre", "NE"],
  ["Punggol Hawker Centre", "NE"],
];

// OneMap's geocoder rate-limits hard. Alternate search terms for names its
// index doesn't carry verbatim.
const ALIASES = {
  "Toa Payoh Lorong 8 Market and Food Centre": ["210 Toa Payoh Lorong 8"],
  "Bukit Merah View Market and Food Centre": ["115 Bukit Merah View"],
  "Ghim Moh Market and Food Centre": ["20 Ghim Moh Road"],
  "Holland Village Market and Food Centre": ["1 Lorong Mambong"],
  "Bukit Timah Market": ["51 Upper Bukit Timah Road"],
  "Fengshan Market and Food Centre": ["85 Bedok North Street 4"],
  "Clementi 448 Market and Food Centre": ["448 Clementi Avenue 3"],
  "Taman Jurong Market and Food Centre": ["3 Yung Sheng Road"],
  "Jurong West 505 Market and Food Centre": ["505 Jurong West Street 52"],
  "Ang Mo Kio 724 Market and Food Centre": ["724 Ang Mo Kio Avenue 6"],
  "Chong Pang Market and Food Centre": ["105 Yishun Ring Road"],
  "Serangoon Garden Market and Food Centre": ["Serangoon Garden Market"],
  "Punggol Hawker Centre": ["Punggol Digital District", "Oasis Terraces"],
  "Woodlands Street 12 Market": ["Block 20 Marsiling Lane"],
  "Bukit Batok West Avenue 8 Market": ["Block 439 Bukit Batok West Avenue 8"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(term) {
  const url =
    "https://www.onemap.gov.sg/api/common/elastic/search?returnGeom=Y&getAddrDetails=Y&pageNum=1&searchVal=" +
    encodeURIComponent(term);
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.results?.[0] ?? null;
  }
  throw new Error("rate limited after 5 attempts");
}

async function lookup(name) {
  for (const term of [name, ...(ALIASES[name] ?? [])]) {
    const hit = await search(term);
    if (hit) return hit;
    await sleep(800);
  }
  return null;
}

const out = [];
const missing = [];
for (const [name, region] of LIST) {
  try {
    const hit = await lookup(name);
    if (!hit) {
      missing.push(name);
      continue;
    }
    out.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      officialName: hit.SEARCHVAL,
      address: hit.ADDRESS,
      postal: hit.POSTAL === "NIL" ? null : hit.POSTAL,
      region,
      lat: Number(hit.LATITUDE),
      lng: Number(hit.LONGITUDE),
    });
    console.log(`ok   ${name} → ${hit.LATITUDE},${hit.LONGITUDE}`);
  } catch (e) {
    missing.push(`${name} (${e.message})`);
  }
  await sleep(900); // be polite to OneMap
}

await writeFile(
  new URL("../content/centres.json", import.meta.url),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(`\n${out.length} centres written. Missing: ${missing.length}`);
missing.forEach((m) => console.log("  MISS " + m));
