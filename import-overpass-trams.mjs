#!/usr/bin/env node
/**
 * Overpass API'den Bursa T1 (İpekböceği Merkez Ring) ve T2 (Kent Meydanı – Terminal)
 * tramvay hatlarının gerçek güzergâh ve durak verilerini çekip src/mapdata.js dosyasına aktarır.
 *
 * Kullanım:
 *   node scripts/import-overpass-trams.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MAPDATA_PATH = path.join(ROOT, "src", "mapdata.js");

const MIRRORS = [
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const A0 = 40.19;
const KX = Math.cos((A0 * Math.PI) / 180);
const km = (a, b) => Math.hypot((a[0] - b[0]) * KX, a[1] - b[1]) * 111.32;
const ptKey = (p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
const round5 = (n) => Math.round(n * 1e5) / 1e5;

async function queryOverpass(ql) {
  let lastErr = null;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "BursaMetroGame-OverpassImporter/1.0",
        },
        body: "data=" + encodeURIComponent(ql),
      });
      const text = await res.text();
      if (res.ok && text.trim().startsWith("{")) {
        return JSON.parse(text);
      }
      lastErr = new Error(`${url} HTTP ${res.status}: ${text.slice(0, 120)}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Overpass API sunucularına bağlanılamadı.");
}

function pathKm(pts) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += km(pts[i - 1], pts[i]);
  return total;
}

function simplifyDP(pts, epsKm = 0.005) {
  if (pts.length <= 2) return pts;
  const distToSeg = (p, a, b) => {
    const ax = a[0] * KX, ay = a[1];
    const bx = b[0] * KX, by = b[1];
    const px = p[0] * KX, py = p[1];
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) * 111.32;
  };
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distToSeg(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > epsKm) {
    const left = simplifyDP(pts.slice(0, idx + 1), epsKm);
    const right = simplifyDP(pts.slice(idx), epsKm);
    return [...left.slice(0, -1), ...right];
  }
  return [pts[0], pts[pts.length - 1]];
}

function stitchClosedLoop(ways, startPt, secondStopPt) {
  const segs = ways.map((w) => w.geometry.map((p) => [p.lon, p.lat]));
  const ring = [...segs.shift()];
  while (segs.length) {
    const tail = ring[ring.length - 1];
    let bestI = 0, bestD = Infinity, rev = false;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const d0 = km(tail, s[0]);
      const d1 = km(tail, s[s.length - 1]);
      if (d0 < bestD) { bestD = d0; bestI = i; rev = false; }
      if (d1 < bestD) { bestD = d1; bestI = i; rev = true; }
    }
    const chosen = segs.splice(bestI, 1)[0];
    if (rev) chosen.reverse();
    if (bestD < 0.02) chosen.shift();
    ring.push(...chosen);
  }
  if (ring.length > 2 && km(ring[0], ring[ring.length - 1]) < 0.02) ring.pop();

  let startIdx = 0, minD = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const d = km(ring[i], startPt);
    if (d < minD) { minD = d; startIdx = i; }
  }
  let ordered = [...ring.slice(startIdx), ...ring.slice(0, startIdx)];
  // Yön kontrolü: ikinci durağa (Ulucami) önce gitmeli
  const fwdSample = ordered[Math.min(12, ordered.length - 1)];
  const bwdSample = ordered[Math.max(0, ordered.length - 12)];
  if (km(bwdSample, secondStopPt) < km(fwdSample, secondStopPt)) {
    ordered = [ordered[0], ...ordered.slice(1).reverse()];
  }
  ordered.push(ordered[0]);
  return ordered;
}

/**
 * Tek yönlü bir tramvay ilişkisindeki paralel peron kollarını eleyerek
 * güney ucundan kuzey ucuna kesintisiz ana hattı çıkarır.
 */
