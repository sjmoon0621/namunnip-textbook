/* 카드: 지진과 화산을 지도에 찍으면 판의 경계가 보일까? — USGS 지진·GVP 화산 실측 자료, 깊이 거르기, 진원 단면 */
(() => {
  const root = document.getElementById("card-is1-quake-map");
  if (!root || !window.NMQuake) return;
  const { C, F, fit, axes } = NM;
  const D = NMQuake, $ = (s) => root.querySelector(s);
  // 단면: 해구(A)에서 위에 놓인 판 쪽(B)으로
  const CUTS = { izu: [[147, 29], [134, 29]], tg: [[-171, -20], [176, -19]], sa: [[-74, -22], [-60, -24]], ma: [[-48, 25], [-36, 25]] };
  let depth = "all", cut = null, pick = [];
  const map = fit($(".qm-map"), () => draw()), sec = fit($(".qm-sec"), () => drawSec());
  const okD = (z) => depth === "all" || (depth === "s" ? z < 70 : depth === "m" ? z >= 70 && z <= 300 : z > 300);
  const dcol = (z) => (z < 70 ? "#e8a33a" : z <= 300 ? "#3f9a5a" : "#3a62b0");
  const unwrap = (lon, ref) => { let l = lon; while (l - ref > 180) l -= 360; while (l - ref < -180) l += 360; return l; };

  // 단면: 선 위 거리(km)와 선에서 떨어진 거리(km)
  function project(a, b, lon, lat) {
    const R = 6371, k = Math.PI / 180, lat0 = (a[1] + b[1]) / 2 * k;
    const xy = (p) => [unwrap(p[0], a[0]) * k * Math.cos(lat0) * R, p[1] * k * R];
    const A = xy(a), B = xy(b), P = xy([lon, lat]);
    const vx = B[0] - A[0], vy = B[1] - A[1], L = Math.hypot(vx, vy);
    const t = ((P[0] - A[0]) * vx + (P[1] - A[1]) * vy) / L;
    return { s: t, off: Math.abs((P[0] - A[0]) * vy - (P[1] - A[1]) * vx) / L, L };
  }
  function inCut() {
    if (!cut) return [];
    return D.q.filter((q) => okD(q[2])).map((q) => ({ q, ...project(cut[0], cut[1], q[0], q[1]) })).filter((p) => p.off < 300 && p.s >= 0 && p.s <= p.L);
  }
  function draw() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h * 1.0;
    map.X = X; map.Y = Y;
    ctx.fillStyle = "#dfe7ef"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "#c9c3b2"; ctx.lineWidth = 0.6;
    D.land.forEach((p) => { ctx.beginPath(); for (let i = 0; i < p.length; i += 2) { const x = X(p[i]), y = Y(p[i + 1]); (i && Math.abs(p[i] - p[i - 2]) < 180) ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.fill(); ctx.stroke(); });   // 날짜 변경선을 넘는 변은 잇지 않음
    if ($(".sv").checked) { ctx.fillStyle = "#c0392b"; D.v.forEach(([lon, lat]) => { const x = X(lon), y = Y(lat); ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 2.6, y + 2); ctx.lineTo(x - 2.6, y + 2); ctx.fill(); }); }
    let n = 0;
    if ($(".sq").checked) D.q.forEach(([lon, lat, z, m]) => { if (!okD(z)) return; n++; ctx.fillStyle = dcol(z); ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(X(lon), Y(lat), 0.5 + (m - 5.4) * 1.1, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    $(".n-q").textContent = `${n}건`;
    const seg = (a, b) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); let bl = unwrap(b[0], a[0]); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(bl), Y(b[1])); if (bl !== b[0]) { ctx.moveTo(X(a[0] + (b[0] - bl)), Y(a[1])); ctx.lineTo(X(b[0]), Y(b[1])); } ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText("A", X(a[0]) - 4, Y(a[1]) - 6); ctx.fillText("B", X(b[0]) - 4, Y(b[1]) - 6); };
    if (cut) seg(cut[0], cut[1]);
    if (pick.length === 1) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(pick[0][0]), Y(pick[0][1]), 4, 0, Math.PI * 2); ctx.fill(); }
    // 범례
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    [["#e8a33a", "<70 km"], ["#3f9a5a", "70–300"], ["#3a62b0", ">300"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(10, h - 44 + i * 13, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(t, 18, h - 40 + i * 13); });
  }
  function drawSec() {
    const { ctx } = sec, { w, h } = sec.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = inCut(), L = pts.length ? pts[0].L : 2000;
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 52 };
    const X = (s) => box.x0 + s / L * box.w, Y = (z) => box.y0 + z / 700 * box.h;
    axes(ctx, { ...box, X, Y, yt: [0, 200, 400, 600].map((z) => [z, String(z)]), xlabel: "", ylabel: "진원 깊이 (km)" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(cut ? "A" : "단면을 고르거나 지도를 두 번 누르세요", box.x0, box.y0 + box.h + 16); if (cut) { ctx.textAlign = "right"; ctx.fillText(`B (${Math.round(L)} km)`, box.x0 + box.w, box.y0 + box.h + 16); }
    pts.forEach(({ q, s }) => { ctx.fillStyle = dcol(q[2]); ctx.beginPath(); ctx.arc(X(s), Y(q[2]), 1.2 + (q[3] - 5.4) * 1.3, 0, Math.PI * 2); ctx.fill(); });
    $(".n-s").textContent = cut ? `${pts.length}건` : "—";
    $(".n-d").textContent = pts.length ? `${Math.max(...pts.map((p) => p.q[2]))} km` : "—";
  }
  const redraw = () => { draw(); drawSec(); };
  $(".layers").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b) return; depth = b.dataset.d; root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); redraw(); });
  root.querySelectorAll(".sq, .sv").forEach((el) => el.addEventListener("change", redraw));
  $(".cuts").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; cut = CUTS[b.dataset.c]; pick = []; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); redraw(); });
  $(".qm-map").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), { w, h } = map.size;
    const lon = (e.clientX - r.left) / w * 360 - 180, lat = 90 - (e.clientY - r.top) / h * 180;
    pick.push([lon, lat]);
    if (pick.length === 2) { cut = pick; pick = []; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", "false")); }
    redraw();
  });
  redraw();
  if (/[?&]demo\b/.test(location.search)) { root.querySelector('[data-c="tg"]').click(); root.querySelector(".sv").click(); }
})();
