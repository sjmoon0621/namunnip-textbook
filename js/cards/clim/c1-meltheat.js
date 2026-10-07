/* 카드: 같은 열로 바다를 데울 때와 얼음을 녹일 때 해수면은 얼마나 오를까? — 지구 에너지 불균형의 배분과 해수면 (어림 계산) */
(() => {
  const root = document.getElementById("card-clim-meltheat");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const AE = 5.10e14, AO = 3.62e14, YR = 3.156e7, RHO = 1025, CP = 3990, LF = 3.34e5;
  // 바닷물(염분 35, 해면 압력)의 열팽창 계수 근삿값 (/°C)
  const ALPHA = [[0, 0.53e-4], [5, 1.14e-4], [10, 1.67e-4], [15, 2.15e-4], [20, 2.57e-4], [25, 2.97e-4]];
  const alpha = (T) => { for (let i = 1; i < ALPHA.length; i++) if (T <= ALPHA[i][0]) { const [t0, a0] = ALPHA[i - 1], [t1, a1] = ALPHA[i]; return a0 + (a1 - a0) * (T - t0) / (t1 - t0); } return ALPHA[ALPHA.length - 1][1]; };
  const COL = { ocean: "#2f62a8", ice: "#7fb6d6", land: "#9a8f7a", air: "#d0a020", th: "#c4462f", melt: "#7fb6d6" };
  const a = fit($(".mh-cv"), () => draw());

  function calc() {
    const N = +$(".eei").value, ice = +$(".ice").value / 100, T = +$(".tw").value;
    const E = N * AE * YR, land = 0.05, air = 0.01, ocean = Math.max(0, 1 - ice - land - air);
    const al = alpha(T);
    const th = al * E * ocean / (RHO * CP) / AO * 1000;
    const gt = E * ice / LF / 1e12, melt = gt / 362;
    const perJ = (1 / LF / 1000) / (al / (RHO * CP));
    return { N, ice, T, E, ocean, land, air, al, th, gt, melt, perJ };
  }

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc();
    const top = 40, bh = h - top - 40, bw = Math.min(90, w * 0.2);
    const x1 = w * 0.2, x2 = w * 0.62;
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    ctx.fillText("지구가 더 얻은 에너지가 간 곳", x1 + bw / 2, top - 14);
    ctx.fillText("그 결과 오른 해수면", x2 + bw / 2, top - 14);
    // 에너지 막대
    const segE = [["바다", r.ocean, COL.ocean], ["얼음", r.ice, COL.ice], ["육지", r.land, COL.land], ["대기", r.air, COL.air]];
    let y = top + bh;
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    const labs = [];
    segE.forEach(([t, f, c]) => {
      const hh = f * bh; y -= hh; ctx.fillStyle = c; ctx.fillRect(x1, y, bw, hh);
      if (f > 0) labs.push([`${t} ${Math.round(f * 100)} %`, y + hh / 2 + 4]);
    });
    labs.reverse();
    let prev = top - 2;
    labs.forEach(([t, yy]) => { const q = Math.max(yy, prev + 13); prev = q; ctx.fillStyle = C.ink2; ctx.fillText(t, x1 + bw + 6, q); });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(x1 + 0.5, top + 0.5, bw, bh);
    // 해수면 막대 (mm/년, 눈금 0–5)
    const smax = 5, S = (v) => v / smax * bh;
    let y2 = top + bh;
    [["열팽창", r.th, COL.th], ["얼음 녹은 물", r.melt, COL.melt]].forEach(([t, v, c]) => {
      const hh = Math.min(S(v), y2 - top); y2 -= hh; ctx.fillStyle = c; ctx.fillRect(x2, y2, bw, hh);
      ctx.fillStyle = C.ink2; ctx.fillText(`${t} ${v.toFixed(2)} mm`, x2 + bw + 6, Math.max(top + 10, y2 + hh / 2 + 4));
    });
    ctx.strokeStyle = C.rule; ctx.beginPath();
    for (let k = 0; k <= smax; k++) { const yy = top + bh - S(k) + 0.5; ctx.moveTo(x2 - 4, yy); ctx.lineTo(x2, yy); }
    ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let k = 0; k <= smax; k++) ctx.fillText(String(k), x2 - 6, top + bh - S(k) + 3);
    ctx.textAlign = "center"; ctx.fillText("mm/년", x2 + bw / 2, top + bh + 16);
    ctx.fillText(`한 해 ${(r.E / 1e21).toFixed(1)} ZJ`, x1 + bw / 2, top + bh + 16);
    // 관측 비교 눈금 (2015–2024 위성 관측 약 3.7 mm/년)
    const yo = top + bh - S(3.7);
    ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x2 - 4, yo); ctx.lineTo(x2 + bw + 4, yo); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.textAlign = "right"; ctx.font = `10px ${F.sans}`; ctx.fillText("관측 약 3.7", x2 - 18, yo + 3);
  }

  function update() {
    const r = calc();
    $(".eei-out").textContent = r.N.toFixed(2); $(".ice-out").textContent = (r.ice * 100).toFixed(0); $(".tw-out").textContent = r.T.toFixed(0);
    $(".n-a").textContent = `${(r.al * 1e4).toFixed(2)}×10⁻⁴ /°C`;
    $(".n-t").textContent = `${r.th.toFixed(2)} mm/년`;
    $(".n-m").textContent = `${r.melt.toFixed(2)} mm/년`;
    $(".n-r").textContent = `${Math.round(r.perJ)}배`;
    $(".verdict").textContent = `에너지의 ${Math.round(r.ocean * 100)} %를 받은 바다는 열팽창으로 해수면을 ${r.th.toFixed(2)} mm 올리고, ${Math.round(r.ice * 100)} %만 받은 얼음은 약 ${Math.round(r.gt)} Gt이 녹아 ${r.melt.toFixed(2)} mm를 올립니다. 같은 1 J로 비교하면 육지 얼음을 녹이는 쪽이 ${r.T} °C 바닷물을 데우는 쪽보다 해수면을 약 ${Math.round(r.perJ)}배 더 올립니다.`;
    draw();
  }
  root.querySelectorAll(".eei, .ice, .tw").forEach((el) => el.addEventListener("input", update));
  $(".pres").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-t]"); if (!bt) return;
    $(".tw").value = bt.dataset.t; update();
  });
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".tw").value = "4"; update(); }
})();
