/* 카드: 빠르게 움직이면 정말 시간이 느리게 갈까? — 빛 시계와 시간 팽창 */
(() => {
  const root = document.getElementById("card-phy-lm-clock");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bS = $(".beta"), bO = $(".beta-out");
  const gEl = $(".gamma"), nEl = $(".n10"), dEl = $(".diag");
  const cv_ = () => { const b = +bS.value; return { b, g: 1 / Math.sqrt(1 - b * b) }; };
  let t = 0, trail = [], lastX = null;

  const { ctx, size } = fit(cv, () => draw());
  const tri = (u) => { const f = u - Math.floor(u); return f < 0.5 ? 2 * f : 2 - 2 * f; }; // 0→1→0

  function clock(x, yTop, L, py, label, n) {
    ctx.fillStyle = C.ink;
    ctx.fillRect(x - 16, yTop - 3, 32, 3); ctx.fillRect(x - 16, yTop + L, 32, 3);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 16, yTop); ctx.lineTo(x - 16, yTop + L); ctx.moveTo(x + 16, yTop); ctx.lineTo(x + 16, yTop + L); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x, py, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(label, 8, yTop + 4);
    ctx.font = `500 15px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "right";
    ctx.fillText(`${n}번 째깍`, size.w - 8, yTop + 12);
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { b, g } = cv_();
    const L = h / 2 - 40, cvis = 2 * L / 1.3, T0 = 2 * L / cvis; // 정지 시계 한 번 왕복 1.3초 (화면 시간)
    // 위: 지면에 놓인 시계
    const y1 = 22;
    const p0 = y1 + L - tri(t / T0) * L;
    clock(w * 0.3, y1, L, p0, "지면에 놓인 시계", Math.floor(t / T0));
    ctx.strokeStyle = "rgba(224,160,42,.45)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w * 0.3, y1); ctx.lineTo(w * 0.3, y1 + L); ctx.stroke();
    // 아래: 속력 v로 움직이는 시계 (지면에서 본 모습)
    const y2 = h / 2 + 22, span = w + 60;
    const x = ((b * cvis * t + w * 0.3 + 30) % span) - 30;
    const p1 = y2 + L - tri(t / (g * T0)) * L;
    if (lastX !== null && x < lastX) trail = [];
    lastX = x;
    trail.push([x, p1]);
    if (trail.length > 400) trail.shift();
    ctx.strokeStyle = "rgba(224,160,42,.6)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); trail.forEach(([a, c], i) => (i ? ctx.lineTo(a, c) : ctx.moveTo(a, c))); ctx.stroke();
    clock(x, y2, L, p1, `v = ${b.toFixed(2)}c로 움직이는 시계`, Math.floor(t / (g * T0)));
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(0, h / 2 + .5); ctx.lineTo(w, h / 2 + .5); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("노란 선: 지면에서 본 빛의 경로", 8, h - 6);
  }

  function update(reset) {
    const { b, g } = cv_();
    bO.textContent = b.toFixed(2);
    gEl.textContent = g < 1.0005 ? "1.000" : g.toFixed(3);
    nEl.textContent = `${(10 / g).toFixed(2)}번`;
    dEl.textContent = `${g.toFixed(2)}배`;
    if (reset) { t = 0; trail = []; lastX = null; }
    draw();
  }
  bS.addEventListener("input", () => update(true));
  root.querySelectorAll("[data-beta]").forEach((btn) => btn.addEventListener("click", () => { bS.value = btn.dataset.beta; update(true); }));
  loop(cv, (dt) => { if (reduce) return; t += dt; draw(); });
  update(true);
})();
