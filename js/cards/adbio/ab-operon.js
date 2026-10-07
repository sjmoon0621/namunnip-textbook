/* 카드: lac 오페론(유도성)과 trp 오페론(억제성, 감쇠) 비교 — 상대값 모식 */
(() => {
  const root = document.getElementById("card-adbio-operon");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  let mut = "none";
  const BLUE = "#3f6fa3", PURP = "#7a5aa6", AMB = "#b07a10";
  function state() {
    const glc = $(".t-glc").checked, lac = $(".t-lac").checked, trp = $(".t-trp").checked;
    const lacRep = mut !== "lacI" && !lac, cap = !glc;
    const L = lacRep ? 0.1 : cap ? 100 : 5;
    const trpRep = mut !== "trpR" && trp, att = mut !== "att" && trp;
    const T = 100 / (trpRep ? 70 : 1) / (att ? 10 : 1);
    return { glc, lac, trp, lacRep, cap, L, trpRep, att, T };
  }
  const { ctx, size } = fit(cv, () => draw());
  function blob(x, y, rx, ry, fill, stroke, label) {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (label) { ctx.fillStyle = stroke; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x, y + 4); }
  }
  function seg(x0, x1, y, fill, label, col) {
    ctx.fillStyle = fill; ctx.fillRect(x0, y - 8, x1 - x0, 16);
    ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y - 7.5, x1 - x0 - 1, 15);
    ctx.fillStyle = col || C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(label, (x0 + x1) / 2, y + 4);
  }
  function dots(x, y, n, col) { ctx.fillStyle = col; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x + i * 7, y, 3, 0, Math.PI * 2); ctx.fill(); } }
  function bar(x0, x1, y, v, label) {
    const X = (u) => x0 + (Math.log10(u) + 1) / 3 * (x1 - x0);
    ctx.fillStyle = "#e9ebe4"; ctx.fillRect(x0, y, x1 - x0, 10);
    ctx.fillStyle = v >= 50 ? C.forest : v >= 3 ? C.leaf : C.warn; ctx.fillRect(x0, y, Math.max(2, X(v) - x0), 10);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
    [0.1, 1, 10, 100].forEach((u) => ctx.fillText(String(u), X(u), y + 22));
    ctx.textAlign = "left"; ctx.fillText(label, x0, y - 4);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), m = 14, U = (w - 2 * m) / 100, X = (p) => m + p * U;
    /* ── lac ── */
    let y0 = 18;
    ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("lac 오페론 · 젖당 분해 · 유도성", m, y0);
    const yD = y0 + 62;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m, yD); ctx.lineTo(w - m, yD); ctx.stroke();
    seg(X(0), X(11), yD, mut === "lacI" ? "#f3d2c8" : "#e6e1ee", mut === "lacI" ? "lacI ✕" : "lacI", mut === "lacI" ? C.warn : PURP);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("//", X(13.5), yD + 4);
    seg(X(16), X(22), yD, "#f6ead1", "C", AMB); seg(X(22), X(30), yD, "#dbe6f1", "P", BLUE); seg(X(30), X(35), yD, "#eadff1", "O", PURP);
    seg(X(35), X(68), yD, "#dcefd6", "lacZ"); seg(X(68), X(85), yD, "#dcefd6", "lacY"); seg(X(85), X(100), yD, "#dcefd6", "lacA");
    if (s.cap) { blob(X(19), yD - 18, 15, 9, "rgba(224,160,42,.25)", AMB, "CAP"); dots(X(19) - 3, yD - 30, 2, AMB); }
    if (mut !== "lacI") {
      if (s.lacRep) blob(X(32.5), yD - 20, 20, 11, "rgba(122,90,166,.22)", PURP, "억제");
      else { blob(X(52), y0 + 8, 22, 11, "rgba(122,90,166,.12)", PURP, "억제"); dots(X(52) + 24, y0 + 8, 2, C.apple); ctx.fillStyle = C.apple; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("알로락토스", X(52) + 40, y0 + 12); }
    }
    if (!s.lacRep) {
      blob(X(27.5), yD - 22, 28, 12, "rgba(63,111,163,.15)", BLUE, "RNA 중합");
      const lw = s.L >= 50 ? 4 : 1.5;
      ctx.strokeStyle = C.forest; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(36), yD - 16); ctx.lineTo(X(97), yD - 16); ctx.stroke();
      ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(s.L >= 50 ? "mRNA 많이" : "mRNA 조금", X(97), yD - 24);
    } else { ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("억제 단백질이 작동 부위를 막음", X(40), yD - 18); }
    bar(m, w - m, yD + 26, s.L, `lac 전사 (로그, 최대 = 100): ${s.L}`);
    /* ── trp ── */
    y0 = yD + 82;
    ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("trp 오페론 · 트립토판 합성 · 억제성", m, y0);
    const yT = y0 + 70;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m, yT); ctx.lineTo(w - m, yT); ctx.stroke();
    seg(X(0), X(12), yT, mut === "trpR" ? "#f3d2c8" : "#e6e1ee", mut === "trpR" ? "trpR ✕" : "trpR", mut === "trpR" ? C.warn : PURP);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("//", X(15), yT + 4);
    seg(X(18), X(25), yT, "#dbe6f1", "P", BLUE); seg(X(25), X(30), yT, "#eadff1", "O", PURP);
    seg(X(30), X(42), yT, mut === "att" ? "#f3d2c8" : "#f6ead1", mut === "att" ? "L ✕" : "trpL", mut === "att" ? C.warn : AMB);
    ["E", "D", "C", "B", "A"].forEach((g, i) => seg(X(42 + i * 11.6), X(42 + (i + 1) * 11.6), yT, "#dcefd6", "trp" + g));
    if (mut !== "trpR") {
      if (s.trpRep) { blob(X(27.5), yT - 20, 20, 11, "rgba(122,90,166,.22)", PURP, "억제"); dots(X(27.5) + 16, yT - 30, 2, C.forest); }
      else { blob(X(60), y0 + 10, 22, 11, "rgba(122,90,166,.08)", PURP, "억제"); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("트립토판이 없어 불활성", X(60) + 28, y0 + 14); }
    }
    /* 선도 서열의 머리핀 */
    const hx = X(36), hy = yT - 30;
    if (mut !== "att") {
      const term = s.trp;
      ctx.strokeStyle = term ? C.warn : C.forest; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(hx - 6, yT - 10); ctx.lineTo(hx - 3, hy + 2); ctx.arc(hx, hy, 4, Math.PI, 0); ctx.lineTo(hx + 6, yT - 10); ctx.stroke();
      ctx.fillStyle = term ? C.warn : C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(term ? "3·4 종결 머리핀" : "2·3 머리핀 → 전사 계속", hx + (term ? 0 : 20), hy - 10);
    }
    const lw = s.T >= 50 ? 4 : s.T >= 3 ? 2 : 1;
    if (s.T > 0.5) { ctx.strokeStyle = C.forest; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(X(43), yT - 16); ctx.lineTo(X(99), yT - 16); ctx.stroke(); }
    blob(X(21.5), yT - 22, 28, 12, s.trpRep ? "rgba(63,111,163,.05)" : "rgba(63,111,163,.15)", s.trpRep ? "rgba(63,111,163,.4)" : BLUE, "RNA 중합");
    bar(m, w - m, yT + 26, s.T, `trp 전사 (로그, 최대 = 100): ${s.T >= 1 ? +s.T.toFixed(1) : s.T.toFixed(2)}`);
    /* 비교 */
    const yc = yT + 66;
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("lac: 억제 단백질 단독 = 활성형 · 알로락토스가 붙으면 떨어짐 · CAP-cAMP가 양성 조절", m, yc);
    ctx.fillText("trp: 억제 단백질 단독 = 불활성형 · 트립토판이 붙어야 작동 부위에 결합 · 감쇠", m, yc + 16);
  }
  function update() {
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.x === mut)));
    const s = state();
    const nl = $(".n-l"), nt = $(".n-t");
    nl.textContent = String(s.L); nl.className = s.L >= 50 ? "n-l good" : s.L < 1 ? "n-l bad" : "n-l";
    nt.textContent = s.T >= 1 ? String(+s.T.toFixed(1)) : s.T.toFixed(2); nt.className = s.T >= 50 ? "n-t good" : s.T < 1 ? "n-t bad" : "n-t";
    $(".n-a").textContent = `${s.trpRep ? "1/70" : "1"} × ${s.att ? "1/10" : "1"}`;
    draw();
  }
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { mut = b.dataset.x; update(); }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  if (/[?&]demo/.test(location.search)) { $(".t-trp").checked = true; mut = "trpR"; }
  update();
})();
