/* 카드: 기타 줄과 리코더는 왜 정해진 음만 낼까? — 줄, 열린 관, 닫힌 관의 정상파와 배음 */
(() => {
  const root = document.getElementById("card-mech-standing");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), sL = $(".l"), oN = $(".n-out"), oL = $(".l-out");
  const nLam = $(".n-lam"), nF = $(".n-f"), nNote = $(".n-note");
  let kind = "string", t = 0;
  const V = { string: 143, open: 340, closed: 340 };
  const NAMES = ["도", "도♯", "레", "레♯", "미", "파", "파♯", "솔", "솔♯", "라", "라♯", "시"];
  function freq(n) { const L = +sL.value, v = V[kind]; return kind === "closed" ? (2 * n - 1) * v / (4 * L) : n * v / (2 * L); }
  function lam(n) { const L = +sL.value; return kind === "closed" ? 4 * L / (2 * n - 1) : 2 * L / n; }
  function note(f) { const m = 69 + 12 * Math.log2(f / 440), r = Math.round(m), oct = Math.floor(r / 12) - 1; return `${NAMES[((r % 12) + 12) % 12]}${oct} (${(m - r >= 0 ? "+" : "−")}${Math.abs((m - r) * 100).toFixed(0)}센트)`; }
  // 모양: 변위 y(x) (x = 0..1, 왼쪽이 막히거나 고정된 끝)
  function shape(n, x) {
    if (kind === "string") return Math.sin(n * Math.PI * x);
    if (kind === "open") return Math.cos(n * Math.PI * x);
    return Math.sin((2 * n - 1) * Math.PI * x / 2);   // x = 0 막힘(마디), x = 1 열림(배)
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sN.value, x0 = 30, x1 = w - 30, cy = h * 0.38, A = h * 0.2, osc = Math.cos(t * 5);
    // 관 또는 줄의 틀
    if (kind === "string") { ctx.fillStyle = "#8d8d92"; ctx.fillRect(x0 - 8, cy - A - 10, 8, 2 * A + 20); ctx.fillRect(x1, cy - A - 10, 8, 2 * A + 20); }
    else {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, cy - A - 12); ctx.lineTo(x1, cy - A - 12); ctx.moveTo(x0, cy + A + 12); ctx.lineTo(x1, cy + A + 12); ctx.stroke();
      if (kind === "closed") { ctx.fillStyle = C.ink; ctx.fillRect(x0 - 6, cy - A - 12, 6, 2 * A + 24); }
    }
    // 포락선과 지금 모양
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; [1, -1].forEach((sg) => { ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = i / 200; const yy = cy - sg * A * shape(n, x); i ? ctx.lineTo(x0 + x * (x1 - x0), yy) : ctx.moveTo(x0, yy); } ctx.stroke(); });
    ctx.strokeStyle = kind === "string" ? C.ink : "#3f6fa3"; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = i / 200; const yy = cy - A * shape(n, x) * osc; i ? ctx.lineTo(x0 + x * (x1 - x0), yy) : ctx.moveTo(x0, yy); } ctx.stroke();
    // 마디 표시
    ctx.fillStyle = "#b5532f"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    for (let i = 0; i <= 400; i++) { const x = i / 400; if (Math.abs(shape(n, x)) < 0.012 && (i === 0 || Math.abs(shape(n, (i - 1) / 400)) >= Math.abs(shape(n, x)))) { const px = x0 + x * (x1 - x0); ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill(); } }
    ctx.fillText("● 마디", x0 + 26, 14);
    // 아래: 낼 수 있는 진동수 목록 (배음 스펙트럼)
    const by = h - 20, bh = h * 0.24, fmax = freq(5) * 1.1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x1, by); ctx.stroke();
    for (let k = 1; k <= 5; k++) {
      const f = freq(k), px = x0 + f / fmax * (x1 - x0);
      ctx.fillStyle = k === n ? "#e0a02a" : "rgba(141,141,146,.7)"; ctx.fillRect(px - 4, by - bh / Math.sqrt(k), 8, bh / Math.sqrt(k));
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.fillText(`${f.toFixed(0)}`, px, by + 12);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText(kind === "closed" ? "낼 수 있는 진동수 (Hz) — 홀수배만" : "낼 수 있는 진동수 (Hz) — 기본음의 정수배", x0, by - bh - 6);
  }
  function update() {
    const n = +sN.value; oN.textContent = n; oL.textContent = (+sL.value).toFixed(2);
    nLam.textContent = `${lam(n).toFixed(2)} m`; const f = freq(n); nF.textContent = `${f.toFixed(0)} Hz`; nNote.textContent = note(f);
    root.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kind === kind)));
    draw();
  }
  [sN, sL].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.kind; update(); }));
  loop(cv, (dt) => { t += dt; draw(); });
  update();
})();
