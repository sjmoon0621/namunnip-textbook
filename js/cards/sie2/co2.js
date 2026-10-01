/* 카드: 답답한 교실 공기를 숫자로 보여 주면 무엇이 달라질까? — 교실 CO₂ 상자 모형, 실시간 센서, 표시등 */
(() => {
  const root = document.getElementById("card-sie2-co2");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n"), brk = $(".brk"), alarm = $(".alarm");
  const V = 180, OUT = 420, Q = 0.018, T0 = 9 * 60, T1 = 15 * 60;   // m³, ppm, m³/h·명, 분
  let vent = 0.6, day = null, last = [];
  const tbl = L.table($(".tbl-host"), [{ key: "cond", label: "조건" }, { key: "over", label: "1000 넘음 (분)", res: 1 }, { key: "max", label: "최고 (ppm)", res: 1 }]);
  const { ctx, size } = fit($(".cv-wide"), () => draw());

  // 분 단위 시간표: 50분 수업 + 10분 쉬는 시간, 12~13시 점심(빈 교실)
  const lesson = (m) => { if (m >= 720 && m < 780) return "lunch"; return (m - T0) % 60 < 50 ? "class" : "break"; };
  function step(s, m) {
    const ph = lesson(m), n = ph === "lunch" ? 0 : +sN.value;
    let ach = vent;
    if (ph !== "class") ach = brk.checked || ph === "lunch" ? 9 : vent;
    if (ph === "class" && alarm.checked && s.win > 0) ach = Math.max(ach, 9);
    if (alarm.checked && s.read > 1000) s.win = 5;                          // 표시등이 빨강이면 5분 동안 창문 활짝
    s.win = Math.max(0, s.win - 1);
    s.c += (n * Q * 1e6 / V - ach * (s.c - OUT)) / 60;                      // ppm/분
    s.read = L.measure(s.c, { sd: 30, rel: 0.03, res: 1 });
    s.pts.push([m, s.read]);
    if (s.read > 1000) s.over++;
    s.max = Math.max(s.max, s.read);
  }
  function cond() { return `${sN.value}명 · ${$(".vent [aria-pressed=true]").textContent}${brk.checked ? " · 쉬는 시간 환기" : ""}${alarm.checked ? " · 표시등" : ""}`; }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 44, gy = 16, gw = w - gx - 86, gh = h - 48;
    const top = Math.max(3000, ...[...last, ...(day ? day.pts : [])].map((p) => p[1] + 200));
    const X = (m) => gx + (m - T0) / (T1 - T0) * gw, Y = (c) => gy + gh - (c - 300) / (top - 300) * gh;
    for (let m = T0; m < T1; m += 60) { const ph = lesson(m + 1); ctx.fillStyle = ph === "lunch" ? "rgba(141,141,146,.12)" : "rgba(116,171,102,.06)"; ctx.fillRect(X(m), gy, X(m + (ph === "lunch" ? 60 : 50)) - X(m), gh); }
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [9, 10, 11, 12, 13, 14, 15].map((t) => [t * 60, t + "시"]), yt: L.ticks(500, top - 100, 5).map((c) => [c, String(c)]), ylabel: "CO₂ (ppm)" });
    ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.fillRect(gx, gy, gw, Y(1000) - gy);
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(1000)); ctx.lineTo(gx + gw, Y(1000)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("학교보건법 기준 1000 ppm", gx + 4, Y(1000) - 4);
    const line = (pts, col, wd) => { ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); pts.forEach(([m, c], i) => (i ? ctx.lineTo(X(m), Y(c)) : ctx.moveTo(X(m), Y(c)))); ctx.stroke(); ctx.restore(); };
    if (last.length) line(last, "rgba(141,141,146,.6)", 1.2);
    if (day) line(day.pts, C.forest, 1.6);
    // 표시등
    const c = day ? day.read : OUT, lx = w - 44, ly = gy + 20;
    ctx.fillStyle = "#2b2b30"; ctx.fillRect(lx - 22, ly - 14, 44, 112);
    [[1000, "#ff5f57"], [800, "#e0b400"], [0, "#5fd16f"]].forEach(([th, col], i) => {
      const on = c > th && (i === 0 || c <= [Infinity, 1000, 800][i]);
      ctx.fillStyle = on ? col : "#4a4a50"; ctx.beginPath(); ctx.arc(lx, ly + 8 + i * 32, 11, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("문 앞 표시등", lx, ly + 112);
    if (day) { const m = day.m; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.fillText(`${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`, lx, ly + 128); }
  }
  function show() {
    if (!day) return;
    $(".n-c").textContent = `${day.read} ppm`; $(".n-c").className = "n-c " + (day.read > 1000 ? "bad" : "good");
    $(".n-o").textContent = `${day.over}분`; $(".n-m").textContent = `${day.max} ppm`;
  }
  function start() { if (day && day.pts.length) last = day.pts; day = { m: T0, c: OUT, read: OUT, win: 0, over: 0, max: 0, pts: [], acc: 0, cond: cond() }; }
  function finish() { tbl.add({ cond: day.cond, over: day.over, max: day.max }); day.done = true; }
  loop($(".cv-wide"), (dt) => {
    if (day && !day.done) {
      day.acc += dt * 14;                                                       // 1초에 14분
      while (day.acc >= 1 && day.m < T1) { step(day, day.m); day.m++; day.acc--; }
      if (day.m >= T1) finish();
      show();
    }
    draw();
  });
  sN.addEventListener("input", () => { $(".n-out").textContent = sN.value; });
  $(".vent").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; vent = +b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".run").addEventListener("click", start);
  $(".clear").addEventListener("click", () => { tbl.clear(); last = []; draw(); });
  draw();
  if (L.demo) {
    brk.checked = false; start(); while (day.m < T1) { step(day, day.m); day.m++; } finish();
    brk.checked = true; start(); while (day.m < T1) { step(day, day.m); day.m++; } finish();
    alarm.checked = true; start(); while (day.m < T1) { step(day, day.m); day.m++; } finish(); show();
  }
})();
