/* 카드: 시계 없이 낙하 법칙을 찾을 수 있을까? — 갈릴레이 빗면 + 물시계, d–t / d–t² 그래프 */
(() => {
  const root = document.getElementById("card-sie1-galileo");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sTh = $(".th"), sD = $(".d"), oTh = $(".th-out"), oD = $(".d-out");
  const FLOW = 25, LEN = 4.2;   // 물시계 g/s, 빗면 길이 m
  const acc = () => (5 / 7) * 9.8 * Math.sin(+sTh.value * Math.PI / 180);
  let useT2 = false, anim = null, queue = [];

  const tbl = L.table($(".tbl-host"), [
    { key: "d", label: "d (m)", res: 0.1 }, { key: "m", label: "물 (g)", res: 0.1 },
    { key: "t", label: "t (s)", res: 0.01 }, { key: "t2", label: "t² (s²)", res: 0.01 },
  ], () => plotDraw());

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => plotDraw());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +sTh.value * Math.PI / 180, vis = Math.min(th * 3.2, 0.5);   // 화면에서는 기울기를 과장해 그림
    const x0 = 24, y0 = h * 0.4, len = w * 0.7;
    const X = (s) => x0 + s / LEN * len * Math.cos(vis), Y = (s) => y0 + s / LEN * len * Math.sin(vis);
    ctx.fillStyle = "#e6d3b3"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(LEN), Y(LEN)); ctx.lineTo(X(LEN), Y(0) + len * Math.sin(vis) + 14); ctx.lineTo(X(0), Y(LEN) + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 거리 눈금
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let s = 1; s <= 4; s += 1) { ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(s), Y(s)); ctx.lineTo(X(s), Y(s) + 6); ctx.stroke(); ctx.fillText(s + " m", X(s), Y(s) + 17); }
    const d = +sD.value;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(d), Y(d) - 22); ctx.lineTo(X(d), Y(d)); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.fillText("멈춤 표시", X(d), Y(d) - 26);
    // 공
    const s = anim ? Math.min(anim.d, 0.5 * acc() * anim.t * anim.t) : 0;
    const r = 7;
    ctx.fillStyle = "#b07a2a"; ctx.beginPath(); ctx.arc(X(s) + r * Math.sin(vis), Y(s) - r * Math.cos(vis), r, 0, Math.PI * 2); ctx.fill();
    // 물시계
    const bx = w - 70, by = 16;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.fillStyle = "rgba(110,164,230,.35)";
    ctx.fillRect(bx, by + 8, 46, 40); ctx.strokeRect(bx, by, 46, 48);
    const flowing = anim && s < anim.d;
    if (flowing) { ctx.strokeStyle = "#6ea4e6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 23, by + 48); ctx.lineTo(bx + 23, h - 40); ctx.stroke(); }
    const mass = anim ? Math.min(anim.t, anim.tt) * FLOW : 0;
    const cupH = 30, fill = Math.min(1, mass / 220);
    ctx.fillStyle = "rgba(110,164,230,.55)"; ctx.fillRect(bx + 6, h - 12 - cupH * fill, 34, cupH * fill);
    ctx.strokeStyle = C.ink2; ctx.strokeRect(bx + 6, h - 12 - cupH, 34, cupH);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("물시계", bx + 23, by - 4);
    ctx.fillText(anim ? `${mass.toFixed(1)} g` : "0 g", bx + 23, h - 46);
  }

  function plotDraw() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xs = tbl.col(useT2 ? "t2" : "t"), ds = tbl.col("d");
    const pts = xs.map((x, i) => ({ x, y: ds[i] }));
    const f = useT2 ? L.linfit(xs, ds, true) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: f, xlabel: useT2 ? "t² (s²)" : "t (s)", ylabel: "d (m)", yr: [0, 4.4] });
    $(".n-k").textContent = f ? `${f.a.toFixed(3)}±${f.sa.toFixed(3)}` : "—";
    $(".n-a").textContent = f ? `${(2 * f.a).toFixed(3)} m/s²` : useT2 || !tbl.rows.length ? "—" : "t²으로 보면 나옴";
    $(".n-r").textContent = f ? f.r2.toFixed(4) : "—";
  }

  function roll(d) {
    const a = acc(), tt = Math.sqrt(2 * d / a);
    const tm = tt + 0.05 * L.gauss();                       // 손으로 마개를 여닫는 오차
    const m = L.snap(tm * FLOW, 0.5);                       // 저울 눈금 0.5 g
    anim = { d, t: 0, tt, rec: { d, m, t: m / FLOW, t2: (m / FLOW) ** 2 } };
  }
  function next() { if (!anim && queue.length) { sD.value = queue[0]; update(); roll(queue.shift()); anim.fast = true; } }

  loop($(".cv-wide"), (dt) => {
    if (anim) {
      anim.t += dt * (queue.length || anim.fast ? 5 : 1.5);   // 연속 측정은 빨리 감기
      if (anim.t > anim.tt + 0.3) { tbl.add(anim.rec); anim = null; next(); }
    }
    drawApp();
  });
  function update() { oTh.textContent = (+sTh.value).toFixed(1); oD.textContent = (+sD.value).toFixed(1); drawApp(); }
  sD.addEventListener("input", update);
  sTh.addEventListener("input", () => { update(); if (tbl.rows.length) tbl.clear(); });
  $(".roll").addEventListener("click", () => { if (!anim) roll(+sD.value); });
  $(".auto").addEventListener("click", () => { if (anim || queue.length) return; queue = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]; next(); });
  $(".clear").addEventListener("click", () => { queue = []; anim = null; tbl.clear(); });
  $(".axis").addEventListener("click", (e) => { useT2 = !useT2; e.currentTarget.setAttribute("aria-pressed", String(useT2)); plotDraw(); });
  update();
  if (L.demo) { [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].forEach((d) => { roll(d); tbl.add(anim.rec); }); anim = null; $(".axis").click(); }
})();
