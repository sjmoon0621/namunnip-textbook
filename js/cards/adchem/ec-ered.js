/* 카드: 표 하나로 어떤 산화·환원 반응이 일어날지 알 수 있을까? — 표준 환원 전위 표, 대각선 규칙, ΔG° = −nFE° */
(() => {
  const root = document.getElementById("card-adchem-ered");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), selO = $(".ox"), selR = $(".rd");
  const BLUE = "#3f6fa3", FARADAY = 96485;
  /* 표준 환원 전위 (V, 25 °C, CRC Handbook). L → R 은 환원 방향, n = 전자 수 */
  const T = [
    { k: "F2", E: 2.866, L: [[1, "F₂"]], R: [[2, "F⁻"]], n: 2 },
    { k: "H2O2", E: 1.776, L: [[1, "H₂O₂"], [2, "H⁺"]], R: [[2, "H₂O"]], n: 2 },
    { k: "MnO4", E: 1.507, L: [[1, "MnO₄⁻"], [8, "H⁺"]], R: [[1, "Mn²⁺"], [4, "H₂O"]], n: 5 },
    { k: "Cl2", E: 1.358, L: [[1, "Cl₂"]], R: [[2, "Cl⁻"]], n: 2 },
    { k: "O2", E: 1.229, L: [[1, "O₂"], [4, "H⁺"]], R: [[2, "H₂O"]], n: 4 },
    { k: "Br2", E: 1.066, L: [[1, "Br₂(l)"]], R: [[2, "Br⁻"]], n: 2 },
    { k: "Ag", E: 0.800, L: [[1, "Ag⁺"]], R: [[1, "Ag"]], n: 1 },
    { k: "Fe3", E: 0.771, L: [[1, "Fe³⁺"]], R: [[1, "Fe²⁺"]], n: 1 },
    { k: "I2", E: 0.536, L: [[1, "I₂"]], R: [[2, "I⁻"]], n: 2 },
    { k: "Cu", E: 0.342, L: [[1, "Cu²⁺"]], R: [[1, "Cu"]], n: 2 },
    { k: "H", E: 0.000, L: [[2, "H⁺"]], R: [[1, "H₂"]], n: 2 },
    { k: "Pb", E: -0.126, L: [[1, "Pb²⁺"]], R: [[1, "Pb"]], n: 2 },
    { k: "Fe", E: -0.447, L: [[1, "Fe²⁺"]], R: [[1, "Fe"]], n: 2 },
    { k: "Zn", E: -0.762, L: [[1, "Zn²⁺"]], R: [[1, "Zn"]], n: 2 },
    { k: "Al", E: -1.662, L: [[1, "Al³⁺"]], R: [[1, "Al"]], n: 3 },
    { k: "Mg", E: -2.372, L: [[1, "Mg²⁺"]], R: [[1, "Mg"]], n: 2 },
    { k: "Li", E: -3.040, L: [[1, "Li⁺"]], R: [[1, "Li"]], n: 1 },
  ];
  const term = (c, s) => (c === 1 ? "" : c) + s;
  const sideStr = (l) => l.map(([c, s]) => term(c, s)).join(" + ");
  const halfStr = (t) => `${sideStr(t.L)} + ${term(t.n, "e⁻")} → ${sideStr(t.R)}`;
  const fmtE = (x) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(3);
  T.forEach((t, i) => {
    selO.insertAdjacentHTML("beforeend", `<option value="${i}">${sideStr(t.L)} (E° ${fmtE(t.E)} V)</option>`);
    selR.insertAdjacentHTML("beforeend", `<option value="${i}">${sideStr(t.R)} (E° ${fmtE(t.E)} V)</option>`);
  });
  const idx = (k) => T.findIndex((t) => t.k === k);
  selO.value = idx("Ag"); selR.value = idx("Cu");
  if (/demo/.test(location.search)) { selO.value = idx("Cl2"); selR.value = idx("Br2"); }

  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  function cell() {
    const c = T[+selO.value], a = T[+selR.value];
    const n = c.n * a.n / gcd(c.n, a.n), mc = n / c.n, ma = n / a.n;
    const net = new Map(), order = [];
    const add = (s, v) => { if (!net.has(s)) { net.set(s, 0); order.push(s); } net.set(s, net.get(s) + v); };
    c.L.forEach(([k, s]) => add(s, -mc * k)); a.R.forEach(([k, s]) => add(s, -ma * k));
    c.R.forEach(([k, s]) => add(s, mc * k)); a.L.forEach(([k, s]) => add(s, ma * k));
    const L = [], R = [];
    order.forEach((s) => { const v = net.get(s); if (v < 0) L.push(term(-v, s)); else if (v > 0) R.push(term(v, s)); });
    const E = c.E - a.E;
    return { c, a, n, E, dG: -n * FARADAY * E / 1000, str: L.join(" + ") + " → " + R.join(" + ") };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ci = +selO.value, ai = +selR.value, k = cell();
    const top = 40, bot = h - 26, dy = (bot - top) / T.length;
    const xL = w * 0.42, xA = w * 0.46, xR = w * 0.50, xE = w - 8;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = BLUE; ctx.textAlign = "right"; ctx.fillText("↑ 강한 산화제", xL, 16);
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("강한 환원제 ↓", xR, h - 8);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("E° (V)", xE, 16);
    const fs = Math.max(10, Math.min(12.5, dy * 0.5));
    const boxes = {};
    T.forEach((t, i) => {
      const y = top + dy * (i + 0.5);
      if (i % 2 === 0) { ctx.fillStyle = "rgba(0,0,0,.025)"; ctx.fillRect(0, y - dy / 2, w, dy); }
      if (t.k === "H") { ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y + dy / 2); ctx.lineTo(w, y + dy / 2); ctx.moveTo(0, y - dy / 2); ctx.lineTo(w, y - dy / 2); ctx.stroke(); }
      const lt = `${sideStr(t.L)} + ${term(t.n, "e⁻")}`, rt = sideStr(t.R);
      ctx.font = `${fs}px ${F.mono}`;
      const isC = i === ci, isA = i === ai;
      ctx.fillStyle = isC ? BLUE : C.ink; ctx.textAlign = "right"; ctx.fillText(lt, xL, y + fs * 0.36);
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("→", xA, y + fs * 0.36);
      ctx.fillStyle = isA ? C.warn : C.ink; ctx.textAlign = "left"; ctx.fillText(rt, xR, y + fs * 0.36);
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText(fmtE(t.E), xE, y + fs * 0.36);
      if (isC) { const tw = ctx.measureText(sideStr(t.L)).width; ctx.font = `${fs}px ${F.mono}`; const full = ctx.measureText(lt).width; boxes.c = [xL - full - 4, y - dy * 0.42, tw + 8, dy * 0.84]; }
      if (isA) { const tw = ctx.measureText(rt).width; boxes.a = [xR - 4, y - dy * 0.42, tw + 8, dy * 0.84]; }
    });
    ctx.lineWidth = 1.6;
    if (boxes.c) { ctx.strokeStyle = BLUE; ctx.strokeRect(...boxes.c); }
    if (boxes.a) { ctx.strokeStyle = C.warn; ctx.strokeRect(...boxes.a); }
    if (ci === ai || !boxes.c || !boxes.a) return;
    /* 전자: 환원제(오른쪽) → 산화제(왼쪽) */
    const [ax, ay, aw, ah] = boxes.a, [cx, cy, cw, ch] = boxes.c;
    const sx = ax + aw / 2, sy = ai > ci ? ay : ay + ah, ex = cx + cw / 2, ey = ai > ci ? cy + ch : cy;
    const col = k.E > 0 ? C.forest : C.warn;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.setLineDash(k.E > 0 ? [] : [5, 4]);
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(ey - my, ex - mx);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 9 * Math.cos(ang - 0.4), ey - 9 * Math.sin(ang - 0.4)); ctx.lineTo(ex - 9 * Math.cos(ang + 0.4), ey - 9 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = col; ctx.fillText(k.E > 0 ? "화살표: e⁻가 저절로 옮겨 감" : "점선: e⁻가 저절로 가지 않음", 8, h - 8);
  }

  function update() {
    const k = cell(), same = +selO.value === +selR.value;
    $(".net").textContent = same ? "같은 반쪽 반응끼리는 전지가 되지 않습니다." : `${k.str}`;
    $(".n-e").textContent = same ? "—" : fmtE(k.E);
    $(".n-n").textContent = same ? "—" : String(k.n);
    $(".n-g").textContent = same ? "—" : (k.dG > 0 ? "+" : "−") + Math.abs(k.dG).toFixed(0);
    const s = $(".n-s"); s.textContent = same ? "—" : k.E > 0 ? "자발적" : "비자발적";
    s.className = "n-s " + (same ? "" : k.E > 0 ? "good" : "bad");
    draw();
  }
  selO.addEventListener("change", update); selR.addEventListener("change", update);
  update();
})();
