/* 카드: 끼인각이 90°가 아니면 피타고라스 정리는 어떻게 바뀔까? — b, c, A로 a² = b² + c² − 2bc cos A를 확인한다 */
(() => {
  const root = document.getElementById("card-alg-cosine-law");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sb = $(".b"), sc = $(".c"), sA = $(".A");
  const { ctx, size } = fit($("canvas"), () => draw());
  const n = (v, k = 2) => { const r = Math.round(v * 10 ** k) / 10 ** k; return (r < 0 ? "−" : "") + Math.abs(r); };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = +sb.value, c = +sc.value, A = +sA.value * Math.PI / 180;
    const Cx = b * Math.cos(A), Cy = b * Math.sin(A);
    const xmin = Math.min(0, Cx), xmax = Math.max(c, Cx), ymax = Math.max(Cy, 0.5);
    const s = Math.min((w - 50) / (xmax - xmin), (h - 50) / ymax);
    const ox = (w - (xmax - xmin) * s) / 2 - xmin * s, oy = h - 26;
    const X = (x) => ox + x * s, Y = (y) => oy - y * s;
    const H = [Cx, 0];
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(X(Math.min(0, Cx)), Y(0)); ctx.lineTo(X(Math.max(c, Cx)), Y(0)); ctx.moveTo(X(Cx), Y(Cy)); ctx.lineTo(X(H[0]), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(c), Y(0)); ctx.lineTo(X(Cx), Y(Cy)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(c), Y(0)); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Cx), Y(Cy)); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(X(c), Y(0)); ctx.lineTo(X(Cx), Y(Cy)); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(0), Y(0) + 6); ctx.lineTo(X(Cx), Y(0) + 6); ctx.stroke();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(0), Y(0), 22, -A, 0); ctx.stroke();
    ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink;
    ctx.fillText("A", X(0) - 12, Y(0) + 4); ctx.fillText("B", X(c) + 12, Y(0) + 4); ctx.fillText("C", X(Cx), Y(Cy) - 13);
    ctx.fillText("H", X(H[0]) + (Cx < 0 ? -10 : 10), Y(0) + 14);
    ctx.font = `italic 600 13px ${F.serif}`;
    ctx.fillStyle = C.ink; ctx.fillText("c", X(c / 2), Y(0) - 10); ctx.fillText("b", X(Cx / 2) - 10, Y(Cy / 2));
    ctx.fillStyle = C.warn; ctx.fillText("a", X((c + Cx) / 2) + 10, Y(Cy / 2) - 4);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.amber; ctx.textBaseline = "top";
    if (Math.abs(Cx) * s > 46) ctx.fillText(`b cos A = ${n(Cx)}`, X(Cx / 2), Y(0) + 11);
  }

  function update() {
    const b = +sb.value, c = +sc.value, Ad = +sA.value, A = Ad * Math.PI / 180;
    $(".b-out").textContent = b; $(".c-out").textContent = c; $(".A-out").textContent = Ad;
    const corr = 2 * b * c * Math.cos(A), a2 = b * b + c * c - corr;
    $(".n-p").textContent = n(b * b + c * c); $(".n-k").textContent = n(-corr); $(".n-a").textContent = `${n(a2)} → a = ${n(Math.sqrt(a2))}`;
    $(".eq").textContent = Ad === 90 ? "A = 90°: 보정항 0, 피타고라스 정리와 같습니다." : Ad < 90 ? "A < 90°: cos A > 0, a² < b² + c²" : "A > 90°: cos A < 0, a² > b² + c²";
    draw();
  }
  [sb, sc, sA].forEach((s) => s.addEventListener("input", update));
  update();
})();
