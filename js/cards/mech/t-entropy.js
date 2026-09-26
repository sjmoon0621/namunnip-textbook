/* 카드: 퍼진 기체는 왜 저절로 다시 모이지 않을까? — 칸막이를 치운 상자의 입자, 왼쪽 입자 수의 경우의 수(이항 분포)와 엔트로피 */
(() => {
  const root = document.getElementById("card-mech-entropy");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nLeft = $(".n-left"), nW = $(".n-w"), nP = $(".n-p");
  let N = 10, parts = [], seed = 3, hist = [];
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function gather() { parts = Array.from({ length: N }, () => ({ x: rnd() * 0.48, y: rnd(), a: rnd() * Math.PI * 2 })); hist = []; }
  // log10 C(N,k)
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log10(i); return s; };
  const logC = (n, k) => lf(n) - lf(k) - lf(n - k);
  const fmt = (lg) => lg < 6 ? `${Math.round(10 ** lg).toLocaleString("ko-KR")}` : `약 10^${Math.round(lg)}`;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bw = w * 0.46, bh = h - 40, bx = 10, by = 20;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + bw / 2, by); ctx.lineTo(bx + bw / 2, by + bh); ctx.stroke(); ctx.setLineDash([]);
    const r = N > 60 ? 2.2 : 4;
    parts.forEach((p) => { ctx.fillStyle = p.x < 0.5 ? "#b5532f" : "#3f6fa3"; ctx.beginPath(); ctx.arc(bx + 4 + p.x * (bw - 8), by + 4 + p.y * (bh - 8), r, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("왼쪽", bx + bw / 4, by + bh + 14); ctx.fillText("오른쪽", bx + bw * 3 / 4, by + bh + 14);
    // 분포
    const L = parts.filter((p) => p.x < 0.5).length;
    const gx = w * 0.53, gw = w - gx - 12, gy = h - 30, gh = h - 60;
    const maxLog = logC(N, Math.floor(N / 2));
    const bwid = gw / (N + 1);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("왼쪽 입자 수별 경우의 수 (가장 큰 값 = 1)", gx, 14);
    for (let k = 0; k <= N; k++) {
      const v = 10 ** (logC(N, k) - maxLog), hh = v * gh;
      ctx.fillStyle = k === L ? "#e0a02a" : "rgba(141,141,146,.55)";
      ctx.fillRect(gx + k * bwid + (bwid > 3 ? 0.5 : 0), gy - hh, Math.max(1, bwid - (bwid > 3 ? 1 : 0)), Math.max(hh, k === L ? 2 : 0));
    }
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("0", gx + bwid / 2, gy + 12); ctx.fillText(`${N / 2}`, gx + (N / 2 + 0.5) * bwid, gy + 12); ctx.fillText(`${N}`, gx + (N + 0.5) * bwid, gy + 12);
    // 최근 흐름 (작은 선)
    if (hist.length > 1) { ctx.strokeStyle = "rgba(224,160,42,.8)"; ctx.lineWidth = 1.2; ctx.beginPath(); hist.forEach((v, i) => { const x = gx + (v + 0.5) * bwid, y = gy + 18 + i * 0.12; i ? ctx.lineTo(x, Math.min(h - 2, y)) : ctx.moveTo(x, y); }); }
  }
  function update() {
    const L = parts.filter((p) => p.x < 0.5).length;
    nLeft.textContent = `${L} / ${N}`;
    nW.textContent = `${fmt(logC(N, L))}가지`;
    const lp = -N * Math.log10(2);
    nP.textContent = lp > -4 ? `1/${Math.round(2 ** N).toLocaleString("ko-KR")}` : `약 10^${Math.round(lp)}`;
  }
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
    N = +b.dataset.n; root.querySelectorAll("[data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); gather(); update(); draw();
  }));
  $(".gather").addEventListener("click", () => { gather(); update(); draw(); });
  let acc = 0;
  loop(cv, (dt) => {
    const sp = reduce ? 0 : 0.25 * dt;
    parts.forEach((p) => {
      p.a += (rnd() - 0.5) * 0.8; p.x += Math.cos(p.a) * sp; p.y += Math.sin(p.a) * sp * 1.6;
      if (p.x < 0) { p.x = -p.x; p.a = Math.PI - p.a; } if (p.x > 1) { p.x = 2 - p.x; p.a = Math.PI - p.a; }
      if (p.y < 0) { p.y = -p.y; p.a = -p.a; } if (p.y > 1) { p.y = 2 - p.y; p.a = -p.a; }
    });
    acc += dt; if (acc > 0.25) { acc = 0; update(); }
    draw();
  });
  gather(); update();
})();
