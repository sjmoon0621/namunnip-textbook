/* 카드: 같은 산화제를 써도 어떤 알코올은 산화되고 어떤 알코올은 그대로일까? — 작용기 탄소의 산화수 사다리 */
(() => {
  const root = document.getElementById("card-adchem-oxlevel");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  /* 상태: [식, 이름, 작용기 탄소에 붙은 H 수, O 결합 수, C 수, 작용기 분류] */
  const SER = [
    [["CH₃OH", "메탄올", 3, 1, 0, "알코올"], ["HCHO", "폼알데하이드", 2, 2, 0, "알데하이드"], ["HCOOH", "폼산", 1, 3, 0, "카복실산"], ["CO₂", "이산화 탄소", 0, 4, 0, "—"]],
    [["CH₃CH₂OH", "에탄올", 2, 1, 1, "1차 알코올"], ["CH₃CHO", "아세트알데하이드", 1, 2, 1, "알데하이드"], ["CH₃COOH", "아세트산", 0, 3, 1, "카복실산"]],
    [["(CH₃)₂CHOH", "2-프로판올", 1, 1, 2, "2차 알코올"], ["(CH₃)₂CO", "아세톤", 0, 2, 2, "케톤"]],
    [["(CH₃)₃COH", "2-메틸-2-프로판올", 0, 1, 3, "3차 알코올"]],
  ];
  /* 산화 반쪽 반응식 (i → i+1) */
  const HALF = [
    ["CH₃OH → HCHO + 2H⁺ + 2e⁻", "HCHO + H₂O → HCOOH + 2H⁺ + 2e⁻", "HCOOH → CO₂ + 2H⁺ + 2e⁻"],
    ["CH₃CH₂OH → CH₃CHO + 2H⁺ + 2e⁻", "CH₃CHO + H₂O → CH₃COOH + 2H⁺ + 2e⁻"],
    ["(CH₃)₂CHOH → (CH₃)₂CO + 2H⁺ + 2e⁻"],
    [],
  ];
  let r = 1, i = 0, last = "";
  const ox = (s) => s[3] - s[2];
  const sgn = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SER[r][i];
    /* 산화수 눈금 */
    const L = 30, R = w - 30, y0 = 52, X = (v) => L + (v + 4) / 8 * (R - L);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, y0); ctx.lineTo(R, y0); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let v = -4; v <= 4; v++) { ctx.fillRect(X(v) - .5, y0 - 4, 1, 8); ctx.fillText(sgn(v), X(v), y0 + 18); }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("← 환원된 상태", L, 16); ctx.textAlign = "right"; ctx.fillText("산화된 상태 →", R, 16);
    ctx.textAlign = "center"; ctx.fillText("작용기 탄소의 산화수", w / 2, 16);
    SER[r].forEach((st, k) => {
      const x = X(ox(st)), on = k === i;
      ctx.fillStyle = on ? C.forest : k < i ? C.sprout : C.paper; ctx.strokeStyle = on ? C.forest : C.ink3; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y0, on ? 8 : 6, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `${on ? "600 " : ""}10.5px ${F.sans}`; ctx.fillText(st[1], x, y0 - 14 - (k % 2 && !on ? 0 : 0));
    });
    if (SER[r].length > 1) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(ox(SER[r][0])), y0 + 26); ctx.lineTo(X(ox(SER[r][SER[r].length - 1])), y0 + 26); ctx.stroke(); ctx.setLineDash([]);
    }
    /* 작용기 탄소 */
    const cx = w * 0.3, cy = h * 0.66, rr = Math.min(w, h) * 0.17;
    const oList = s[3] === 1 ? [1] : s[3] === 2 ? [2] : s[3] === 3 ? [2, 1] : [2, 2];
    const parts = [...Array(s[2]).fill(["H", 1]), ...oList.map((o) => ["O", o]), ...Array(s[4]).fill(["C", 1])];
    const col = { H: "#3f6fa3", O: C.apple, C: C.ink2 };
    parts.forEach(([p, o], k) => {
      const th = -Math.PI / 2 + k * 2 * Math.PI / parts.length, x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr;
      const nx = -Math.sin(th), ny = Math.cos(th);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      (o === 2 ? [-3.5, 3.5] : [0]).forEach((d) => { ctx.beginPath(); ctx.moveTo(cx + Math.cos(th) * 14 + nx * d, cy + Math.sin(th) * 14 + ny * d); ctx.lineTo(x - Math.cos(th) * 13 + nx * d, y - Math.sin(th) * 13 + ny * d); ctx.stroke(); });
      ctx.fillStyle = col[p]; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(p, x, y + 4);
      const v = p === "H" ? "−1" : p === "O" ? "+" + o : "0";
      ctx.fillStyle = col[p]; ctx.font = `600 11px ${F.mono}`; ctx.fillText(v, x + Math.cos(th) * 25, y + Math.sin(th) * 25 + 4);
    });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("C", cx, cy + 4.5);
    /* 오른쪽 글 */
    const tx = w * 0.56; ctx.textAlign = "left";
    ctx.fillStyle = C.ink; ctx.font = `600 ${Math.min(22, w * 0.045)}px ${F.sans}`; ctx.fillText(s[0], tx, h * 0.5);
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(`${s[1]} · ${s[5]}`, tx, h * 0.5 + 22);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.fillText(`산화수 = (+${s[3]}) + (${s[2] ? "−" + s[2] : "0"}) = ${sgn(ox(s))}`, tx, h * 0.5 + 46);
    ctx.fillStyle = s[2] > 0 ? C.forest : C.warn; ctx.font = `12px ${F.sans}`;
    ctx.fillText(s[2] > 0 ? `작용기 탄소의 C–H: ${s[2]}개` : "작용기 탄소의 C–H: 없음", tx, h * 0.5 + 68);
  }
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === r)));
    const s = SER[r][i], m = $(".msg"), canOx = i < SER[r].length - 1;
    let t = last;
    if (!t) t = `${s[1]}의 작용기 탄소 산화수는 ${sgn(ox(s))}입니다.`;
    if (!canOx && s[2] === 0 && s[3] < 4) t += ` 이 탄소에는 H가 없어 더 산화하려면 C–C 결합을 끊어야 합니다.`;
    if (s[5] === "알데하이드" || s[0] === "HCOOH") t += " 은거울 반응·펠링 반응: 양성.";
    if (s[5] === "케톤") t += " 은거울 반응·펠링 반응: 음성.";
    m.textContent = t;
    $(".ox").disabled = !canOx; $(".red").disabled = i === 0;
    draw();
  }
  $(".ox").addEventListener("click", () => {
    if (i >= SER[r].length - 1) return;
    const h = HALF[r][i]; i++;
    last = `산화되었습니다 (산화수 ${sgn(ox(SER[r][i - 1]))} → ${sgn(ox(SER[r][i]))}, 전자 2개 잃음). 다이크로뮴산 이온 1개(전자 6개)가 이 단계를 3번 일으킵니다.`;
    $(".half").textContent = h; update();
  });
  $(".red").addEventListener("click", () => {
    if (i === 0) return;
    const from = SER[r][i]; i--;
    const reag = from[5] === "카복실산" ? "LiAlH₄ 같은 강한 환원제가 필요합니다(실제로는 알코올까지 환원됨)" : from[0] === "CO₂" ? "실험실에서는 어렵고, 생물은 광합성에서 이 일을 합니다" : "NaBH₄ 또는 H₂(Ni·Pt 촉매)";
    last = `환원되었습니다 (산화수 ${sgn(ox(from))} → ${sgn(ox(SER[r][i]))}, 전자 2개 얻음). 환원제: ${reag}.`;
    $(".half").textContent = HALF[r][i] ? "역반응: " + HALF[r][i] : ""; update();
  });
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = +b.dataset.r; i = 0; last = ""; $(".half").textContent = ""; update(); }));
  update();
})();