function extractTrunkPolyline(ways) {
  const adj = new Map();
  const nodes = new Map();
  const addNode = (p) => {
    const k = ptKey(p);
    if (!nodes.has(k)) nodes.set(k, p);
    return k;
  };
  for (const w of ways) {
    const pts = w.geometry.map((p) => [p.lon, p.lat]);
    const kA = addNode(pts[0]);
    const kB = addNode(pts[pts.length - 1]);
    if (!adj.has(kA)) adj.set(kA, []);
    if (!adj.has(kB)) adj.set(kB, []);
    const len = pathKm(pts);
    adj.get(kA).push({ to: kB, pts, len });
    adj.get(kB).push({ to: kA, pts: [...pts].reverse(), len });
  }

  // Bağlı bileşenleri (connected components) bul ve en uzun ana omurgayı seç
  const seenComp = new Set();
  let bestComp = null, bestSpan = -1;
  for (const k of nodes.keys()) {
    if (seenComp.has(k)) continue;
    const comp = [];
    const stack = [k];
    seenComp.add(k);
    let cMin = Infinity, cMax = -Infinity;
    while (stack.length) {
      const u = stack.pop();
      comp.push(u);
      const p = nodes.get(u);
      if (p[1] < cMin) cMin = p[1];
      if (p[1] > cMax) cMax = p[1];
      for (const edge of adj.get(u) || []) {
        if (!seenComp.has(edge.to)) {
          seenComp.add(edge.to);
          stack.push(edge.to);
        }
      }
    }
    const span = cMax - cMin;
    if (span > bestSpan) {
      bestSpan = span;
      bestComp = comp;
    }
  }

  let southK = null, northK = null, minLat = Infinity, maxLat = -Infinity;
  for (const k of bestComp || nodes.keys()) {
    const p = nodes.get(k);
    if (p[1] < minLat) { minLat = p[1]; southK = k; }
    if (p[1] > maxLat) { maxLat = p[1]; northK = k; }
  }

  // Dijkstra ile southK -> northK kesintisiz en temiz güzergâhı bul
  const dist = new Map([[southK, 0]]);
  const prev = new Map();
  const visited = new Set();
  while (true) {
    let cur = null, best = Infinity;
    for (const [k, d] of dist) {
      if (!visited.has(k) && d < best) { best = d; cur = k; }
    }
    if (!cur || cur === northK) break;
    visited.add(cur);
    for (const edge of adj.get(cur) || []) {
      const nd = best + edge.len;
      if (nd < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, nd);
        prev.set(edge.to, { from: cur, edge });
      }
    }
  }

  if (!prev.has(northK)) {
    throw new Error("T2 ana omurgası çıkarılamadı (northK ulaşılamadı).");
  }

  const edges = [];
  let cur = northK;
  while (prev.has(cur)) {
    const step = prev.get(cur);
    edges.push(step.edge.pts);
    cur = step.from;
  }
  edges.reverse();
  const out = [];
  for (const pts of edges) {
    if (!out.length) out.push(...pts);
    else out.push(...pts.slice(1));
  }
  return out;
}

const cleanStopName = (raw, prefix) => {
  let s = raw.replace(new RegExp(`^${prefix}-`), "").trim();
  s = s.replace(/\s*\/\s*/g, " / ");
  if (s === "Osmangazi" && prefix === "T1") s = "Osmangazi Meydan";
  return s;
};

function flattenCoords(pts) {
  const arr = [];
  for (const p of pts) arr.push(round5(p[0]), round5(p[1]));
  return arr;
}

function projectPosAlong(pts, target) {
  let cum = 0, bestD = Infinity, bestPos = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const ax = a[0] * KX, ay = a[1], bx = b[0] * KX, by = b[1];
    const px = target[0] * KX, py = target[1];
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
    const proj = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    const d = km(proj, target);
    const segLen = km(a, b);
    if (d < bestD) { bestD = d; bestPos = cum + t * segLen; }
    cum += segLen;
  }
  return bestPos;
}

async function loadRawOverpassData() {
  const useCache = process.argv.includes("--cache");
  const cacheGeom = "/tmp/bursa_trams_geom.json";
  const cacheStops = "/tmp/bursa_tram_stops.json";

  if (!useCache) {
    try {
      const combinedRes = await queryOverpass(`
        [out:json][timeout:25];
        (
          relation(11322581);
          relation(14502329);
          node["railway"="tram_stop"](40.175,29.040,40.278,29.080);
        );
        out geom;
      `);
      const rels = combinedRes.elements.filter((e) => e.type === "relation");
      const stopNodes = combinedRes.elements.filter((e) => e.type === "node");
      if (rels.length >= 2 && stopNodes.length >= 20) {
        return { rels, stopNodes, source: "Overpass API (Canlı)" };
      }
    } catch (err) {
      if (!fs.existsSync(cacheGeom) || !fs.existsSync(cacheStops)) throw err;
      console.warn("   Uyarı: Canlı Overpass yanıt vermedi, önbellek okunuyor:", err.message);
    }
  }

  if (fs.existsSync(cacheGeom) && fs.existsSync(cacheStops)) {
    const geomJson = JSON.parse(fs.readFileSync(cacheGeom, "utf8"));
    const stopJson = JSON.parse(fs.readFileSync(cacheStops, "utf8"));
    return {
      rels: geomJson.elements.filter((e) => e.type === "relation"),
      stopNodes: stopJson.elements.filter((e) => e.type === "node"),
      source: "Yerel Overpass önbelleği",
    };
  }
  throw new Error("Overpass API verisi alınamadı.");
}

