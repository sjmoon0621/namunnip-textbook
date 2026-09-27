/* 카드: DNA가 복제될 때 원래 가닥은 어디로 갈까? — 세 복제 모형의 띠 예측과 가닥 그림 */
(() => {
  const root = document.getElementById("card-gene-replication");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".g"), oG = $(".g-out"), nP = $(".n-p"), nA = $(".n-a"), nV = $(".n-v");
  let m = "semi";
  // 각 모형의 세대 g에서 DNA 분자 목록: 분자 = [가닥1의 ¹⁵N 비율, 가닥2의 ¹⁵N 비율]
  function mols(model, g) {
    let L = [[1, 1]];
    for (let k = 0; k < g; k++) {
      const next = [];
      L.forEach(([a, b]) => {
        if (model === "semi") next.push([a, 0], [b, 0]);
        else if (model === "cons") next.push([a, b], [0, 0]);
        else next.push([a / 2, b / 2], [a / 2, b / 2]);                // 분산: 원래 물질이 두 분자에 반씩 흩어짐
      });
      L = next;
    }
    return L;
  }
  const density = ([a, b]) => (a + b) / 2; // 1 = 무거움, 0.5 = 중간, 0 = 가벼움
  function bands(model, g) { const B = {}; mols(model, g).forEach((mo) => { const d = Math.round(density(mo) * 1000) / 1000; B[d] = (B[d] || 0) + 1; }); return B; }
  const fmt = (B) => { const tot = Object.values(B).reduce((a, b) => a + b, 0), name = (d) => d === 1 ? "무거운" : d === 0.5 ? "중간" : d === 0 ? "가벼운" : `밀도 ${d}`; return Object.keys(B).map(Number).sort((a, b) => b - a).map((d) => `${name(d)} ${B[d]}/${tot}`).join(" · "); };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = +sG.value, L = mols(m, g), n = Math.min(L.length, 16);
    // 왼쪽: 가닥 그림 (최대 16분자)
    const lw = w * 0.6, cols = Math.min(8, n), rows = Math.ceil(n / cols), cw = (lw - 20) / cols, rh = Math.min(70, (h - 30) / rows);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${g}세대 DNA ${L.length}개${L.length > 16 ? " (처음 16개만)" : ""} · 빨강 ¹⁵N 가닥, 파랑 ¹⁴N 가닥`, 10, 14);
    L.slice(0, 16).forEach((mo, i) => {
      const x = 14 + (i % cols) * cw + cw / 2, y = 26 + Math.floor(i / cols) * rh;
      mo.forEach((f, s) => { const xx = x + (s ? 5 : -5); if (m === "disp" && f > 0 && f < 1) { for (let k = 0; k < 8; k++) { ctx.fillStyle = (k * 0.618 % 1) < f ? "#b5532f" : "#3f6fa3"; ctx.fillRect(xx - 3, y + k * (rh - 14) / 8, 6, (rh - 14) / 8); } } else { ctx.fillStyle = f === 1 ? "#b5532f" : "#3f6fa3"; ctx.fillRect(xx - 3, y, 6, rh - 14); } });
    });
    // 오른쪽: 원심 분리관
    const tx = w * 0.8, tw = 44, ty = 20, th = h - 44, Y = (d) => ty + th * (0.2 + 0.6 * d), B = bands(m, g), tot = L.length;
    ctx.fillStyle = "rgba(110,164,230,.1)"; ctx.fillRect(tx - tw / 2, ty, tw, th); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.strokeRect(tx - tw / 2, ty, tw, th);
    [[1, "¹⁵N/¹⁵N"], [0.5, "¹⁵N/¹⁴N"], [0, "¹⁴N/¹⁴N"]].forEach(([d, t]) => { ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(t, tx - tw / 2 - 4, Y(d) + 3); });
    Object.keys(B).forEach((k) => { const d = +k, a = B[k] / tot; ctx.fillStyle = `rgba(35,35,38,${0.25 + 0.75 * a})`; ctx.fillRect(tx - tw / 2 + 3, Y(d) - 3 - 3 * a, tw - 6, 6 + 6 * a); });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("↓ 무거울수록 아래", tx, h - 6);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    const g = +sG.value; oG.textContent = g;
    nP.textContent = fmt(bands(m, g)); nA.textContent = fmt(bands("semi", g));
    const ok = [0, 1, 2, 3, 4].every((k) => fmt(bands(m, k)) === fmt(bands("semi", k))), okNow = fmt(bands(m, g)) === fmt(bands("semi", g));
    nV.textContent = ok ? "모든 세대에서 관찰과 일치" : okNow ? "이 세대에서는 일치하지만 다른 세대에서 어긋남" : "이 세대의 관찰과 어긋남 → 제외";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { m = b.dataset.m; update(); }));
  sG.addEventListener("input", update); update();
})();
