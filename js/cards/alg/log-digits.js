/* 카드: 2⁵⁰은 몇 자리 수일까? — 상용로그의 정수 부분(자릿수)과 소수 부분(맨 앞 숫자) */
(() => {
  const root = document.getElementById("card-alg-log-digits");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sb = $(".b"), sn = $(".n");
  const { ctx, size } = fit($("canvas"), () => draw());

  function parts() {
    const b = +sb.value, n = +sn.value, L = n * Math.log10(b);
    const c = Math.floor(L + 1e-12), m = Math.max(0, L - c), lead = 10 ** m;
    return { b, n, L, c, m, lead, first: Math.floor(lead + 1e-9) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = parts(), PL = 22, PR = w - 22;
    const y1 = h * 0.24, A = p.c - 1, B = p.c + 2, X1 = (v) => PL + (v - A) / (B - A) * (PR - PL);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(PL, y1); ctx.lineTo(PR, y1); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink3;
    for (let v = A; v <= B; v++) { ctx.fillRect(X1(v) - 0.5, y1 - 6, 1, 12); ctx.textBaseline = "top"; ctx.fillText(`${E.n(v)}`, X1(v), y1 + 9); ctx.textBaseline = "bottom"; ctx.fillText(`10${E.sup(v)}`, X1(v), y1 - 8); }
    ctx.fillStyle = C.sprout; ctx.globalAlpha = 0.6; ctx.fillRect(X1(p.c), y1 - 4, X1(p.c + 1) - X1(p.c), 8); ctx.globalAlpha = 1;
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X1(p.L), y1, 6, 0, 7); ctx.fill();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "top"; ctx.fillText(`log N ≈ ${E.n(p.L, 4)}`, Math.min(PR - 50, Math.max(PL + 50, X1(p.L))), y1 + 24);
    const y2 = h * 0.74, X2 = (v) => PL + Math.log10(v) * (PR - PL);
    ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X1(p.c), y1 + 4); ctx.lineTo(PL, y2); ctx.moveTo(X1(p.c + 1), y1 + 4); ctx.lineTo(PR, y2); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(PL, y2); ctx.lineTo(PR, y2); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    for (let d = 1; d <= 10; d++) { ctx.fillRect(X2(d) - 0.5, y2 - 6, 1, 12); ctx.textBaseline = "top"; ctx.fillText(String(d), X2(d), y2 + 9); }
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X2(p.lead), y2, 6, 0, 7); ctx.fill();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "bottom";
    ctx.fillText(`10의 ${p.m.toFixed(4)}제곱 ≈ ${E.n(p.lead, 3)}`, Math.min(PR - 60, Math.max(PL + 60, X2(p.lead))), y2 - 10);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("소수 부분을 1~10의 로그 눈금으로 확대", PL, h - 16);
  }

  function update() {
    const p = parts();
    $(".b-out").textContent = p.b; $(".n-out").textContent = E.n(p.n);
    $(".eq").innerHTML = `log ${p.b}<sup>${E.n(p.n)}</sup> = ${E.n(p.n)} × log ${p.b} ≈ ${E.n(p.n)} × ${Math.log10(p.b).toFixed(4)} ≈ ${E.n(p.L, 4)} = ${E.n(p.c)} + ${p.m.toFixed(4)}`;
    $(".n-l").textContent = E.n(p.L, 4); $(".n-c").textContent = E.n(p.c); $(".n-m").textContent = p.m.toFixed(4); $(".n-f").textContent = p.first;
    const N = `${p.b}<sup>${E.n(p.n)}</sup>`;
    $(".n-d").innerHTML = p.c >= 0 ? `${N}의 정수 부분은 ${p.c + 1}자리, 맨 앞 숫자 ${p.first} (${N} ≈ ${p.lead.toFixed(3)} × 10<sup>${p.c}</sup>)`
      : `${N}은 소수점 아래 ${-p.c}째 자리에서 처음 0이 아닌 숫자 ${p.first}가 나옴 (${N} ≈ ${p.lead.toFixed(3)} × 10<sup>${E.n(p.c)}</sup>)`;
    draw();
  }
  const clear = () => chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
  chips.forEach((b) => b.addEventListener("click", () => { sb.value = b.dataset.b; sn.value = b.dataset.n; chips.forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  [sb, sn].forEach((s) => s.addEventListener("input", () => { clear(); update(); }));
  update();
})();