async function main() {
  console.log("1/3 Overpass API'den T1 (11322581) ve T2 (14502329) güzergâhları ile durakları çekiliyor...");
  const { rels, stopNodes, source } = await loadRawOverpassData();
  console.log(`   Kaynak: ${source}`);

  const t1Rel = rels.find((r) => r.id === 11322581 || r.tags?.ref === "T1");
  const t2Rel =
    rels.find((r) => r.id === 14502329) ||
    rels.find((r) => r.tags?.ref === "T2" && (r.tags?.from || "").includes("Kent")) ||
    rels.find((r) => r.tags?.ref === "T2");
  if (!t1Rel || !t2Rel) {
    throw new Error("T1 veya T2 relation verisi alınamadı.");
  }

  console.log("2/3 Güzergâh geometrisi ve durak sıraları işleniyor...");
  const stopMap = new Map(stopNodes.map((e) => [e.id, e]));

  // T2 durakları (karşılıklı iki yön peronunu tek istasyonda ortala)
  const t2Buckets = new Map();
  for (const el of stopNodes) {
    const nm = el.tags?.name || "";
    if (!nm.startsWith("T2-")) continue;
    const clean = cleanStopName(nm, "T2");
    if (!t2Buckets.has(clean)) t2Buckets.set(clean, []);
    t2Buckets.get(clean).push([el.lon, el.lat]);
  }
  const t2RawPts = extractTrunkPolyline(t2Rel.members.filter((m) => m.type === "way"));
  const t2Simple = simplifyDP(t2RawPts, 0.005);
  const t2Km = Math.round(pathKm(t2RawPts) * 10) / 10;

  const t2Sts = [...t2Buckets.entries()]
    .map(([name, coords]) => {
      const lon = coords.reduce((a, c) => a + c[0], 0) / coords.length;
      const lat = coords.reduce((a, c) => a + c[1], 0) / coords.length;
      return { name, lon: round5(lon), lat: round5(lat), pos: projectPosAlong(t2RawPts, [lon, lat]) };
    })
    .sort((a, b) => a.pos - b.pos)
    .map((s) => [s.name, s.lon, s.lat]);

  const kentMeydaniNode = t2Sts.find((s) => s[0] === "Kent Meydanı");

  // T1 durakları ve ring güzergâhı
  const t1Members = t1Rel.members.filter((m) => m.type === "node");
  const seenT1 = new Set();
  const t1OrderedStops = [];
  for (const m of t1Members) {
    if (seenT1.has(m.ref)) continue;
    seenT1.add(m.ref);
    const node = stopMap.get(m.ref);
    const rawName = node?.tags?.name || "";
    if (!rawName) continue;
    const name = cleanStopName(rawName, "T1");
    t1OrderedStops.push([name, round5(m.lon), round5(m.lat)]);
  }
  // T1 üzerindeki Kent Meydanı aktarma durağını ekle (T2 Kent Meydanı ile ortak aktarma noktası)
  if (kentMeydaniNode && !t1OrderedStops.some((s) => s[0] === "Kent Meydanı")) {
    const osmIdx = t1OrderedStops.findIndex((s) => s[0].startsWith("Osmangazi"));
    const kmEntry = ["Kent Meydanı", kentMeydaniNode[1], kentMeydaniNode[2]];
    if (osmIdx >= 0) t1OrderedStops.splice(osmIdx + 1, 0, kmEntry);
    else t1OrderedStops.push(kmEntry);
  }

  const heykelPt = [t1OrderedStops[0][1], t1OrderedStops[0][2]];
  const ulucamiPt = [t1OrderedStops[1][1], t1OrderedStops[1][2]];
  const t1RawPts = stitchClosedLoop(
    t1Rel.members.filter((m) => m.type === "way"),
    heykelPt,
    ulucamiPt
  );
  const t1Simple = simplifyDP(t1RawPts, 0.004);
  const t1Km = Math.round(pathKm(t1RawPts) * 10) / 10;

  const t1Entry = {
    id: "T1",
    type: "tram",
    ring: true,
    title: "Heykel – Ulucami – Kent Meydanı (T1)",
    from: "Heykel",
    to: "Kent Meydanı (Ring)",
    km: t1Km,
    path: flattenCoords(t1Simple),
    sts: t1OrderedStops,
  };

  const t2Entry = {
    id: "T2",
    type: "tram",
    ring: false,
    title: "Kent Meydanı – Terminal (T2)",
    from: "Kent Meydanı",
    to: "Terminal",
    km: t2Km,
    path: flattenCoords(t2Simple),
    sts: t2Sts,
  };

  console.log(`   T1: ${t1Entry.sts.length} durak, ${t1Entry.km} km, ${t1Simple.length} koordinat noktası`);
  console.log(`   T2: ${t2Entry.sts.length} durak, ${t2Entry.km} km, ${t2Simple.length} koordinat noktası`);

  console.log("3/3 src/mapdata.js güncelleniyor...");
  const src = fs.readFileSync(MAPDATA_PATH, "utf8");
  const jsonStart = src.indexOf("{");
  const jsonEnd = src.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < 0) throw new Error("src/mapdata.js formatı tanınamadı.");
  const dataObj = JSON.parse(src.slice(jsonStart, jsonEnd + 1));

  const kept = (dataObj.bl || []).filter((l) => l.id !== "T1" && l.id !== "T2");
  dataObj.bl = [...kept, t1Entry, t2Entry];

  const outText = `export const D = ${JSON.stringify(dataObj)};\n`;
  fs.writeFileSync(MAPDATA_PATH, outText, "utf8");
  console.log("Tamamlandı! D.bl hatları:", dataObj.bl.map((x) => x.id).join(", "));
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
