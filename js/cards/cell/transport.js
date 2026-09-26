/* 카드: 농도 차를 두 배로 늘리면 들어오는 양도 두 배가 될까? — 단순 확산(선형), 촉진 확산(포화, 농도 차를 따라), 능동 수송(ATP, 기울기를 거슬러) */
(() => {
  const root = document.getElementById("card-cell-transport");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sCo = $(".co"), sCi = $(".ci"), sN = $(".n"), atp = $(".atp");
  const oCo = $(".co-out"), oCi = $(".ci-out"), oN = $(".n-out"), nJ = $(".n-j"), nD = $(".n-d"), nE = $(".n-e");
  const KM = 2, VMAX = 10, P = 0.8;
  const MC = { simple: "#3f6fa3", facil: "#3b7c2a", active: "#b5532f" };
  let mode = "facil";
  function J(m, co, ci, n, a) {
    if (m === "simple") return P * (co - ci);
    if (m === "facil") return n * VMAX * (co / (KM + co) - ci / (KM + ci));
    return (a ? n * VMAX * co / (KM + co) : 0) - 0.05 * (ci - co);   // 펌프 + 아주 작은 역누출
  }
  let seed = 11; const rnd = () => { const x = Math.sin(seed++ * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const pts = Array.from({ length: 120 }, () => [rnd(), rnd()]);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const co = +sCo.value, ci = +sCi.value, n = +sN.value, a = atp.checked, j = J(mode, co, ci, n, a);
    // 위: 막
    const my = h * 0.24, mh = 22, top = 10, bot = h * 0.47;
    ctx.fillStyle = "#eef3f6"; ctx.fillRect(0, top, w, my - mh / 2 - top);
    ctx.fillStyle = "#f4f1e8"; ctx.fillRect(0, my + mh / 2, w, bot - my - mh / 2);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("세포 밖", 8, top + 14); ctx.fillText("세포 안", 8, bot - 6);
    // 인지질 2중층
    for (let x = 4; x < w; x += 9) {
      ["#e0a02a"].forEach(() => {
        ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(x, my - mh / 2, 3.4, 0, 6.29); ctx.fill(); ctx.beginPath(); ctx.arc(x, my + mh / 2, 3.4, 0, 6.29); ctx.fill();
        ctx.strokeStyle = "#c9a45a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, my - mh / 2 + 3); ctx.lineTo(x, my - 1); ctx.moveTo(x, my + mh / 2 - 3); ctx.lineTo(x, my + 1); ctx.stroke();
      });
    }
    // 막단백질
    if (mode !== "simple") {
      const k = Math.round(n * 2);
      for (let i = 0; i < k; i++) {
        const px = w * (0.2 + 0.6 * (k === 1 ? 0.5 : i / (k - 1)));
        ctx.fillStyle = mode === "facil" ? "#9cc58e" : "#e3a48f"; ctx.strokeStyle = MC[mode]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(px - 11, my - mh / 2 - 8, 22, mh + 16, 7); ctx.fill(); ctx.stroke();
        if (mode === "active") { ctx.fillStyle = a ? "#b5532f" : C.ink3; ctx.font = `600 9px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("ATP", px, my + mh / 2 + 20); }
      }
    }
    // 분자
    const dot = (cnt, y0, y1) => { ctx.fillStyle = MC[mode]; for (let i = 0; i < cnt; i++) { const [a1, b1] = pts[(i + (y0 > my ? 60 : 0)) % 120]; ctx.beginPath(); ctx.arc(8 + a1 * (w - 16), y0 + b1 * (y1 - y0), 2.8, 0, 6.29); ctx.fill(); } };
    dot(Math.round(co * 2.5), top + 20, my - mh / 2 - 10);
    dot(Math.round(ci * 2.5), my + mh / 2 + 26, bot - 14);
    // 알짜 이동 화살표
    if (Math.abs(j) > 0.05) {
      const L = Math.min(60, 8 + Math.abs(j) * 4), dir = j > 0 ? 1 : -1, ax = w - 40;
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, my - dir * L / 2); ctx.lineTo(ax, my + dir * (L / 2 - 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, my + dir * L / 2); ctx.lineTo(ax - 7, my + dir * (L / 2 - 10)); ctx.lineTo(ax + 7, my + dir * (L / 2 - 10)); ctx.closePath(); ctx.fill();
    }
    // 아래: 속도–바깥 농도
    const gx = 44, gy = h * 0.57, gw = w - gx - 14, gh = h * 0.33;
    const X = (c) => gx + c / 20 * gw, Y = (v) => gy + gh * 0.55 - v / 30 * gh;   // v: -12 ~ 30 → 위쪽 넉넉히
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y: (v) => Y(v), xt: [0, 5, 10, 15, 20].map((v) => [v, v]), yt: [[-10, "-10"], [0, "0"], [10, "10"]], xlabel: "바깥 농도 (mM)", ylabel: "안으로 들어오는 속도 (상대값)" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0) + .5); ctx.lineTo(gx + gw, Y(0) + .5); ctx.stroke();
    ["simple", "facil", "active"].forEach((m) => {
      ctx.strokeStyle = MC[m]; ctx.lineWidth = m === mode ? 2.6 : 1; ctx.globalAlpha = m === mode ? 1 : 0.35;
      ctx.beginPath();
      for (let c = 0; c <= 20.001; c += 0.25) { const v = Math.max(-12, Math.min(18, J(m, c, ci, n, a))); c ? ctx.lineTo(X(c), Y(v)) : ctx.moveTo(X(c), Y(v)); }
      ctx.stroke(); ctx.globalAlpha = 1;
    });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(co), Y(Math.max(-12, Math.min(18, j))), 5, 0, 6.29); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(ci), gy); ctx.lineTo(X(ci), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("안쪽 농도와 같은 곳", X(ci) + 4, gy + gh - 4);
  }
  function update() {
    const co = +sCo.value, ci = +sCi.value, n = +sN.value, a = atp.checked, j = J(mode, co, ci, n, a);
    oCo.textContent = co; oCi.textContent = ci; oN.textContent = n;
    nJ.textContent = Math.abs(j).toFixed(1);
    nD.textContent = Math.abs(j) < 0.05 ? "평형 (알짜 이동 없음)" : j > 0 ? (co >= ci ? "안으로 (농도 차를 따라)" : "안으로 (농도 차를 거슬러)") : (co <= ci ? "밖으로 (농도 차를 따라)" : "밖으로");
    nE.textContent = mode === "active" ? (a ? "ATP 사용" : "ATP 없음 → 멈춤") : "쓰지 않음";
    nE.classList.toggle("bad", mode === "active" && !a);
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === mode ? "true" : "false"));
    atp.closest("label").style.opacity = mode === "active" ? 1 : 0.45;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  [sCo, sCi, sN].forEach((el) => el.addEventListener("input", update)); atp.addEventListener("change", update);
  update();
})();
