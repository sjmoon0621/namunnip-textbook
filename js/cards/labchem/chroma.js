/* 카드: 초록 잎 한 점은 왜 여러 색의 띠로 갈라질까? — 종이 크로마토그래피 (Rf 대략값 모형) */
(() => {
  const root = document.getElementById("card-labchem-chroma");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 성분: x0에서의 Rf와, 극성 용매 비율 x에 따른 민감도 b. k = (1/Rf0 − 1)·exp(−b(x − x0)), Rf = 1/(1 + k) */
  const SMP = {
    leaf: {
      xname: "전개 용매: 헥세인에 섞은 아세톤", x0: 0.1, short: "잎",
      cs: [
        { n: "카로틴", rf: 0.95, b: 2, col: "#e8892a" },
        { n: "잔토필", rf: 0.70, b: 8, col: "#e3c320" },
        { n: "엽록소 a", rf: 0.55, b: 8, col: "#2f8f6f" },
        { n: "엽록소 b", rf: 0.40, b: 9, col: "#8fae3a" },
      ],
    },
    ink: {
      xname: "전개 용매: 물에 섞은 에탄올", x0: 0, short: "사인펜",
      cs: [
        { n: "파랑", rf: 0.90, b: -3, col: "#2f5fc4" },
        { n: "노랑", rf: 0.70, b: -1, col: "#e0b81a" },
        { n: "자홍", rf: 0.40, b: 2, col: "#c4307a" },
      ],
    },
  };
  let sk = "leaf", run = null, t = 0, last = null;
  const sX = $(".x");
  const rfOf = (c, x, s) => 1 / (1 + (1 / c.rf - 1) * Math.exp(-c.b * (x - s.x0)));
  const FRONT = 80;   /* mm, 전개 끝 용매 이동 거리 */

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "시료" }, { key: "x", label: "극성 용매(%)", res: 1 }, { key: "f", label: "용매(mm)", res: 1 },
    { key: "c", label: "성분" }, { key: "d", label: "거리(mm)", res: 1 }, { key: "rf", label: "Rf", res: 0.01 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SMP[sk], x = +sX.value / 100, lid = $(".lid").checked, low = $(".low").checked, big = $(".big").checked;
    /* 전개 용기 */
    const jx = w * 0.12, jw = w * 0.3, jy = 22, jh = h - 34;
    const mm = (jh - 26) / 105;   /* 1 mm 당 픽셀 */
    const base = jy + jh - 4, pool = 8 * mm, origin = base - 15 * mm;
    ctx.fillStyle = "rgba(200,210,225,.35)"; ctx.fillRect(jx + 2, base - pool, jw - 4, pool);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(jx, jy + jh); ctx.lineTo(jx + jw, jy + jh); ctx.lineTo(jx + jw, jy); ctx.stroke();
    if (lid) { ctx.fillStyle = C.ink2; ctx.fillRect(jx - 6, jy - 8, jw + 12, 6); }
    /* 거름종이 띠 */
    const px = jx + jw * 0.3, pw = jw * 0.4, ptop = jy + 6;
    ctx.fillStyle = "#fdfdf9"; ctx.fillRect(px, ptop, pw, base - ptop - 1); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(px, ptop, pw, base - ptop - 1);
    const prog = run ? Math.min(1, Math.sqrt(run.el / run.dur)) : last ? 1 : 0;
    const front = (last || run) ? FRONT * prog * (run ? run.r.fk : last.fk) : 0;
    const fy = origin - front * mm;
    if (front > 0) { ctx.fillStyle = "rgba(200,210,225,.25)"; ctx.fillRect(px + 1, fy, pw - 2, base - fy - 1); ctx.strokeStyle = "rgba(93,93,97,.6)"; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(px, fy); ctx.lineTo(px + pw, fy); ctx.stroke(); ctx.setLineDash([]); }
    /* 출발선 (연필) */
    ctx.strokeStyle = "#999"; ctx.beginPath(); ctx.moveTo(px + 3, origin); ctx.lineTo(px + pw - 3, origin); ctx.stroke();
    const st = run ? run.r : last;
    const cx = px + pw / 2;
    if (st && !st.lost) {
      st.cs.forEach((c) => {
        const d = c.rfT * front, y = origin - d * mm, sg = (big ? 3.2 : 1.6) + 0.035 * d;
        ctx.fillStyle = c.col; ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.ellipse(cx, y, pw * 0.32, Math.max(1.5, sg * mm), 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    } else if (!st) {
      ctx.fillStyle = sk === "leaf" ? "#3b6e2a" : "#2a2a2a"; ctx.beginPath(); ctx.arc(cx, low ? base - 3 : origin, big ? 6 : 3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "rgba(59,110,42,.25)"; ctx.fillRect(jx + 2, base - pool, jw - 4, pool);
    }
    /* 자 */
    const rx = jx + jw + 14;
    ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.beginPath(); ctx.moveTo(rx, origin); ctx.lineTo(rx, origin - 90 * mm); ctx.stroke();
    for (let k = 0; k <= 90; k += 5) {
      const y = origin - k * mm; ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + (k % 10 ? 4 : 8), y); ctx.stroke();
      if (k % 20 === 0) ctx.fillText(`${k}`, rx + 11, y + 3);
    }
    ctx.fillText("mm", rx + 11, origin - 92 * mm);
    /* 오른쪽 범례 */
    const lx = w * 0.62;
    ctx.font = `11px ${F.sans}`;
    ctx.fillStyle = C.ink2; ctx.fillText(sk === "leaf" ? "시금치 잎 추출액" : "검은 수성 사인펜", lx, 34);
    s.cs.forEach((c, i) => {
      const y = 56 + i * 20;
      ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(lx + 7, y - 4, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(c.n, lx + 20, y);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    const yb = 56 + s.cs.length * 20 + 10;
    ctx.fillText(run ? "전개 중…" : last ? `용매 끝 ${(front).toFixed(0)} mm` : "출발선에 시료를 찍은 상태", lx, yb);
    ctx.fillText(`${s.xname.replace("전개 용매: ", "")} ${sX.value}%`, lx, yb + 16);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SMP[sk], box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const rows = tbl.rows.filter((r) => r.s === s.short && Number.isFinite(r.rf));
    const res = L.plot(ctx, box, { pts: [], xr: [0, 60], yr: [0, 1], xlabel: "극성 용매 비율 (%)", ylabel: "Rf" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    s.cs.forEach((c) => {
      ctx.strokeStyle = c.col; ctx.lineWidth = 1; ctx.globalAlpha = 0.6; ctx.beginPath();
      for (let p = 0; p <= 60; p += 1) { const X = res.X(p), Y = res.Y(rfOf(c, p / 100, s)); p ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = c.col;
      rows.filter((r) => r.c === c.n).forEach((r) => { ctx.beginPath(); ctx.arc(res.X(r.x), res.Y(r.rf), 3.6, 0, Math.PI * 2); ctx.fill(); });
    });
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    s.cs.forEach((c, i) => { ctx.fillStyle = c.col; ctx.fillText("● " + c.n, box.x0 + box.w - 74, box.y0 + box.h - 10 - (s.cs.length - 1 - i) * 15); });
  }

  function develop() {
    const s = SMP[sk], x = +sX.value / 100, lid = $(".lid").checked, low = $(".low").checked, big = $(".big").checked;
    const fk = lid ? 1 : 0.92;   /* 뚜껑이 없으면 용매가 덜 올라감(증발) */
    const cs = s.cs.map((c) => {
      let rfT = rfOf(c, x, s);
      if (!lid) rfT *= 0.9 + 0.06 * L.gauss();
      return { ...c, rfT: clamp(rfT, 0.01, 0.99) };
    });
    return { cs, fk, lost: low, x: +sX.value, big, sk };
  }
  function record(r) {
    const s = SMP[r.sk], f = L.measure(FRONT * r.fk, { sd: 0.7, res: 1 });
    if (r.lost) { tbl.add({ s: s.short, x: r.x, f, c: "점 없음", d: "—", rf: "—" }); return; }
    r.cs.forEach((c) => {
      const d = Math.max(0, L.measure(c.rfT * FRONT * r.fk, { sd: r.big ? 2.2 : 0.9, res: 1 }));
      tbl.add({ s: s.short, x: r.x, f, c: c.n, d, rf: d / f });
    });
  }
  function msg() {
    const m = [];
    if ($(".low").checked) m.push("점이 용매에 잠기면 시료가 용매 속으로 녹아 나갑니다.");
    if (!$(".lid").checked) m.push("뚜껑이 없으면 종이에서 용매가 증발합니다.");
    if ($(".big").checked) m.push("점이 크면 띠가 넓어져 겹칩니다.");
    $(".cr-msg").textContent = m.join(" ");
  }
  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (run) { run.el += dt; if (run.el >= run.dur + 0.3) { record(run.r); last = run.r; run = null; } }
    draw();
  });
  sX.addEventListener("input", () => { if (run) return; $(".x-out").textContent = sX.value; last = null; draw(); });
  [".lid", ".low", ".big"].forEach((c) => $(c).addEventListener("change", () => { last = null; msg(); draw(); }));
  $(".smp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || run) return;
    sk = b.dataset.s; root.querySelectorAll("[data-s]").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    $(".x-name").textContent = SMP[sk].xname; last = null; draw(); drawPlot();
  });
  $(".meas").addEventListener("click", () => { if (!run) { last = null; run = { r: develop(), el: 0, dur: 3 }; } });
  $(".clear").addEventListener("click", () => { run = null; last = null; tbl.clear(); });
  msg();
  if (L.demo) {
    [0, 10, 20, 40].forEach((v) => { sX.value = v; record(develop()); });
    sX.value = 10; $(".x-out").textContent = "10"; last = develop();
    drawPlot();
  }
})();
