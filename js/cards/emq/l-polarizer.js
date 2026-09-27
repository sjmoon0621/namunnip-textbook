/* 카드: 편광판 두 장 사이에 한 장을 더 끼우면 왜 빛이 다시 나올까? — 말뤼스 법칙 */
(() => {
  const root = document.getElementById("card-emq-polarizer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".m"), oM = $(".m-out"), sZ = $(".z"), oZ = $(".z-out"), n1 = $(".n-1"), n2 = $(".n-2");
  let N = 2;
  const angles = () => N === 3 ? [0, +sM.value, +sZ.value] : [0, +sZ.value];
  function chain() { const a = angles(), I = [1, 0.5]; for (let i = 1; i < a.length; i++) { const d = (a[i] - a[i - 1]) * Math.PI / 180; I.push(I[I.length - 1] * Math.cos(d) ** 2); } return { a, I }; }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { a, I } = chain(), cy = h * 0.46, n = a.length, gap = (w - 60) / (n + 1), R = Math.min(gap * 0.36, h * 0.3);
    // 빛줄기
    for (let k = 0; k <= n; k++) { const x0 = 20 + gap * k, x1 = 20 + gap * (k + 1), Ik = I[k]; ctx.fillStyle = `rgba(224,160,42,${0.12 + 0.75 * Ik})`; ctx.fillRect(x0, cy - 10, x1 - x0, 20); }
    // 편광 상태 표시(각 구간 가운데)
    for (let k = 0; k <= n; k++) {
      const x = 20 + gap * (k + 0.5);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      if (k === 0) { ctx.beginPath(); for (let j = 0; j < 4; j++) { const t = j * Math.PI / 4; ctx.moveTo(x - Math.sin(t) * 16, cy - 50 - Math.cos(t) * 16); ctx.lineTo(x + Math.sin(t) * 16, cy - 50 + Math.cos(t) * 16); } ctx.stroke(); }
      else if (I[k] > 1e-4) { const t = a[k - 1] * Math.PI / 180, l = 18 * Math.sqrt(I[k] / 0.5); ctx.beginPath(); ctx.moveTo(x - Math.sin(t) * l, cy - 50 - Math.cos(t) * l); ctx.lineTo(x + Math.sin(t) * l, cy - 50 + Math.cos(t) * l); ctx.stroke(); }
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(k === 0 ? "편광 안 됨 · 1" : `${I[k] < 0.001 ? "0" : I[k].toFixed(3)}`, x, cy + 30);
    }
    // 편광판
    a.forEach((ang, i) => {
      const x = 20 + gap * (i + 1), t = ang * Math.PI / 180;
      ctx.fillStyle = "rgba(90,90,96,.18)"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, cy, R * 0.35, R, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - Math.sin(t) * R * 0.3, cy - Math.cos(t) * R * 0.9); ctx.lineTo(x + Math.sin(t) * R * 0.3, cy + Math.cos(t) * R * 0.9); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`${ang}°`, x, cy + R + 16);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("위 막대: 진동 방향 · 아래 숫자: 처음 대비 세기 · 판 위의 선: 투과축", 8, h - 6);
  }
  function update() {
    root.querySelectorAll("[data-n]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === N)));
    root.querySelectorAll(".x-mid").forEach((e) => (e.hidden = N !== 3));
    oM.textContent = sM.value; oZ.textContent = sZ.value;
    const { I } = chain(); n1.textContent = "0.5 (절반)"; n2.textContent = `${I[I.length - 1] < 1e-4 ? "0" : I[I.length - 1].toFixed(3)} 배`;
    draw();
  }
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { N = +b.dataset.n; update(); }));
  sM.addEventListener("input", update); sZ.addEventListener("input", update); update();
})();
