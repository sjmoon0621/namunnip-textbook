/* 카드: 초파리 침샘 염색체는 왜 맨눈 가까이 보일 만큼 클까? — 표본 절차, 다사 염색체와 중기 염색체의 팔 길이 비교, 퍼프 */
(() => {
  const root = document.getElementById("card-labbio-polytene");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const ARMS = ["X", "2L", "2R", "3L", "3R", "4"];
  /* 팔 길이 (µm, 모식): 다사 염색체 / 중기 염색체 */
  const POLY = { X: 210, "2L": 225, "2R": 215, "3L": 235, "3R": 275, 4: 14 };
  const META = { X: 2.4, "2L": 2.3, "2R": 2.4, "3L": 2.5, "3R": 2.8, 4: 0.5 };
  const TICK = { poly: 2.5, meta: 1 };   // µm / 눈금
  /* 퍼프 위치(팔 끝에서부터의 비율): 3령 중기 = 접착 단백질 유전자(3C, 68C), 3령 말기 = 엑디손 초기 퍼프(2B, 74EF, 75B) */
  const PUFF = { mid: [["X", 0.13, "3C"], ["3L", 0.4, "68C"]], late: [["X", 0.07, "2B"], ["3L", 0.68, "74EF"], ["3L", 0.74, "75B"]] };
  const PROC = [
    "3령 애벌레를 받침유리의 생리 식염수 한 방울에 놓는다",
    "해부 현미경 아래에서 핀셋 하나로 몸 가운데를, 다른 하나로 입 갈고리 쪽을 잡고 천천히 당긴다",
    "머리 쪽에 딸려 나온 투명한 침샘 한 쌍을 찾고 붙어 있는 지방체를 떼어 낸다",
    "침샘을 아세트올세인 한 방울에 옮겨 10분쯤 고정·염색한다",
    "덮개 유리를 덮고 거름종이 위에서 엄지로 눌러 펼친다(압착)",
    "저배율로 핵을 찾은 뒤 400배로 관찰한다",
  ];
  const SHUF = [2, 4, 0, 5, 1, 3];
  let sample = "poly", arm = "X", age = "mid", picked = [];

  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "시료" }, { key: "a", label: "팔" }, { key: "d", label: "눈금 수", res: 0.5 }, { key: "u", label: "1눈금 (µm)", res: 0.1 }, { key: "l", label: "길이 (µm)", res: 0.1 }], () => drawPlot());
  const cv = fit($(".pt-view"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  /* 다사 염색체 팔의 경로 (µm 단위 좌표, 원점 = 염색 중심) */
  let rs = 21; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
  const PATH = {}, BANDS = {};
  const ANG = { X: -1.57, "2L": -0.31, "2R": 0.94, "3L": 2.2, "3R": 3.46, 4: -0.95 };
  ARMS.forEach((a) => {
    const n = Math.round(POLY[a] / 2), pts = [{ x: 0, y: 0 }];
    let th = ANG[a], x = 0, y = 0;
    const ph = rnd() * 6, amp = 0.25 + 0.15 * rnd();
    for (let i = 0; i < n; i++) {
      const r = Math.hypot(x, y), pos = Math.atan2(y, x);
      const want = r < 140 ? ANG[a] + amp * Math.sin(i * 0.11 + ph) : pos + Math.PI / 2 + 0.25 * Math.sin(i * 0.13 + ph) - (r - 150) * 0.01;
      let d = want - th; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      th += d * 0.12; x += Math.cos(th) * 2; y += Math.sin(th) * 2; pts.push({ x, y });
    }
    PATH[a] = pts;
    const b = []; let u = 3;
    while (u < POLY[a] - 1) { b.push({ u, w: 0.4 + rnd() * 1.6, d: 0.35 + rnd() * 0.6 }); u += 1.5 + rnd() * 4; }
    BANDS[a] = b;
  });

  function drawPoly(c, w) {
    const k = w / 450, cx = w / 2 + 10, cy = w / 2 + 5;   // 400배 시야 지름 약 450 µm
    const P = (p) => [cx + p.x * k, cy + p.y * k];
    const puffs = PUFF[age];
    ARMS.forEach((a) => {
      const pts = PATH[a], wid = (a === "4" ? 3.5 : 5) * k * 1.1;
      /* 몸통 */
      c.lineCap = "round"; c.lineJoin = "round";
      if (a === arm) { c.strokeStyle = "rgba(224,160,42,.55)"; c.lineWidth = wid * 2 + 6; c.beginPath(); pts.forEach((p, i) => { const [X, Y] = P(p); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); }
      c.strokeStyle = "rgba(196,120,155,.55)"; c.lineWidth = wid * 2; c.beginPath(); pts.forEach((p, i) => { const [X, Y] = P(p); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
      /* 퍼프 */
      if ($(".puff").checked) puffs.filter((q) => q[0] === a).forEach((q) => {
        const idx = Math.round((1 - q[1]) * (pts.length - 1)), [X, Y] = P(pts[idx]);
        c.fillStyle = "rgba(215,160,185,.85)"; c.beginPath(); c.ellipse(X, Y, wid * 2.2, wid * 2.2, 0, 0, 6.3); c.fill();
        c.fillStyle = C.ink; c.font = `10px ${F.mono}`; c.textAlign = "left"; c.fillText(q[2], X + wid * 2.6, Y + (q[0] === "X" ? wid * 4 : -wid * 1.6));
      });
      /* 띠 */
      BANDS[a].forEach((b) => {
        const t = b.u / POLY[a], idx = Math.min(pts.length - 2, Math.round(t * (pts.length - 1)));
        const p = pts[idx], q = pts[idx + 1], ang = Math.atan2(q.y - p.y, q.x - p.x), [X, Y] = P(p);
        const inPuff = $(".puff").checked && puffs.some((z) => z[0] === a && Math.abs((1 - z[1]) - t) < 0.025);
        c.strokeStyle = `rgba(110,25,65,${inPuff ? b.d * 0.25 : b.d})`; c.lineWidth = Math.max(0.8, b.w * k);
        c.beginPath(); c.moveTo(X - Math.sin(ang) * wid, Y + Math.cos(ang) * wid); c.lineTo(X + Math.sin(ang) * wid, Y - Math.cos(ang) * wid); c.stroke();
      });
      const e = pts[pts.length - 1], [EX, EY] = P(e);
      c.fillStyle = C.ink2; c.font = `600 11px ${F.sans}`; c.textAlign = "center"; c.fillText(a, EX + (e.x > 0 ? 12 : -12), EY + 4);
    });
    /* 염색 중심 */
    c.fillStyle = "rgba(120,35,80,.75)"; c.beginPath(); c.ellipse(cx, cy, 13 * k * 1.2, 10 * k * 1.2, 0.4, 0, 6.3); c.fill();
    c.fillStyle = C.ink2; c.font = `10px ${F.sans}`; c.textAlign = "left"; c.fillText("염색 중심", cx + 14, cy + 18);
    return k;
  }

  function drawMeta(c, w) {
    const k = w / 40, cx = w / 2, cy = w / 2;   // 시야 가운데 40 µm를 크게
    c.fillStyle = "rgba(230,200,215,.5)"; c.beginPath(); c.arc(cx, cy, 15 * k, 0, 6.3); c.fill();
    const chromatid = (x, y, len, ang, wd, hl) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      if (hl) { c.strokeStyle = "rgba(224,160,42,.7)"; c.lineWidth = wd * 3.4; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 0); c.lineTo(len, 0); c.stroke(); }
      c.strokeStyle = "rgba(110,25,65,.9)"; c.lineWidth = wd; c.lineCap = "round";
      c.beginPath(); c.moveTo(0, -wd * 0.55); c.lineTo(len, -wd * 0.55); c.moveTo(0, wd * 0.55); c.lineTo(len, wd * 0.55); c.stroke();
      c.restore();
    };
    const wd = 0.42 * k;
    /* 2번, 3번: 중부 동원체 V자, X: 막대, 4번: 점. 암컷(XX) */
    const set = [
      { x: -8, y: -6, parts: [["2L", -2.4], ["2R", -0.5]] }, { x: 6, y: -9, parts: [["2L", 2.0], ["2R", 0.3]] },
      { x: -9, y: 5, parts: [["3L", 2.8], ["3R", -2.6 + 3.14]] }, { x: 5, y: 4, parts: [["3L", -1.2], ["3R", 1.0]] },
      { x: -2, y: -1, parts: [["X", 0.6]] }, { x: 10, y: -1, parts: [["X", 2.2]] },
      { x: 0, y: 9, parts: [["4", 0]] }, { x: 2, y: 10.5, parts: [["4", 0]] },
    ];
    set.forEach((ch) => {
      const X = cx + ch.x * k, Y = cy + ch.y * k;
      ch.parts.forEach(([a, ang]) => chromatid(X, Y, META[a] * k, ang, wd, a === arm));
      c.fillStyle = "rgba(90,20,55,1)"; c.beginPath(); c.arc(X, Y, wd * 0.9, 0, 6.3); c.fill();
    });
    return k;
  }

  function draw() {
    const { ctx: c, size } = cv, { w } = size; if (!w) return;
    c.clearRect(0, 0, w, w);
    c.fillStyle = C.night; c.fillRect(0, 0, w, w);
    const R = w / 2 - 4;
    c.save(); c.beginPath(); c.arc(w / 2, w / 2, R, 0, 6.3); c.clip();
    c.fillStyle = "#f5eef1"; c.fillRect(0, 0, w, w);
    const k = sample === "poly" ? drawPoly(c, w) : drawMeta(c, w);
    /* 접안 마이크로미터 (눈금은 화면에 고정, 1눈금 = TICK µm) */
    const step = TICK[sample] * k, n = sample === "poly" ? 40 : 10, x0 = w * 0.18, y0 = w * 0.88;
    c.strokeStyle = "rgba(20,20,20,.8)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + n * step, y0); c.stroke();
    for (let i = 0; i <= n; i++) { const tl = i % 10 === 0 ? 9 : i % 5 === 0 ? 6 : 3; c.beginPath(); c.moveTo(x0 + i * step, y0); c.lineTo(x0 + i * step, y0 - tl); c.stroke(); }
    c.fillStyle = "rgba(20,20,20,.85)"; c.font = `10px ${F.mono}`; c.textAlign = "center";
    for (let i = 0; i <= n; i += sample === "poly" ? 10 : 5) c.fillText(String(i), x0 + i * step, y0 - 11);
    const vg = c.createRadialGradient(w / 2, w / 2, R * 0.6, w / 2, w / 2, R); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.25)"); c.fillStyle = vg; c.fillRect(0, 0, w, w);
    c.restore();
    c.fillStyle = "#ddd"; c.font = `11px ${F.mono}`; c.textAlign = "left";
    c.fillText(sample === "poly" ? "×400 침샘 핵" : "×1000 (가운데 확대)", 8, 16);
    c.textAlign = "right"; c.fillText(`1눈금 = ${TICK[sample]} µm`, w - 8, 16);
    if (sample === "poly") c.fillText(age === "mid" ? "3령 중기" : "3령 말기", w - 8, w - 10);
  }

  function measure() {
    const truth = (sample === "poly" ? POLY[arm] : META[arm]) / TICK[sample];
    const d = Math.max(0.5, L.measure(truth, sample === "poly" ? { sd: 1.5 + 0.02 * truth, res: 0.5 } : { sd: 0.25, res: 0.5 }));
    tbl.add({ s: sample === "poly" ? "침샘" : "중기", a: arm, d, u: TICK[sample], l: d * TICK[sample] });
  }

  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 24, w: w - 60, h: h - 62 };
    const lo = -1, hi = 3;   // log10 µm
    const Y = (v) => box.y0 + box.h - (Math.log10(v) - lo) / (hi - lo) * box.h;
    NM.axes(c, { ...box, X: (v) => v, Y, xt: [], yt: [0.1, 1, 10, 100, 1000].map((v) => [v, String(v)]), ylabel: "팔 길이 (µm, 로그 눈금)" });
    const bw = box.w / ARMS.length;
    ARMS.forEach((a, i) => {
      const P = L.stats(tbl.rows.filter((r) => r.s === "침샘" && r.a === a).map((r) => r.l));
      const M = L.stats(tbl.rows.filter((r) => r.s === "중기" && r.a === a).map((r) => r.l));
      const x = box.x0 + i * bw;
      [[P, C.forest, 0.14], [M, C.amber, 0.5]].forEach(([S, col, off]) => {
        if (!S.n) return;
        c.fillStyle = col; const yv = Y(Math.max(0.1, S.mean)); c.fillRect(x + bw * off, yv, bw * 0.34, box.y0 + box.h - yv);
      });
      c.fillStyle = C.ink; c.font = `600 12px ${F.sans}`; c.textAlign = "center"; c.fillText(a, x + bw / 2, box.y0 + box.h + 15);
      if (P.n && M.n) { c.font = `10.5px ${F.mono}`; c.fillStyle = C.ink2; c.fillText(`×${Math.round(P.mean / M.mean)}`, x + bw / 2, box.y0 + box.h + 29); }
    });
    c.font = `11px ${F.sans}`; c.textAlign = "right";
    c.fillStyle = C.forest; c.fillText("■ 침샘 염색체", w - 104, 13);
    c.fillStyle = C.amber; c.fillText("■ 중기 염색체", w - 14, 13);
  }

  /* 절차 맞추기 */
  function procUI() {
    $(".pt-steps").innerHTML = picked.length === PROC.length ? "" : SHUF.map((i) => `<button class="chip" type="button" data-p="${i}"${picked.includes(i) ? " disabled" : ""}>${PROC[i]}</button>`).join("");
    $(".pt-done").innerHTML = picked.map((i) => `<li>${PROC[i]}</li>`).join("");
  }
  $(".pt-steps").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b || b.disabled) return;
    const i = +b.dataset.p;
    if (i !== picked.length) { $(".pt-pmsg").textContent = picked.length === 0 ? "먼저 애벌레를 식염수에 놓아야 마르지 않고 해부할 수 있습니다." : `그 전에 할 일이 있습니다. ${["", "침샘을 꺼내려면 먼저 머리 쪽을 당겨 떼어야 합니다.", "염색 전에 침샘을 찾고 지방체를 떼어야 지방체가 염색체를 가리지 않습니다.", "압착 전에 고정·염색을 해야 염색체가 보입니다.", "덮개 유리를 덮고 눌러야 핵이 터지며 염색체가 펼쳐집니다.", ""][picked.length]}`; return; }
    picked.push(i); $(".pt-pmsg").textContent = picked.length === PROC.length ? "순서가 맞습니다. 아래 시야에서 염색체를 관찰하세요." : ""; procUI();
  });

  const chips = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return; set(b.getAttribute(attr));
    $(sel).querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  chips(".pt-sample", "data-s", (v) => (sample = v));
  chips(".pt-arm", "data-a", (v) => (arm = v));
  chips(".pt-age", "data-g", (v) => (age = v));
  $(".puff").addEventListener("change", draw);
  $(".pt-meas").addEventListener("click", measure);
  $(".pt-clear").addEventListener("click", () => tbl.clear());
  procUI();

  if (L.demo) {
    picked = [0, 1, 2, 3, 4, 5]; procUI(); $(".pt-pmsg").textContent = "순서가 맞습니다. 아래 시야에서 염색체를 관찰하세요.";
    ["X", "2L", "2R", "3L", "3R", "4"].forEach((a) => { arm = a; sample = "poly"; measure(); measure(); sample = "meta"; measure(); measure(); });
    sample = "poly"; arm = "3L"; age = "late";
    root.querySelector('[data-a="3L"]').click(); root.querySelector('[data-g="late"]').click();
    drawPlot();
  }
})();
