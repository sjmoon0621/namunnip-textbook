/* 카드: 에너지는 보존되는데 왜 아껴야 할까? — 발전소에서 전등까지의 에너지 흐름 (대략값) */
(() => {
  const root = document.getElementById("card-is2-efficiency");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nTot = $(".tot"), nNeed = $(".need"), nHeat = $(".heat"), msg = $(".f-msg");

  // 단계별 효율 (대략값)
  const PLANT = { coal: ["석탄 화력", 0.38, "석탄"], lng: ["LNG 복합", 0.55, "천연가스"], nuke: ["원자력", 0.34, "핵연료"], pv: ["태양광", 0.20, "햇빛"] };
  const GRID = 0.96;
  const LAMP = { inc: ["백열전구", 0.05], fl: ["형광등", 0.20], led: ["LED", 0.40] };
  let plant = "coal", lamp = "inc";

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = PLANT[plant], L = LAMP[lamp];
    const e1 = P[1], e2 = e1 * GRID, e3 = e2 * L[1];
    const stages = [
      { name: P[2], v: 1 },
      { name: "전기", v: e1, lost: 1 - e1, lostName: "발전소의 열" },
      { name: "집에 온 전기", v: e2, lost: e1 - e2, lostName: "전선의 열" },
      { name: "빛", v: e3, lost: e2 - e3, lostName: "전등의 열" },
    ];
    const top = 34, maxH = h * 0.42, S = maxH;   // 폭 1 = maxH 픽셀
    const x0 = 16, x1 = w - 16, n = stages.length, colW = (x1 - x0) / n;
    ctx.font = `10.5px ${F.mono}`;
    // 본 흐름: 위쪽 정렬, 단계마다 좁아진다. 잃은 몫은 아래로 꺾여 내려간다.
    for (let i = 1; i < n; i++) {
      const s0 = stages[i - 1], s1 = stages[i];
      const xa = x0 + (i - 1) * colW + colW * 0.5, xb = x0 + i * colW + colW * 0.5 - 8;
      const hA = s0.v * S, hB = s1.v * S, hL = s1.lost * S;
      // 이어지는 몫
      ctx.fillStyle = i === n - 1 ? "rgba(224,160,42,.85)" : "rgba(59,124,42,.75)";
      ctx.beginPath(); ctx.moveTo(xa, top); ctx.bezierCurveTo((xa + xb) / 2, top, (xa + xb) / 2, top, xb, top);
      ctx.lineTo(xb, top + hB); ctx.bezierCurveTo((xa + xb) / 2, top + hB, (xa + xb) / 2, top + hB, xa, top + hB); ctx.closePath(); ctx.fill();
      // 잃은 몫: 아래로
      if (hL > 0.3) {
        const bx = (xa + xb) / 2, by = h - 34;
        const ym = top + (hA + hB) / 2, cxL = bx - hL / 2;
        ctx.strokeStyle = "rgba(181,83,47,.55)"; ctx.lineWidth = hL; ctx.lineCap = "butt";
        ctx.beginPath(); ctx.moveTo(xa, ym); ctx.quadraticCurveTo(cxL, ym, cxL, Math.min(by, ym + hL / 2 + 30)); ctx.lineTo(cxL, by); ctx.stroke();
        ctx.fillStyle = C.warn; ctx.textAlign = "center";
        ctx.fillText(`${s1.lostName}`, bx - hL / 2, by + 13);
        ctx.fillText(`${Math.round(s1.lost * 100)}`, bx - hL / 2, by + 26);
      }
    }
    // 단계 이름과 값
    stages.forEach((s, i) => {
      const x = x0 + i * colW + colW * 0.5;
      ctx.fillStyle = C.ink; ctx.textAlign = i === 0 ? "left" : i === n - 1 ? "right" : "center";
      const xt = i === 0 ? x0 : i === n - 1 ? x1 : x;
      ctx.font = `600 11px ${F.sans}`; ctx.fillText(s.name, xt, top - 16);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText(s.v * 100 >= 10 ? Math.round(s.v * 100) : (s.v * 100).toFixed(1), xt, top - 4);
    });
    // 첫 기둥
    ctx.fillStyle = C.ink2; ctx.fillRect(x0 + colW * 0.5 - 6, top, 6, S);
    ctx.textAlign = "left";
  }

  function update() {
    const P = PLANT[plant], L = LAMP[lamp], tot = P[1] * GRID * L[1];
    nTot.textContent = `${(tot * 100).toFixed(tot < 0.1 ? 1 : 0)}%`;
    nNeed.textContent = `${(1 / tot).toFixed(0)} J`;
    nHeat.textContent = `${(100 - tot * 100).toFixed(1)}`;
    msg.textContent = plant === "pv"
      ? "햇빛은 연료비가 들지 않으므로 효율이 낮아도 괜찮을까요? 효율이 낮으면 같은 전기를 얻는 데 더 넓은 땅과 더 많은 패널이 필요합니다."
      : `${P[2]} 에너지 100 가운데 빛이 되는 것은 ${(tot * 100).toFixed(1)}입니다. 나머지도 사라지지 않고 모두 주변을 데우는 열이 됩니다. 들어간 양과 나온 양의 합은 언제나 100입니다.`;
    root.querySelectorAll("[data-plant]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.plant === plant));
    root.querySelectorAll("[data-lamp]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lamp === lamp));
    draw();
  }
  root.querySelectorAll("[data-plant]").forEach((b) => b.addEventListener("click", () => { plant = b.dataset.plant; update(); }));
  root.querySelectorAll("[data-lamp]").forEach((b) => b.addEventListener("click", () => { lamp = b.dataset.lamp; update(); }));
  update();
})();
