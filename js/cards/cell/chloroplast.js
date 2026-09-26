/* 카드: 엽록체 속 납작한 주머니는 왜 층층이 쌓여 있을까? — 엽록체 단면 + 틸라코이드 막 확대. 빛의 세기에 따른 스트로마·루멘 pH (대략값, 포화 모식) */
(() => {
  const root = document.getElementById("card-cell-chloroplast");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".light"), oL = $(".l-out"), where = $(".where");
  const nS = $(".n-s"), nLu = $(".n-l"), nA = $(".n-a");
  const INFO = {
    env: "<b>외막과 내막</b>: 엽록체를 둘러싼 두 겹의 막. 광합성 반응은 여기서가 아니라 안쪽의 틸라코이드와 스트로마에서 일어나고, 내막은 당과 인산 같은 물질의 출입을 조절합니다.",
    stroma: "<b>스트로마</b>: 탄소 고정 반응(캘빈 회로)의 효소(루비스코 등)가 있어, 명반응에서 온 ATP와 NADPH로 CO₂를 고정해 당을 만듭니다. 엽록체 DNA와 리보솜, 녹말 알갱이도 여기 있습니다.",
    mem: "<b>틸라코이드 막</b>: 엽록소와 카로티노이드, 광계 Ⅱ·Ⅰ, 전자 전달계, ATP 합성 효소가 박혀 명반응이 일어납니다. 빛에너지로 물을 분해해 O₂를 내고, ATP와 NADPH를 만듭니다.",
    lumen: "<b>틸라코이드 내부</b>: 물이 분해되며 생긴 H⁺와 전자 전달계가 퍼 넣은 H⁺가 모여, 빛을 받으면 산성이 됩니다. 이 H⁺ 농도 차가 ATP 합성의 원동력입니다.",
  };
  let zone = "mem";
  const Lf = () => { const L = +sL.value / 100; return Math.min(1, 1.3 * L / (L + 0.3)); };
  const H = "#b5532f";

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = Lf(), hl = (z) => zone === z;
    // 위: 엽록체 단면
    const cx = w / 2, cy = h * 0.2, rx = w * 0.44, ry = h * 0.15;
    ctx.fillStyle = L > 0 ? `rgba(224,160,42,${0.05 + 0.12 * L})` : "#eceded"; ctx.fillRect(0, 0, w, h * 0.4);
    ctx.fillStyle = hl("stroma") ? "#cfe6c4" : "#e3efdb"; ctx.strokeStyle = hl("env") ? C.warn : C.forest; ctx.lineWidth = hl("env") ? 3 : 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx - 5, ry - 5, 0, 0, 6.29); ctx.stroke();
    // 그라나
    const gx = [-0.62, -0.3, 0.02, 0.34, 0.64];
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx + gx[0] * rx, cy); ctx.lineTo(cx + gx[4] * rx, cy); ctx.stroke();   // 그라나 사이 틸라코이드
    gx.forEach((g, i) => {
      const n = 5 + (i % 2), tw = rx * 0.2, th = 7;
      for (let j = 0; j < n; j++) {
        const y = cy - (n * (th + 2)) / 2 + j * (th + 2) + (i % 2 ? 4 : -2);
        ctx.fillStyle = hl("lumen") ? "#f2c9bf" : "#3b7c2a"; ctx.strokeStyle = hl("mem") ? C.warn : "#245a18"; ctx.lineWidth = hl("mem") ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(cx + g * rx - tw / 2, y, tw, th, 3.5); ctx.fill(); ctx.stroke();
      }
    });
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("그라나 (틸라코이드가 쌓인 것)", cx - rx * 0.62, cy + ry + 16);
    ctx.textAlign = "center"; ctx.fillText("스트로마", cx + rx * 0.5, cy + ry * 0.75);
    // 확대 표시
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.strokeRect(cx + gx[2] * rx - rx * 0.12, cy - 12, rx * 0.24, 14);
    ctx.beginPath(); ctx.moveTo(cx + gx[2] * rx - rx * 0.12, cy + 2); ctx.lineTo(14, h * 0.44); ctx.moveTo(cx + gx[2] * rx + rx * 0.12, cy + 2); ctx.lineTo(w - 14, h * 0.44); ctx.stroke(); ctx.setLineDash([]);
    // 아래: 틸라코이드 막 확대 (위 = 스트로마, 아래 = 틸라코이드 내부)
    const top = h * 0.44, my = h * 0.66, mh = 28, bot = h - 8;
    ctx.fillStyle = hl("stroma") ? "#cfe6c4" : "#e3efdb"; ctx.fillRect(10, top, w - 20, my - mh / 2 - top);
    ctx.fillStyle = hl("lumen") ? "#f2c9bf" : "#f6e3dd"; ctx.fillRect(10, my + mh / 2, w - 20, bot - my - mh / 2);
    ctx.fillStyle = hl("mem") ? "#b9d7a8" : "#cfe0c3"; ctx.fillRect(10, my - mh / 2, w - 20, mh);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("스트로마", 16, top + 14); ctx.fillText("틸라코이드 내부", 16, bot - 6);
    // H+ 점
    let seed = 2; const rnd = () => { const x = Math.sin(seed++ * 71.7) * 43758.5; return x - Math.floor(x); };
    const nLumen = Math.round(6 + 40 * L), nStroma = Math.round(8 - 5 * L);
    ctx.fillStyle = H; ctx.font = `600 9px ${F.sans}`; ctx.textAlign = "center";
    for (let i = 0; i < nLumen; i++) ctx.fillText("H⁺", 40 + rnd() * (w - 70), my + mh / 2 + 36 + rnd() * (bot - my - mh / 2 - 54));
    for (let i = 0; i < nStroma; i++) ctx.fillText("H⁺", 110 + rnd() * (w - 140), top + 22 + rnd() * (my - mh / 2 - top - 30));
    // 단백질
    const P = [["광계 Ⅱ", w * 0.16, "#7fb36b"], ["사이토크롬 복합체", w * 0.38, "#9cc0de"], ["광계 Ⅰ", w * 0.58, "#7fb36b"], ["ATP 합성 효소", w * 0.84, "#f1d9a6"]];
    P.forEach(([t, x, col]) => {
      ctx.fillStyle = col; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(x - 16, my - mh / 2 - 8, 32, mh + 16, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(t, x, my - mh / 2 - 14);
    });
    // 빛 화살표
    if (L > 0.01) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1 + 2 * L;
      [P[0][1], P[2][1]].forEach((x) => { ctx.beginPath(); ctx.moveTo(x - 30, top + 6); ctx.lineTo(x - 8, my - mh / 2 - 22); ctx.stroke(); });
    }
    const a = (x0, y0, x1, y1, wd, col) => { if (wd < 0.8) return; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; const an = Math.atan2(y1 - y0, x1 - x0), hh = 5 + wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(an) * hh, y1 - Math.sin(an) * hh); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(an - 0.45) * hh, y1 - Math.sin(an - 0.45) * hh); ctx.lineTo(x1 - Math.cos(an + 0.45) * hh, y1 - Math.sin(an + 0.45) * hh); ctx.closePath(); ctx.fill(); };
    // 물 분해, H+ 펌프, ATP 합성, NADPH
    ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = L > 0.01 ? "#3f6fa3" : C.ink3; ctx.fillText("H₂O → O₂ + H⁺", P[0][1], my + mh / 2 + 22);
    a(P[1][1] + 22, my - mh / 2 - 6, P[1][1] + 22, my + mh / 2 + 14, 0.6 + 4 * L * (L > 0.01), H);
    a(P[3][1] + 24, my + mh / 2 + 12, P[3][1] + 24, my - mh / 2 - 4, 0.6 + 5 * L * (L > 0.01), H);
    ctx.fillStyle = L > 0.01 ? C.ink : C.ink3; ctx.fillText("ADP + Pᵢ → ATP", P[3][1] - 14, top + 16);
    ctx.fillText("NADP⁺ → NADPH", P[2][1], top + 30);
    // 전자 경로
    ctx.setLineDash([4, 3]); ctx.strokeStyle = L > 0.01 ? "#3f6fa3" : C.ink3; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(P[0][1], my); ctx.lineTo(P[2][1], my); ctx.lineTo(P[2][1] + 4, top + 36); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const L = Lf();
    oL.textContent = sL.value;
    nS.textContent = (7.1 + 0.9 * L).toFixed(1);
    nLu.textContent = (7.1 - 1.8 * L).toFixed(1);
    nA.textContent = L < 0.01 ? "없음" : `${Math.round(L * 100)} %`;
    where.innerHTML = INFO[zone];
    root.querySelectorAll("[data-z]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.z === zone ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-z]").forEach((b) => b.addEventListener("click", () => { zone = b.dataset.z; update(); }));
  sL.addEventListener("input", update);
  update();
})();
