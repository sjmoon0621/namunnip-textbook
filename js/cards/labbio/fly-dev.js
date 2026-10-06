/* 카드: 초파리 알은 며칠 만에 어른벌레가 될까? — 배아 시기 판정, 배양병 단계별 개체 수, 누적 비율 50% 시각, 온도 효과 */
(() => {
  const root = document.getElementById("card-labbio-fly-dev");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 25 °C에서 각 시기가 시작되는 발생 나이(시간). 문헌의 대략값 */
  const ST = [
    { n: "수정란·핵분열", a: 0, hint: "알 속에서 핵만 빠르게 분열합니다. 아직 세포막으로 나뉘지 않았습니다." },
    { n: "다핵성 포배", a: 1.3, hint: "수천 개의 핵이 알 표면 가까이 한 층으로 늘어섰지만 세포막은 아직 없습니다." },
    { n: "세포성 포배", a: 2.2, hint: "표면의 핵마다 세포막이 내려와 키 큰 세포 한 층이 알을 둘러쌉니다." },
    { n: "낭배·배대 신장", a: 2.9, hint: "배 쪽에 홈이 파이며 세포가 안으로 들어가고, 배대가 등 쪽으로 길게 뻗어 접힙니다." },
    { n: "체절 형성", a: 5.3, hint: "배대에 마디 홈이 되풀이해 생겨 체절이 보입니다." },
    { n: "등쪽 닫힘·기관 형성", a: 9.3, hint: "배대가 줄어들고 등 쪽이 닫히며, 입 갈고리·기관(숨관)이 보이는 애벌레 모양이 됩니다." },
    { n: "1령", a: 22, hint: "갓 부화한 작은 애벌레(약 1 mm)입니다. 앞 숨문이 없습니다." },
    { n: "2령", a: 47, hint: "첫 허물을 벗은 애벌레입니다. 앞 숨문이 생기고 입 갈고리 이빨이 늘어납니다." },
    { n: "3령", a: 72, hint: "가장 큰 애벌레(4~5 mm)입니다. 앞 숨문이 손가락처럼 갈라집니다. 후반에는 먹이 밖으로 기어 나옵니다." },
    { n: "번데기", a: 120, hint: "애벌레 껍질이 굳어 갈색 번데기 껍질이 됩니다. 안에서 어른벌레의 몸이 새로 만들어집니다." },
    { n: "성체", a: 228, hint: "번데기 껍질을 열고 나온 어른벌레입니다. 처음엔 날개가 접혀 있고 몸 색이 옅습니다." },
  ];
  const FACT = { 25: 1, 18: 2.0 };   // 18 °C에서 전체 발생 기간이 약 2배
  const N = 40;
  let T = 25, t = 0, one = null;
  /* 개체: 산란 시각(-2~0 h), 발생 속도 개인차 */
  const flies = [];
  let s = 3; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < N; i++) flies.push({ lay: -2 * r(), k: 1 + 0.05 * (r() + r() + r() - 1.5) * 2, x: r(), y: r(), m: r() });
  const ageOf = (f) => (t - f.lay) / (FACT[T] * f.k);
  const stageOf = (a) => { let i = 0; while (i + 1 < ST.length && a >= ST[i + 1].a) i++; return i; };
  const tOf = (v) => 480 * (v / 1000) ** 2;
  const lab = (h) => (h < 48 ? `${h.toFixed(h < 10 ? 1 : 0)}시간` : `${h.toFixed(0)}시간 (${(h / 24).toFixed(1)}일)`);

  const COLS = [{ key: "T", label: "온도" }, { key: "t", label: "시간 (h)", res: 1 }, { key: "e", label: "배아" }, { key: "l1", label: "1령" }, { key: "l2", label: "2령" }, { key: "l3", label: "3령" }, { key: "p", label: "번데기" }, { key: "ad", label: "성체" }];
  const tbl = L.table($(".tbl-host"), COLS, () => drawPlot());
  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  /* ---- 그림 도우미 ---- */
  function larva(c, x, y, len, ang, wid) {
    c.save(); c.translate(x, y); c.rotate(ang);
    const wd = wid || len * 0.22;
    c.fillStyle = "#f6f3ea"; c.strokeStyle = "#b9b2a0"; c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 0, len / 2, wd / 2, 0, 0, 6.3); c.fill(); c.stroke();
    if (len > 14) { c.strokeStyle = "rgba(160,150,130,.6)"; for (let k = 1; k < 11; k++) { const xx = -len / 2 + len * k / 11; c.beginPath(); c.moveTo(xx, -wd / 2 * 0.9); c.lineTo(xx, wd / 2 * 0.9); c.stroke(); } }
    c.fillStyle = "#222"; c.fillRect(len / 2 - Math.max(1.5, len * 0.05), -0.8, Math.max(1.5, len * 0.05), 1.6);
    c.restore();
  }
  function pupa(c, x, y, len, ang, dark, eye) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = dark ? "#7a4b22" : "#c99a5b"; c.strokeStyle = "#5d3a1a"; c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 0, len / 2, len * 0.17, 0, 0, 6.3); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(len / 2 - 2, -2); c.lineTo(len / 2 + len * 0.08, -len * 0.12); c.moveTo(len / 2 - 2, 2); c.lineTo(len / 2 + len * 0.08, len * 0.12); c.stroke();
    if (eye) { c.fillStyle = "#b02a1e"; c.beginPath(); c.arc(len * 0.3, -len * 0.06, len * 0.05, 0, 6.3); c.arc(len * 0.3, len * 0.06, len * 0.05, 0, 6.3); c.fill(); }
    c.restore();
  }
  function fly(c, x, y, sz, ang, pale) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = pale ? "rgba(220,215,200,.7)" : "rgba(210,225,235,.75)"; c.strokeStyle = "rgba(120,130,140,.8)"; c.lineWidth = 0.8;
    if (!pale) { c.beginPath(); c.ellipse(-sz * 0.15, -sz * 0.32, sz * 0.48, sz * 0.18, 0.35, 0, 6.3); c.fill(); c.stroke(); c.beginPath(); c.ellipse(-sz * 0.15, sz * 0.32, sz * 0.48, sz * 0.18, -0.35, 0, 6.3); c.fill(); c.stroke(); }
    c.fillStyle = pale ? "#d8c39a" : "#b88a4a"; c.beginPath(); c.ellipse(-sz * 0.25, 0, sz * 0.32, sz * 0.18, 0, 0, 6.3); c.fill();
    c.fillStyle = pale ? "#cdb07a" : "#9a6a30"; c.beginPath(); c.ellipse(sz * 0.12, 0, sz * 0.16, sz * 0.15, 0, 0, 6.3); c.fill();
    c.fillStyle = "#b02a1e"; c.beginPath(); c.arc(sz * 0.32, -sz * 0.1, sz * 0.09, 0, 6.3); c.arc(sz * 0.32, sz * 0.1, sz * 0.09, 0, 6.3); c.fill();
    c.restore();
  }
  /* 배아 (알) — 시기별 모식 */
  function embryo(c, x, y, Lx, Ly, st, a) {
    c.save(); c.translate(x, y);
    c.fillStyle = "#f3eedc"; c.strokeStyle = "#9b927a"; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(0, 0, Lx, Ly, 0, 0, 6.3); c.fill(); c.stroke();
    c.strokeStyle = "#9b927a"; c.beginPath(); c.moveTo(Lx * 0.82, -Ly * 0.55); c.quadraticCurveTo(Lx * 1.15, -Ly * 1.1, Lx * 1.35, -Ly * 1.05); c.moveTo(Lx * 0.85, -Ly * 0.35); c.quadraticCurveTo(Lx * 1.2, -Ly * 0.75, Lx * 1.42, -Ly * 0.65); c.stroke();
    c.fillStyle = "#7a6a9a";
    let q = 5; const rr = () => { q = (q * 16807) % 2147483647; return q / 2147483647; };
    if (st === 0) { const n = Math.min(64, 2 ** Math.floor(1 + a * 4.6)); for (let i = 0; i < n; i++) { const u = rr() * 6.28, d = Math.sqrt(rr()) * 0.5; c.beginPath(); c.arc(Math.cos(u) * Lx * d, Math.sin(u) * Ly * d, 1.6, 0, 6.3); c.fill(); } }
    else if (st === 1) { for (let i = 0; i < 70; i++) { const u = i / 70 * 6.28; c.beginPath(); c.arc(Math.cos(u) * Lx * 0.88, Math.sin(u) * Ly * 0.82, 1.3, 0, 6.3); c.fill(); } c.fillStyle = "#c7b3d6"; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-Lx * 0.93 + i * 2, (i - 2) * 2, 1.5, 0, 6.3); c.fill(); } }
    else if (st === 2) { c.strokeStyle = "#8a7aaa"; c.lineWidth = Ly * 0.18; c.beginPath(); c.ellipse(0, 0, Lx * 0.88, Ly * 0.8, 0, 0, 6.3); c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 0.6; for (let i = 0; i < 60; i++) { const u = i / 60 * 6.28; c.beginPath(); c.moveTo(Math.cos(u) * Lx * 0.79, Math.sin(u) * Ly * 0.7); c.lineTo(Math.cos(u) * Lx * 0.97, Math.sin(u) * Ly * 0.9); c.stroke(); } }
    else if (st === 3) { c.strokeStyle = "#8a7aaa"; c.lineWidth = Ly * 0.22; c.beginPath(); c.moveTo(-Lx * 0.75, Ly * 0.5); c.quadraticCurveTo(0, Ly * 0.85, Lx * 0.7, Ly * 0.45); c.quadraticCurveTo(Lx * 0.95, 0, Lx * 0.6, -Ly * 0.55); c.quadraticCurveTo(Lx * 0.2, -Ly * 0.75, -Lx * 0.05, -Ly * 0.5); c.stroke(); c.strokeStyle = "#5c4c7c"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-Lx * 0.42, -Ly * 0.85); c.lineTo(-Lx * 0.3, Ly * 0.1); c.stroke(); }
    else if (st === 4) { c.strokeStyle = "#8a7aaa"; c.lineWidth = Ly * 0.26; c.beginPath(); c.moveTo(-Lx * 0.75, Ly * 0.48); c.quadraticCurveTo(0, Ly * 0.82, Lx * 0.72, Ly * 0.42); c.quadraticCurveTo(Lx * 0.95, 0, Lx * 0.55, -Ly * 0.5); c.stroke(); c.strokeStyle = "#f3eedc"; c.lineWidth = 1.2; for (let i = 0; i < 12; i++) { const u = i / 12; const px = -Lx * 0.65 + u * Lx * 1.4; c.beginPath(); c.moveTo(px, Ly * 0.38 + Math.sin(u * 3) * 4); c.lineTo(px + 1, Ly * 0.8); c.stroke(); } }
    else { c.fillStyle = "#e7e1cc"; c.strokeStyle = "#9b927a"; c.beginPath(); c.ellipse(0, 0, Lx * 0.86, Ly * 0.72, 0, 0, 6.3); c.fill(); c.stroke(); c.strokeStyle = "rgba(150,140,120,.7)"; for (let i = 1; i < 12; i++) { const px = -Lx * 0.86 + Lx * 1.72 * i / 12; c.beginPath(); c.moveTo(px, -Ly * 0.6); c.lineTo(px, Ly * 0.6); c.stroke(); } c.strokeStyle = "#c9c1a6"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-Lx * 0.75, -Ly * 0.3); c.lineTo(Lx * 0.7, -Ly * 0.3); c.moveTo(-Lx * 0.75, Ly * 0.3); c.lineTo(Lx * 0.7, Ly * 0.3); c.stroke(); if (a > 15) { c.fillStyle = "#222"; c.fillRect(Lx * 0.72, -2, 6, 4); } }
    c.restore();
  }
  const larvaLen = (a) => { const st = stageOf(a); if (st < 6) return 0.6; const u = Math.min(1, (a - 22) / 98); return 0.8 + 3.9 * u ** 1.3; };   // mm

  function draw() {
    const { ctx: c, size } = cv, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    /* 배양병 */
    const vx = 18, vw = w * 0.36, vy = 16, vh = h - 30, food = vy + vh * 0.72;
    c.fillStyle = "rgba(220,235,245,.35)"; c.fillRect(vx, vy, vw, vh);
    c.fillStyle = "#d9b98a"; c.fillRect(vx, food, vw, vy + vh - food);
    c.fillStyle = "#f2efe6"; c.fillRect(vx - 2, vy - 10, vw + 4, 14);
    c.strokeStyle = C.ink2; c.lineWidth = 1.4; c.strokeRect(vx, vy, vw, vh);
    for (const f of flies) {
      const a = ageOf(f); if (a < 0) continue; const stg = stageOf(a);
      const px = vx + 8 + f.x * (vw - 16);
      if (stg < 6) { c.fillStyle = "#fffef6"; c.beginPath(); c.ellipse(px, food - 1, 2, 1.1, 0, 0, 6.3); c.fill(); }
      else if (stg < 8 || (stg === 8 && a < 100)) larva(c, px, food + 5 + f.y * (vy + vh - food - 12), 3 + larvaLen(a) * 2.6, f.m * 6.28);
      else if (stg === 8) larva(c, px, vy + 12 + f.y * (food - vy - 30), 3 + larvaLen(a) * 2.6, Math.PI / 2 + (f.m - 0.5));
      else if (stg === 9) pupa(c, px, vy + 12 + f.y * (food - vy - 30), 12, Math.PI / 2 + (f.m - 0.5) * 0.6, a > 140, a > 175);
      else fly(c, px, vy + 10 + f.y * (food - vy - 20), 13, f.m * 6.28, a < 230);
    }
    c.fillStyle = C.ink2; c.font = `11px ${F.mono}`; c.textAlign = "left";
    c.fillText(`${T} °C · ${lab(t)}`, vx, h - 4);
    /* 해부 현미경 시야 */
    const cx = w * 0.7, cy = h * 0.47, R = Math.min(w * 0.27, h * 0.43);
    c.fillStyle = C.night; c.beginPath(); c.arc(cx, cy, R + 4, 0, 6.3); c.fill();
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 6.3); c.clip();
    c.fillStyle = "#eef0ea"; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    if (one) {
      const a = Math.max(0, ageOf(one)), stg = stageOf(a);
      const mm = R * 0.32;   // 1 mm 화면 길이 (×20 안팎)
      if (stg < 6) embryo(c, cx - R * 0.08, cy, R * 0.66, R * 0.26, stg, a);
      else if (stg < 9) larva(c, cx, cy, larvaLen(a) * mm, -0.15, larvaLen(a) * mm * 0.2);
      else if (stg === 9) pupa(c, cx, cy, 3.1 * mm, -0.15, a > 140, a > 175);
      else fly(c, cx, cy, 2.6 * mm, -0.3, a < 230);
      if (stg < 6) { c.fillStyle = C.ink3; c.font = `10px ${F.mono}`; c.textAlign = "center"; c.fillText("×100 (알 길이 약 0.5 mm)", cx, cy + R * 0.72); }
      else { c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - mm / 2, cy + R * 0.7); c.lineTo(cx + mm / 2, cy + R * 0.7); c.stroke(); c.fillStyle = C.ink2; c.font = `10px ${F.mono}`; c.textAlign = "center"; c.fillText("1 mm", cx, cy + R * 0.7 - 5); }
    } else { c.fillStyle = C.ink3; c.font = `12px ${F.sans}`; c.textAlign = "center"; c.fillText("해부 현미경 시야", cx, cy); }
    c.restore();
  }

  function stagesUI() { $(".fd-stages").innerHTML = ST.map((x, i) => `<button class="chip" data-s="${i}" aria-pressed="false">${x.n}</button>`).join(""); }

  function count() {
    const row = { T: `${T} °C`, t: Math.round(t), e: 0, l1: 0, l2: 0, l3: 0, p: 0, ad: 0 };
    const key = ["e", "e", "e", "e", "e", "e", "l1", "l2", "l3", "p", "ad"];
    for (const f of flies) {
      const a = ageOf(f); if (a < 0) continue; const stg = stageOf(a);
      if (stg === 6 && Math.random() < 0.2) continue;   // 1령은 작아서 일부 놓침
      if (stg === 7 && Math.random() < 0.08) continue;
      row[key[stg]]++;
    }
    tbl.add(row);
  }

  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 40, w: w - 58, h: h - 76 };
    const rows = tbl.rows.filter((r) => r.T === `${T} °C`).slice().sort((p, q) => p.t - q.t);
    const tmax = T === 25 ? 260 : 480;
    const ser = [
      { n: "1령 이상", ks: ["l1", "l2", "l3", "p", "ad"], col: "#9cc58f" },
      { n: "2령 이상", ks: ["l2", "l3", "p", "ad"], col: C.leaf },
      { n: "3령 이상", ks: ["l3", "p", "ad"], col: C.forest },
      { n: "번데기 이상", ks: ["p", "ad"], col: C.amber },
      { n: "성체", ks: ["ad"], col: C.warn },
    ];
    const tot = (r) => r.e + r.l1 + r.l2 + r.l3 + r.p + r.ad;
    const X = (v) => box.x0 + v / tmax * box.w, Y = (v) => box.y0 + box.h - v / 100 * box.h;
    NM.axes(c, { ...box, X, Y, xt: L.ticks(0, tmax, 6).map((v) => [v, String(v)]), yt: [0, 50, 100].map((v) => [v, String(v)]), xlabel: `알을 받은 뒤 시간 (h) · ${T} °C 기록`, ylabel: "도달한 개체 비율 (%)" });
    c.strokeStyle = C.ink3; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(box.x0, Y(50)); c.lineTo(box.x0 + box.w, Y(50)); c.stroke(); c.setLineDash([]);
    const t50 = [];
    ser.forEach((sr) => {
      const pts = rows.filter((r) => tot(r) > 0).map((r) => ({ x: r.t, y: sr.ks.reduce((a, k) => a + r[k], 0) / tot(r) * 100 }));
      c.strokeStyle = sr.col; c.fillStyle = sr.col; c.lineWidth = 1.6;
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(X(p.x), Y(p.y)) : c.moveTo(X(p.x), Y(p.y)))); c.stroke();
      pts.forEach((p) => { c.beginPath(); c.arc(X(p.x), Y(p.y), 3, 0, 6.3); c.fill(); });
      let tc = NaN;
      for (let i = 1; i < pts.length; i++) if (pts[i - 1].y < 50 && pts[i].y >= 50) { tc = pts[i - 1].x + (50 - pts[i - 1].y) / (pts[i].y - pts[i - 1].y) * (pts[i].x - pts[i - 1].x); break; }
      t50.push(tc);
    });
    c.font = `10.5px ${F.sans}`; c.textAlign = "left";
    let lx = 8;
    ser.forEach((sr, i) => {
      const txt = `${sr.n}${Number.isFinite(t50[i]) ? ` ${t50[i].toFixed(0)}h` : ""}`;
      c.fillStyle = sr.col; c.fillRect(lx, 3, 8, 8); c.fillStyle = C.ink2; c.fillText(txt, lx + 11, 11);
      lx += c.measureText(txt).width + 22;
    });
  }

  const setT = (v) => { t = Math.round(tOf(v) * 10) / 10; $(".t-out").textContent = lab(t); draw(); };
  $(".t").addEventListener("input", (e) => setT(+e.target.value));
  $(".fd-temp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-T]"); if (!b) return; T = +b.dataset.T;
    root.querySelectorAll("[data-T]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); drawPlot();
  });
  $(".fd-count").addEventListener("click", count);
  $(".fd-clear").addEventListener("click", () => tbl.clear());
  $(".fd-one").addEventListener("click", () => {
    const live = flies.filter((f) => ageOf(f) >= 0); if (!live.length) return;
    one = live[Math.floor(Math.random() * live.length)];
    $(".fd-msg").textContent = "이 개체는 어느 시기일까요? 아래에서 고르세요.";
    root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", "false"));
    draw();
  });
  $(".fd-stages").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || !one) return;
    const k = stageOf(Math.max(0, ageOf(one))), ok = +b.dataset.s === k;
    root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".fd-msg").textContent = `${ok ? "맞습니다" : `다시 보세요. 이 개체는 ${ST[k].n}입니다`} — ${ST[k].hint}`;
  });
  stagesUI();
  setT(+$(".t").value);

  if (L.demo) {
    const hrs = [1, 3, 12, 24, 36, 48, 60, 72, 96, 110, 120, 132, 168, 216, 228, 240, 252];
    for (const hh of hrs) { t = hh; count(); }
    $(".t").value = 160; setT(160);
    one = flies[3]; const k = stageOf(Math.max(0, ageOf(one)));
    $(".fd-msg").textContent = `맞습니다 — ${ST[k].hint}`;
    root.querySelector(`[data-s="${k}"]`).setAttribute("aria-pressed", "true");
    draw(); drawPlot();
  }
})();
