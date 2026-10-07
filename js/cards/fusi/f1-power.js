/* 카드: 스마트 플러그는 몇 초마다 재야 하루 전력량을 맞힐까? — 하루 전력 모식 모형과 표본화 간격 */
(() => {
  const root = document.getElementById("card-fusi-power");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sI = $(".iv");
  const DAY = 86400;
  const IV = [1, 10, 60, 300, 900, 1800, 3600], IVN = ["1 초", "10 초", "1 분", "5 분", "15 분", "30 분", "1 시간"];

  /* 고정된 의사 난수 (매번 같은 하루) */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const H = (h, m = 0) => Math.round((h * 60 + m) * 60);

  /* 가전별 하루 전력 (W, 1초 단위) — 모식 */
  const APP = {
    fridge: { nm: "냉장고", rated: 150, hours: 24, make(p) {
      seed = 11; let t = 0;
      while (t < DAY) {
        const on = (13 + 4 * rnd()) * 60, off = (22 + 6 * rnd()) * 60;
        for (let i = 0; i < on && t < DAY; i++, t++) p[t] = 118 + 6 * Math.sin(i / 90);
        for (let i = 0; i < off && t < DAY; i++, t++) p[t] = 3;
      }
      for (let t2 = H(4); t2 < H(4, 20); t2++) p[t2] = 210;   /* 하루 한 번 성에 제거 히터 */
    } },
    micro: { nm: "전자레인지", rated: 1100, hours: 0.15, make(p) {
      p.fill(2);
      [[H(7, 40), 150], [H(12, 20), 210], [H(19, 5), 180]].forEach(([s, d]) => { for (let t = s; t < s + d; t++) p[t] = 1150; });
    } },
    rice: { nm: "전기밥솥", rated: 1000, hours: 0.7, make(p) {
      p.fill(1.5);
      const s = H(6, 30);
      for (let t = s; t < s + 40 * 60; t++) p[t] = ((t - s) % 60) < 45 ? 1000 : 60;   /* 취사: 히터를 켰다 껐다 */
      for (let t = s + 40 * 60; t < H(18); t++) p[t] = ((t - s) % 420) < 120 ? 130 : 6;   /* 보온 */
    } },
    tv: { nm: "텔레비전", rated: 110, hours: 3.5, make(p) {
      p.fill(0.5);
      [[H(7), 30 * 60], [H(19, 30), 3 * 3600]].forEach(([s, d]) => { for (let t = s; t < s + d; t++) p[t] = 95 + 15 * Math.sin(t / 37) * Math.sin(t / 211); });
    } },
  };
  const cache = {};
  const prof = (k) => cache[k] || (cache[k] = (() => { const p = new Float32Array(DAY); APP[k].make(p); return p; })());

  let ak = "fridge", phase = 0;
  const view = fit($("canvas"), () => draw());

  /* 측정 간격 iv가 하루를 나누어떨어지므로, 마지막 측정값이 다음 날 첫 측정 전까지 이어진다고 보면 정확히 하루를 덮는다 */
  function sampled(p, iv, ph) {
    const pts = []; let e = 0;
    for (let t = ph % iv; t < DAY; t += iv) { const v = p[t]; pts.push([t, v]); e += v * iv; }
    return { pts, e: e / 3.6e6 };
  }

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = prof(ak), a = APP[ak], iv = IV[+sI.value];
    let top = 0; for (let i = 0; i < DAY; i++) if (p[i] > top) top = p[i];
    top = top * 1.12;
    const box = { x0: 44, y0: 18, w: w - 54, h: h - 50 };
    const X = (t) => box.x0 + t / DAY * box.w, Y = (v) => box.y0 + box.h - v / top * box.h;
    const yt = NMLabTicks(top).map((v) => [v, String(v)]);
    axes(ctx, { ...box, X, Y, xt: [0, 6, 12, 18, 24].map((hh) => [hh * 3600, hh + "시"]), yt, xlabel: "시각", ylabel: "전력 (W)" });
    /* 참 전력: 화면 한 칸마다 최소·최대 */
    const cols = Math.floor(box.w), per = DAY / cols;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
    for (let c = 0; c < cols; c++) {
      let lo = Infinity, hi = -Infinity;
      for (let t = Math.floor(c * per); t < Math.floor((c + 1) * per); t++) { const v = p[t]; if (v < lo) lo = v; if (v > hi) hi = v; }
      const x = box.x0 + c + 0.5; ctx.moveTo(x, Y(lo)); ctx.lineTo(x, Y(hi) - 0.5);
    }
    ctx.stroke();
    /* 플러그의 측정값 (계단) */
    const s = sampled(p, iv, phase);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.beginPath();
    s.pts.forEach(([t, v], i) => { const x = X(t), x2 = X(Math.min(DAY, t + iv)); if (i === 0) ctx.moveTo(X(0), Y(v)); ctx.lineTo(x, Y(v)); ctx.lineTo(x2, Y(v)); });
    ctx.stroke();
    if (iv >= 300) { ctx.fillStyle = C.warn; s.pts.forEach(([t, v]) => { ctx.beginPath(); ctx.arc(X(t), Y(v), 2.2, 0, Math.PI * 2); ctx.fill(); }); }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText("─ 실제 전력", box.x0 + box.w, box.y0 - 6);
    ctx.fillStyle = C.warn; ctx.fillText(`─ ${IVN[+sI.value]}마다 잰 값`, box.x0 + box.w - 74, box.y0 - 6);
    /* 수치 */
    let et = 0; for (let i = 0; i < DAY; i++) et += p[i];
    et /= 3.6e6;
    const err = (s.e - et) / et * 100;
    $(".e-true").textContent = et.toFixed(3) + " kWh";
    $(".e-meas").textContent = `${s.e.toFixed(3)} kWh (${err >= 0 ? "+" : ""}${err.toFixed(0)} %)`;
    $(".e-meas").className = "e-meas " + (Math.abs(err) > 10 ? "bad" : "good");
    $(".e-rate").textContent = `${(a.rated * a.hours / 1000).toFixed(2)} kWh`;
    $(".e-rate").title = `정격 ${a.rated} W × ${a.hours} 시간`;
  }
  function NMLabTicks(top) {
    const raw = top / 4, mag = 10 ** Math.floor(Math.log10(raw)), st = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= raw), out = [];
    for (let v = 0; v <= top; v += st) out.push(+v.toPrecision(6));
    return out;
  }

  $(".asel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    ak = b.dataset.a; root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  sI.addEventListener("input", () => { $(".i-out").textContent = IVN[+sI.value]; draw(); });
  $(".shift").addEventListener("click", () => { phase = Math.floor(Math.random() * 3600); draw(); });
  if (/[?&]demo\b/.test(location.search)) { ak = "micro"; root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.a === ak))); sI.value = 4; $(".i-out").textContent = IVN[4]; phase = 500; }
  draw();
})();
