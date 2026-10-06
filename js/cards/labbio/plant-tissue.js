/* 카드: 식물의 조직과 기관 — 뿌리·줄기·잎 단면에서 조직 찾기, 쌍떡잎/외떡잎 판정, 잎 표피 기공 밀도 */
(() => {
  const root = document.getElementById("card-labbio-plant-tissue");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TAU = Math.PI * 2;
  const ORG = { root: "뿌리", stemA: "줄기 A", stemB: "줄기 B", leaf: "잎" };
  const FUNC = {
    "표피": "한 겹의 세포가 바깥을 덮어 안쪽 조직을 보호합니다.",
    "뿌리털": "표피 세포가 가늘고 길게 자란 것으로, 흙과 닿는 넓이를 늘려 물과 무기 염류를 흡수합니다.",
    "큐티클층": "표피 바깥의 왁스 층으로, 잎 표면에서 물이 증발하는 것을 막습니다.",
    "피층": "크고 둥근 세포가 느슨하게 모인 기본 조직으로, 양분을 저장하고 물이 지나는 길이 됩니다.",
    "내피": "피층의 가장 안쪽 한 겹입니다. 세포벽의 카스파리선이 물의 샛길을 막아, 물과 무기 염류가 세포막을 거쳐 골라 들어가게 합니다.",
    "내초": "내피 바로 안쪽 층으로, 여기서 세포가 분열해 곁뿌리가 생깁니다.",
    "물관": "벽이 두껍고 속이 빈 죽은 세포가 이어진 관으로, 물과 무기 염류를 아래에서 위로 운반합니다. 사프라닌에 붉게 염색됩니다.",
    "체관": "살아 있는 세포가 체판으로 이어진 관으로, 잎에서 만든 당을 필요한 곳으로 운반합니다.",
    "형성층": "물관과 체관 사이의 분열 조직으로, 세포 분열을 해 줄기를 굵게 만듭니다(부피 생장).",
    "수": "줄기 중심의 큰 세포들로 이루어진 기본 조직으로, 양분을 저장합니다.",
    "기본 조직": "관다발 사이를 채우는 유조직으로, 외떡잎식물 줄기에서는 피층과 수의 구분이 없습니다.",
    "책상 조직": "엽록체가 많은 길쭉한 세포가 빽빽이 늘어서 있어, 빛을 많이 받는 윗면 쪽에서 광합성을 가장 활발히 합니다.",
    "해면 조직": "세포가 불규칙하게 흩어져 세포 사이 공간이 넓습니다. 기공으로 들어온 CO₂와 수증기가 이 공간으로 퍼집니다.",
    "공변세포": "기공을 둘러싼 콩팥 모양 세포 한 쌍으로, 엽록체가 있고 물을 얻거나 잃으면서 기공을 여닫습니다.",
    "기공": "공변세포 사이의 틈으로, CO₂와 O₂가 드나들고 증산 작용으로 수증기가 빠져나갑니다.",
  };
  let organ = "root", side = "low", pick = null, fieldNo = { up: 1, low: 1 }, stomata = [], stemJ = {};
  const tbl = L.table($(".t1"), [{ key: "o", label: "표본" }, { key: "g", label: "고른 이름" }, { key: "j", label: "판정" }, { key: "a", label: "정답" }], () => nums1());
  const tbl2 = L.table($(".t2"), [{ key: "s", label: "면" }, { key: "f", label: "시야" }, { key: "n", label: "기공 수" }, { key: "d", label: "밀도 (개/mm²)", res: 1 }], () => nums2());
  const { ctx, size } = fit($(".cv-sq"), () => draw());
  const AREA = Math.PI * 0.225 * 0.225;   // mm²
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* 외떡잎 줄기의 관다발 위치 (바깥쪽에 더 많이) */
  const MONO = (() => { const r = rng(11), out = []; let tries = 0; while (out.length < 30 && tries++ < 3000) { const rr = 0.82 * Math.sqrt(r()) ** 0.6, a = r() * TAU, x = rr * Math.cos(a), y = rr * Math.sin(a); if (out.every((p) => Math.hypot(p[0] - x, p[1] - y) > 0.16)) out.push([x, y]); } return out; })();
  const HAIRS = Array.from({ length: 16 }, (_, i) => i / 16 * TAU + 0.13 * Math.sin(i * 3));
  const angDist = (a, b) => { let d = Math.abs(a - b) % TAU; return d > Math.PI ? TAU - d : d; };

  /* 조직 판정 (u, v: 시야 반지름을 1로 둔 좌표) */
  function tissueAt(u, v) {
    const r = Math.hypot(u, v), phi = Math.atan2(v, u);
    if (organ === "root") {
      if (r > 0.86 && r < 0.99 && HAIRS.some((a) => angDist(a, phi) * r < 0.025)) return "뿌리털";
      if (r > 0.86) return null;
      if (r >= 0.8) return "표피";
      if (r >= 0.3) return "피층";
      if (r >= 0.26) return "내피";
      if (r >= 0.22) return "내초";
      const arm = Math.min(...[0, 1, 2, 3].map((k) => angDist(phi, k * Math.PI / 2 + Math.PI / 4)));
      return r < 0.07 || arm * r < 0.045 ? "물관" : "체관";
    }
    if (organ === "stemA") {
      if (r > 0.92) return null;
      if (r >= 0.88) return "표피";
      const inB = [...Array(8)].some((_, k) => angDist(phi, k * Math.PI / 4) * r < 0.1);
      if (r >= 0.52 && r < 0.55) return "형성층";
      if (inB && r >= 0.55 && r < 0.66) return "체관";
      if (inB && r >= 0.38 && r < 0.52) return "물관";
      return r >= 0.55 ? "피층" : "수";
    }
    if (organ === "stemB") {
      if (r > 0.92) return null;
      if (r >= 0.88) return "표피";
      for (const [x, y] of MONO) {
        const d = Math.hypot(u - x, v - y);
        if (d < 0.065) { const rr = Math.hypot(x, y) || 1, inward = -((u - x) * x + (v - y) * y) / rr; return inward > -0.005 ? "물관" : "체관"; }
      }
      return "기본 조직";
    }
    /* 잎 단면 */
    if (Math.hypot(u + 0.35, v - 0.1) < 0.17) return v < 0.1 ? "물관" : "체관";
    if (v < -0.64 || v > 0.54) return null;
    if (v < -0.6) return "큐티클층";
    if (v < -0.5) return "표피";
    if (v < -0.14) return "책상 조직";
    if (v < 0.4) {
      if (u > 0.26 && u < 0.46 && v > 0.28) return "기공";
      return "해면 조직";
    }
    if (v < 0.5) { if (u > 0.3 && u < 0.34 || u > 0.38 && u < 0.42) return "공변세포"; if (u >= 0.34 && u <= 0.38) return "기공"; return "표피"; }
    return "큐티클층";
  }

  const cells = (cx, cy, R, r0, r1, cr, fill, stroke) => {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 0.8;
    for (let rr = r0 + cr; rr < r1 - cr * 0.5; rr += cr * 2) { const n = Math.max(1, Math.floor(TAU * rr / (cr * 2))); for (let i = 0; i < n; i++) { const a = i / n * TAU + rr * 7; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr * R, cy + Math.sin(a) * rr * R, cr * R * 0.95, 0, TAU); ctx.fill(); ctx.stroke(); } }
  };

  function drawSection(cx, cy, R) {
    ctx.fillStyle = "#f4f2ea"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const ring = (r0, r1, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r1 * R, 0, TAU); ctx.arc(cx, cy, r0 * R, 0, TAU, true); ctx.fill(); };
    if (organ === "root") {
      ctx.strokeStyle = "#b8a98a"; ctx.lineWidth = 2;
      HAIRS.forEach((a) => { ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 0.86 * R, cy + Math.sin(a) * 0.86 * R); ctx.quadraticCurveTo(cx + Math.cos(a + 0.03) * 0.93 * R, cy + Math.sin(a + 0.03) * 0.93 * R, cx + Math.cos(a) * 0.985 * R, cy + Math.sin(a) * 0.985 * R); ctx.stroke(); });
      ring(0.8, 0.86, "#e6dcc0"); ring(0, 0.8, "#efe9d8");
      cells(cx, cy, R, 0.3, 0.8, 0.036, "#f6f1e2", "#c9bc98");
      ring(0.26, 0.3, "#d9a77a"); ring(0.22, 0.26, "#ece4cc"); ring(0, 0.22, "#dfe8cf");
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; for (let s = 0.03; s < 0.21; s += 0.04) { ctx.fillStyle = "#c94a4a"; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * s * R, cy + Math.sin(a) * s * R, (0.024 - s * 0.05) * R, 0, TAU); ctx.fill(); } }
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ctx.fillStyle = "#8db07a"; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 0.15 * R, cy + Math.sin(a) * 0.15 * R, 0.035 * R, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = "#b9ab88"; ctx.lineWidth = 1; for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 0.8 * R, cy + Math.sin(a) * 0.8 * R); ctx.lineTo(cx + Math.cos(a) * 0.86 * R, cy + Math.sin(a) * 0.86 * R); ctx.stroke(); }
    } else if (organ === "stemA") {
      ring(0.88, 0.92, "#e2d6b4"); ring(0, 0.88, "#f1ecdc");
      cells(cx, cy, R, 0.66, 0.88, 0.03, "#f6f1e2", "#c9bc98");
      cells(cx, cy, R, 0.0, 0.38, 0.045, "#f7f3e6", "#cfc3a2");
      ctx.strokeStyle = "#7aa060"; ctx.lineWidth = 0.03 * R; ctx.beginPath(); ctx.arc(cx, cy, 0.535 * R, 0, TAU); ctx.stroke();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, wedge = (r0, r1, col) => { const da = 0.1 / ((r0 + r1) / 2); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r1 * R, a - da, a + da); ctx.arc(cx, cy, r0 * R, a + da, a - da, true); ctx.fill(); };
        wedge(0.55, 0.66, "#a9c98f"); wedge(0.38, 0.52, "#e3b0a8");
        for (let s = 0.4; s < 0.51; s += 0.035) for (const off of [-0.05, 0, 0.05]) { ctx.fillStyle = "#c94a4a"; ctx.beginPath(); ctx.arc(cx + Math.cos(a + off / s) * s * R, cy + Math.sin(a + off / s) * s * R, 0.013 * R, 0, TAU); ctx.fill(); }
      }
    } else if (organ === "stemB") {
      ring(0.88, 0.92, "#e2d6b4"); ring(0, 0.88, "#f1ecdc");
      cells(cx, cy, R, 0.0, 0.88, 0.028, "#f6f1e2", "#d2c6a6");
      MONO.forEach(([x, y]) => {
        const px = cx + x * R, py = cy + y * R, rr = Math.hypot(x, y) || 1, ix = -x / rr, iy = -y / rr;
        ctx.fillStyle = "#e6d8b8"; ctx.beginPath(); ctx.arc(px, py, 0.068 * R, 0, TAU); ctx.fill();
        ctx.fillStyle = "#a9c98f"; ctx.beginPath(); ctx.arc(px - ix * 0.03 * R, py - iy * 0.03 * R, 0.03 * R, 0, TAU); ctx.fill();
        ctx.fillStyle = "#c94a4a"; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(px + ix * 0.02 * R - iy * s * 0.03 * R, py + iy * 0.02 * R + ix * s * 0.03 * R, 0.018 * R, 0, TAU); ctx.fill(); });
        ctx.beginPath(); ctx.arc(px + ix * 0.045 * R, py + iy * 0.045 * R, 0.01 * R, 0, TAU); ctx.fill();
      });
    } else {
      const Y = (v) => cy + v * R, X = (u) => cx + u * R;
      ctx.fillStyle = "#f4f2ea"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      ctx.fillStyle = "#e9dc9a"; ctx.fillRect(X(-1), Y(-0.64), 2 * R, 0.04 * R); ctx.fillRect(X(-1), Y(0.5), 2 * R, 0.035 * R);
      ctx.fillStyle = "#efe9d6"; ctx.fillRect(X(-1), Y(-0.6), 2 * R, 0.1 * R); ctx.fillRect(X(-1), Y(0.4), 2 * R, 0.1 * R);
      ctx.strokeStyle = "#c9bc98"; ctx.lineWidth = 0.8;
      for (let u = -1; u < 1; u += 0.09) { ctx.strokeRect(X(u), Y(-0.6), 0.09 * R, 0.1 * R); if (!(u > 0.26 && u < 0.44)) ctx.strokeRect(X(u), Y(0.4), 0.09 * R, 0.1 * R); }
      for (let u = -1; u < 1; u += 0.075) { ctx.fillStyle = "#e3edd3"; ctx.fillRect(X(u) + 1, Y(-0.49), 0.075 * R - 2, 0.34 * R); ctx.strokeRect(X(u) + 1, Y(-0.49), 0.075 * R - 2, 0.34 * R); ctx.fillStyle = "#4f9a3c"; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(X(u) + (k % 2 ? 0.05 : 0.025) * R, Y(-0.45 + k * 0.055), 0.012 * R, 0, TAU); ctx.fill(); } }
      const r = rng(5);
      for (let i = 0; i < 70; i++) { const u = -1 + r() * 2, v = -0.1 + r() * 0.46; if (Math.hypot(u + 0.35, v - 0.1) < 0.2 || (u > 0.24 && u < 0.48 && v > 0.26)) continue; ctx.fillStyle = "#e8efd9"; ctx.beginPath(); ctx.ellipse(X(u), Y(v), 0.055 * R, 0.04 * R, r() * 3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#5fa548"; ctx.beginPath(); ctx.arc(X(u), Y(v), 0.01 * R, 0, TAU); ctx.fill(); }
      ctx.fillStyle = "#f6f3e8"; ctx.beginPath(); ctx.ellipse(X(0.36), Y(0.33), 0.1 * R, 0.07 * R, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#b8d79f"; ctx.strokeStyle = "#6c9a50"; [[0.3, 0.34], [0.38, 0.42]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(X((a + b) / 2), Y(0.45), (b - a) / 2 * R, 0.05 * R, 0, 0, TAU); ctx.fill(); ctx.stroke(); });
      ctx.fillStyle = "#ede3c6"; ctx.beginPath(); ctx.arc(X(-0.35), Y(0.1), 0.19 * R, 0, TAU); ctx.fill();
      ctx.fillStyle = "#e3b0a8"; ctx.beginPath(); ctx.arc(X(-0.35), Y(0.1), 0.17 * R, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = "#a9c98f"; ctx.beginPath(); ctx.arc(X(-0.35), Y(0.1), 0.17 * R, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#c94a4a"; for (let k = -2; k <= 2; k++) for (let j = 1; j <= 3; j++) { ctx.beginPath(); ctx.arc(X(-0.35 + k * 0.05), Y(0.1 - j * 0.04), 0.014 * R, 0, TAU); ctx.fill(); }
    }
  }

  function makeField() {
    const dens = side === "low" ? 250 : 50, r = Math.random, out = [];
    const Rum = 245, n = Math.round(dens * Math.PI * (Rum / 1000) ** 2 * (1 + 0.15 * L.gauss()));
    let tries = 0;
    while (out.length < n && tries++ < 5000) { const rr = Rum * Math.sqrt(r()), a = r() * TAU, x = rr * Math.cos(a), y = rr * Math.sin(a); if (out.every((p) => Math.hypot(p.x - x, p.y - y) > 26)) out.push({ x, y, a: r() * Math.PI, mark: false }); }
    stomata = out;
  }
  function drawEpi(cx, cy, R) {
    const s = R / 225;
    ctx.fillStyle = "#eef0e6"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.strokeStyle = "rgba(110,120,100,.55)"; ctx.lineWidth = 1;
    const sp = 38, seed = (side === "low" ? 3 : 9) + fieldNo[side];
    for (let k = -8; k <= 8; k++) for (const vert of [0, 1]) {
      ctx.beginPath();
      for (let t = -260; t <= 260; t += 3) {
        const base = k * sp + 7 * Math.sin(k * 1.7 + seed), wav = 5 * Math.sin(t / 9 + k * 2.1 + seed) + 3 * Math.sin(t / 4.1 + k);
        const X = cx + (vert ? base + wav : t) * s, Y = cy + (vert ? t : base + wav) * s; t === -260 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      }
      ctx.stroke();
    }
    for (const st of stomata) {
      ctx.save(); ctx.translate(cx + st.x * s, cy + st.y * s); ctx.rotate(st.a);
      ctx.fillStyle = "#cfe3bb"; ctx.strokeStyle = "#5f8a4a"; ctx.lineWidth = 1;
      [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(0, k * 4 * s, 13 * s, 4.2 * s, 0, 0, TAU); ctx.fill(); ctx.stroke(); });
      ctx.fillStyle = "#4a5a40"; ctx.beginPath(); ctx.ellipse(0, 0, 7 * s, 1.2 * s, 0, 0, TAU); ctx.fill();
      ctx.restore();
      if (st.mark) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(cx + st.x * s, cy + st.y * s - 12 * s, 3.5, 0, TAU); ctx.fill(); }
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 6;
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    if (organ === "epi") drawEpi(cx, cy, R); else drawSection(cx, cy, R);
    if (pick && organ !== "epi") { const px = cx + pick.u * R, py = cy + pick.v * R; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.moveTo(px - 12, py); ctx.lineTo(px - 4, py); ctx.moveTo(px + 4, py); ctx.lineTo(px + 12, py); ctx.moveTo(px, py - 12); ctx.lineTo(px, py - 4); ctx.moveTo(px, py + 4); ctx.lineTo(px, py + 12); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.fillStyle = "#e8e8e0"; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(organ === "epi" ? `${side === "low" ? "아랫면" : "윗면"} 표피 · 400배` : `${ORG[organ]} 횡단면`, 8, 16);
    if (organ === "epi") { ctx.textAlign = "right"; ctx.fillText(`시야 ${fieldNo[side]} · ${stomata.filter((s) => s.mark).length}개 표시`, w - 8, 16); }
  }

  function nums1() {
    const rows = tbl.rows.filter((r) => r.g !== "—"), tiss = rows.filter((r) => !/떡잎/.test(r.a));
    $(".n-ok").textContent = tiss.length ? `${tiss.filter((r) => r.j === "맞음").length} / ${tiss.length}` : "—";
    $(".n-kinds").textContent = `${new Set(tiss.filter((r) => r.j === "맞음").map((r) => r.a)).size} / 15`;
    const sj = rows.filter((r) => /떡잎/.test(r.a));
    $(".n-stem").textContent = sj.length ? sj.slice(-2).map((r) => `${r.o} ${r.j}`).join(", ") : "—";
  }
  function nums2() {
    const st = (k) => L.stats(tbl2.rows.filter((r) => r.s === k).map((r) => r.d));
    const u = st("윗면"), l = st("아랫면");
    const f = (s) => (s.n ? `${s.mean.toFixed(0)}${s.n > 1 ? " ± " + s.sd.toFixed(0) : ""} /mm²` : "—");
    $(".n-up").textContent = f(u); $(".n-low").textContent = f(l);
    $(".n-ratio").textContent = u.n && l.n && u.mean > 0 ? `${(l.mean / u.mean).toFixed(1)}배` : "—";
  }

  function setOrgan(g) {
    organ = g; pick = null;
    root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.g === g)));
    $(".sec-mode").hidden = g === "epi"; $(".epi-mode").hidden = g !== "epi";
    $(".judge-stem").hidden = !(g === "stemA" || g === "stemB");
    if (g === "epi" && !stomata.length) makeField();
    const fb = $(".fb"); fb.classList.remove("good", "bad"); fb.textContent = "단면에서 조직 한 곳을 누른 뒤, 아래에서 그 조직의 이름을 고르세요.";
    draw();
  }
  function choose(name) {
    const fb = $(".fb"); fb.classList.remove("good", "bad");
    if (!pick || !pick.t) { fb.textContent = "먼저 단면에서 조직을 한 곳 누르세요."; return; }
    const ok = name === pick.t;
    tbl.add({ o: ORG[organ], g: name, j: ok ? "맞음" : "틀림", a: ok ? pick.t : "다시 확인" });
    fb.classList.add(ok ? "good" : "bad");
    fb.textContent = ok ? `${pick.t}: ${FUNC[pick.t]}` : `${name}이(가) 아닙니다. 위치와 세포 모양을 다시 보세요. (${name}: ${FUNC[name]})`;
  }

  $(".cv-sq").addEventListener("click", (e) => {
    const r = $(".cv-sq").getBoundingClientRect(), { w, h } = size, R = Math.min(w, h) / 2 - 6;
    const u = (e.clientX - r.left - w / 2) / R, v = (e.clientY - r.top - h / 2) / R;
    if (Math.hypot(u, v) > 1) return;
    if (organ === "epi") {
      const s = R / 225; let best = null, bd = 1e9;
      stomata.forEach((st) => { const d = Math.hypot(st.x * s - u * R, st.y * s - v * R); if (d < bd) { bd = d; best = st; } });
      if (best && bd < 16 * s + 6) { if (Math.hypot(best.x, best.y) > 225) { /* 중심이 시야 밖: 세지 않음 */ } else best.mark = !best.mark; }
      draw(); return;
    }
    pick = { u, v, t: tissueAt(u, v) };
    const fb = $(".fb"); fb.classList.remove("good", "bad");
    fb.textContent = pick.t ? "이 조직의 이름은 무엇일까요? 아래에서 고르세요." : "조직이 아닌 곳(표본 바깥)입니다.";
    draw();
  });
  $(".organ").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (b) setOrgan(b.dataset.g); });
  $(".names").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (b) choose(b.dataset.n); });
  $(".judge-stem").addEventListener("click", (e) => {
    const b = e.target.closest("[data-j]"); if (!b) return;
    const truth = organ === "stemA" ? "쌍떡잎식물" : "외떡잎식물", ok = b.dataset.j === truth;
    tbl.add({ o: ORG[organ], g: b.dataset.j, j: ok ? "맞음" : "틀림", a: ok ? truth : "다시 확인 (떡잎)" });
    const fb = $(".fb"); fb.classList.remove("good", "bad"); fb.classList.add(ok ? "good" : "bad");
    fb.textContent = ok ? (truth === "쌍떡잎식물" ? "맞습니다. 관다발이 고리 모양으로 늘어서 있고 물관과 체관 사이에 형성층이 있습니다." : "맞습니다. 관다발이 흩어져 있고 형성층이 없으며, 피층과 수의 구분이 없습니다.") : "관다발이 어떻게 배열되어 있는지, 형성층이 있는지 다시 보세요.";
  });
  $(".side").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; side = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); makeField(); draw(); });
  $(".field").addEventListener("click", () => { fieldNo[side]++; makeField(); draw(); });
  $(".unmark").addEventListener("click", () => { stomata.forEach((s) => (s.mark = false)); draw(); });
  $(".rec").addEventListener("click", () => { const n = stomata.filter((s) => s.mark).length; tbl2.add({ s: side === "low" ? "아랫면" : "윗면", f: fieldNo[side], n, d: n / AREA }); });
  $(".clear2").addEventListener("click", () => tbl2.clear());
  setOrgan("root"); nums1(); nums2();

  if (L.demo) {
    const R = Math.min(size.w, size.h) / 2 - 6;
    const at = (g, u, v, name) => { setOrgan(g); pick = { u, v, t: tissueAt(u, v) }; choose(name || pick.t); };
    at("root", 0.83, 0, "표피"); at("root", 0.5, 0.2); at("root", 0.28, 0, "피층"); at("root", 0.28, 0.0, "내피"); at("root", 0.04, 0.0);
    at("stemA", 0.6, 0, "체관"); at("stemA", 0.45, 0, "물관"); at("stemA", 0.0, 0.1, "수");
    $(".judge-stem [data-j='쌍떡잎식물']").click();
    setOrgan("stemB"); $(".judge-stem [data-j='외떡잎식물']").click();
    for (const s of ["up", "low"]) { side = s; for (let f = 0; f < 3; f++) { fieldNo[s] = f + 1; makeField(); stomata.forEach((st) => (st.mark = Math.hypot(st.x, st.y) <= 225)); $(".rec").click(); } }
    side = "low"; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === "low")));
    at("leaf", -0.2, -0.3, "책상 조직");
    at("leaf", 0.32, 0.45, "공변세포");
    void R;
  }
})();
