/* 카드: 에너지가 필요한 반응을 세포는 어떻게 일으킬까? — 에너지 준위 도표. 글루타민 합성(+14.2)과 ATP 가수 분해(−30.5)의 짝짓기, 효소는 언덕만 낮춘다 */
(() => {
  const root = document.getElementById("card-cell-coupling");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), couple = $(".couple"), enz = $(".enz");
  const nG = $(".n-g"), nK = $(".n-k"), nS = $(".n-s");
  const R = {
    gln: { dG: 14.2, left: "글루탐산 + NH₃", right: "글루타민 + H₂O", kind: "동화 작용", scale: 50, ea: 30 },
    resp: { dG: -2870, left: "포도당 + 6O₂", right: "6CO₂ + 6H₂O", kind: "이화 작용", scale: 3400, ea: 500 },
    photo: { dG: 2870, left: "6CO₂ + 6H₂O", right: "포도당 + 6O₂", kind: "동화 작용", scale: 3400, ea: 500 },
  };
  const ATP = -30.5;
  let key = "gln";
  const total = () => R[key].dG + (key === "gln" && couple.checked ? ATP : 0);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = R[key], cp = key === "gln" && couple.checked, dG = total();
    const top = 40, bot = h - 44, mid = (top + bot) / 2;
    // 기준: 반응물 = 0, 위아래 여유
    const hi = Math.max(0, r.dG, dG) + r.ea * (enz.checked ? 0.45 : 1) + (cp ? 0 : 0), lo = Math.min(0, r.dG, dG, cp ? ATP : 0);
    const span = Math.max(hi - lo, 1) * 1.15;
    const Y = (e) => bot - (e - lo) / span * (bot - top) - 10;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, top - 10); ctx.lineTo(40, bot); ctx.stroke();
    ctx.save(); ctx.translate(18, mid); ctx.rotate(-Math.PI / 2); ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("자유 에너지 (kJ/mol) →", 0, 0); ctx.restore();
    const x0 = 60, x1 = w - 30;
    // 반응 경로 곡선
    const path = (e0, e1, ea, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = i / 100, x = x0 + t * (x1 - x0);
        let e;
        if (t < 0.2) e = e0; else if (t > 0.8) e = e1;
        else { const u = (t - 0.2) / 0.6; e = e0 + (e1 - e0) * (3 * u * u - 2 * u * u * u) + Math.sin(Math.PI * u) * (ea + Math.max(0, e1 - e0) * 0.3); }
        i ? ctx.lineTo(x, Y(e)) : ctx.moveTo(x, Y(e));
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    path(0, dG, r.ea * (enz.checked ? 1 : 0.45), "#b9bab4", 1.4, [4, 4]);   // 비교용: 반대 상태
    path(0, dG, r.ea * (enz.checked ? 0.45 : 1), cp ? C.forest : C.ink, 2.6);
    // 준위 표시
    const lab = (x, e, t, col, al) => { ctx.fillStyle = col; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = al; ctx.fillText(t, x, Y(e) - 7); };
    lab(x0, 0, cp ? r.left + " + ATP" : r.left, C.ink, "left");
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(cp ? r.right + " + ADP + Pᵢ" : r.right, x1 - 24, dG < 0 ? Y(dG) + 18 : Y(dG) - 7);
    // ΔG 화살표
    const ax = x1 - 14;
    ctx.strokeStyle = dG < 0 ? C.forest : C.warn; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2;
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * 0.8, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(ax, Y(0)); ctx.lineTo(ax, Y(dG)); ctx.stroke();
    const d = dG < 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(ax, Y(dG)); ctx.lineTo(ax - 5, Y(dG) - d * 8); ctx.lineTo(ax + 5, Y(dG) - d * 8); ctx.closePath(); ctx.fill();
    ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`ΔG = ${dG > 0 ? "+" : ""}${dG.toFixed(1)}`, ax - 10, (Y(0) + Y(dG)) / 2 + 4);
    // 짝짓기: 두 반응 막대
    if (key === "gln") {
      const bx = x0 + 6, by = bot + 22;
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      ctx.fillText(cp ? "글루타민 합성 +14.2  +  ATP 가수 분해 −30.5  =  −16.3 kJ/mol" : "짝짓지 않으면 +14.2 kJ/mol: 에너지를 흡수해야 함", bx, by);
    } else if (key === "photo") {
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      ctx.fillText("필요한 에너지는 빛에서: 빛 → ATP·NADPH → 포도당 합성", x0 + 6, bot + 22);
    } else {
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      ctx.fillText("방출된 에너지의 일부는 ATP에, 나머지는 열로", x0 + 6, bot + 22);
    }
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(enz.checked ? "점선: 효소가 없을 때의 언덕" : "효소 없음: 언덕이 높아 매우 느림 (점선: 효소 있을 때)", (x0 + x1) / 2, top - 16);
  }
  function update() {
    const dG = total();
    nG.textContent = `${dG > 0 ? "+" : ""}${Math.abs(dG) > 100 ? dG.toFixed(0) : dG.toFixed(1)} kJ/mol`;
    nK.textContent = R[key].kind + (key === "gln" && couple.checked ? " + ATP 분해" : "");
    nS.textContent = dG < 0 ? "예 (에너지 방출)" : "아니요 (에너지 흡수)";
    nS.classList.toggle("bad", dG > 0); nS.classList.toggle("good", dG < 0);
    couple.closest("label").style.opacity = key === "gln" ? 1 : 0.4; couple.disabled = key !== "gln";
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.r === key ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.r; update(); }));
  [couple, enz].forEach((el) => el.addEventListener("change", update));
  update();
})();
