/* 카드: 여러 가지 산에 공통으로 들어 있는 것은? — 리트머스 종이 위 이온의 이동 실험 */
(() => {
  const root = document.getElementById("card-is2-ion-migration");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), powB = $(".pow"), flipB = $(".flip"), resetB = $(".reset");
  const nPaper = $(".paper"), nDir = $(".dir"), nIon = $(".ion"), msg = $(".msg");

  // 이온 이동도 (25 °C, 10⁻⁸ m²/(V·s)) — H⁺ 36.2, OH⁻ 20.5, Na⁺ 5.19, Cl⁻ 7.91 등
  const S = {
    hcl: { name: "염산 HCl", cat: ["H⁺", 36.2], an: ["Cl⁻", 7.91], kind: "acid", str: 1 },
    h2so4: { name: "묽은 황산 H₂SO₄", cat: ["H⁺", 36.2], an: ["SO₄²⁻", 8.3], kind: "acid", str: 1 },
    ch3cooh: { name: "아세트산 CH₃COOH", cat: ["H⁺", 36.2], an: ["CH₃COO⁻", 4.24], kind: "acid", str: 0.3 },
    naoh: { name: "수산화 나트륨 NaOH", cat: ["Na⁺", 5.19], an: ["OH⁻", 20.5], kind: "base", str: 1 },
    koh: { name: "수산화 칼륨 KOH", cat: ["K⁺", 7.62], an: ["OH⁻", 20.5], kind: "base", str: 1 },
    nacl: { name: "염화 나트륨 NaCl", cat: ["Na⁺", 5.19], an: ["Cl⁻", 7.91], kind: "salt", str: 1 },
  };
  let key = "hcl", on = false, t = 0.45, leftNeg = true;

  const { ctx, size } = fit(cv, () => draw());
  const BLUE = "#5b7fc0", RED = "#d05a5a";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = S[key], ah = h * 0.54;
    const x0 = 44, x1 = w - 44, cx = (x0 + x1) / 2, L = (x1 - x0) / 2 - 8;
    // 거름종이 (질산 칼륨 수용액에 적심)
    ctx.fillStyle = "#eef0ea"; ctx.fillRect(x0 - 6, 22, x1 - x0 + 12, ah - 36);
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 - 5.5, 22.5, x1 - x0 + 11, ah - 37);
    // 전극
    const pol = (left) => (left ? leftNeg : !leftNeg) ? "−" : "+";
    for (const [x, left] of [[x0 - 18, true], [x1 + 18, false]]) {
      ctx.fillStyle = "#555"; ctx.fillRect(x - 5, 16, 10, ah - 24);
      ctx.font = `700 18px ${F.mono}`; ctx.fillStyle = pol(left) === "−" ? "#3f6fb0" : C.warn; ctx.textAlign = "center";
      ctx.fillText(pol(left), x, ah + 10);
    }
    // 두 리트머스 종이
    const strips = [["푸른색 리트머스", BLUE, 44], ["붉은색 리트머스", RED, ah - 70]];
    const vScale = L / (36.2 * 1.05); // 가장 빠른 H⁺가 끝까지 가는 데 약 1 (상대 시간)
    for (const [lab, base, y] of strips) {
      ctx.fillStyle = base; ctx.globalAlpha = .75; ctx.fillRect(x0, y, x1 - x0, 26); ctx.globalAlpha = 1;
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(lab, x0 + 2, y - 4);
      // 색이 바뀐 부분
      const blue = base === BLUE;
      let ion = null;
      if (blue && s.kind === "acid") ion = s.cat; // H⁺: 푸른 → 붉은
      if (!blue && s.kind === "base") ion = s.an; // OH⁻: 붉은 → 푸른
      if (ion) {
        const toLeft = (ion === s.cat) === leftNeg; // 양이온은 (−)극으로
        const dx = clamp(ion[1] * vScale * t, 0, L) * (toLeft ? -1 : 1);
        const spotW = 16;
        ctx.fillStyle = blue ? RED : BLUE; ctx.globalAlpha = 0.35 + 0.6 * s.str;
        ctx.beginPath(); ctx.ellipse(cx + dx, y + 13, spotW, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    // 가운데 실
    ctx.strokeStyle = "#a08c6a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, 26); ctx.lineTo(cx, ah - 18); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`${s.name}을 적신 실`, cx, ah - 2);

    // 아래: 입자 확대 (모식)
    const py0 = ah + 20, ph = h - py0 - 6;
    ctx.fillStyle = "#f5f6f1"; ctx.fillRect(x0 - 6, py0, x1 - x0 + 12, ph);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("실 주변을 확대한 모식 (물 분자 생략)", x0, py0 + 12);
    let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const nEach = 7;
    for (const [ion, sign] of [[s.cat, 1], [s.an, -1]]) {
      const toLeft = (sign > 0) === leftNeg;
      for (let k = 0; k < nEach; k++) {
        const y = py0 + 24 + rnd() * (ph - 36), jitter = (rnd() - .5) * 60;
        const dx = clamp(jitter + ion[1] * vScale * t * 1.0 * (toLeft ? -1 : 1), -L, L);
        const x = cx + dx;
        const r = ion[0].length > 3 ? 13 : 10;
        const hi = (s.kind === "acid" && sign > 0) || (s.kind === "base" && sign < 0);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = hi ? (sign > 0 ? "#f3c6c6" : "#c7d5f0") : "#e2e3dc"; ctx.fill();
        ctx.strokeStyle = hi ? (sign > 0 ? RED : BLUE) : C.ink3; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = C.ink; ctx.font = `600 ${ion[0].length > 4 ? 8 : 10}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(ion[0], x, y + 3.5);
      }
    }
  }

  function update() {
    const s = S[key];
    powB.textContent = on ? "전원 끄기" : "전원 켜기";
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === key)));
    const negSide = leftNeg ? "왼쪽 (−)극" : "오른쪽 (−)극", posSide = leftNeg ? "오른쪽 (+)극" : "왼쪽 (+)극";
    if (s.kind === "acid") { nPaper.textContent = "푸른색 → 붉은색"; nDir.textContent = t > 0.02 ? `${negSide} 쪽` : "—"; nIon.textContent = t > 0.02 ? "양이온" : "—"; }
    else if (s.kind === "base") { nPaper.textContent = "붉은색 → 푸른색"; nDir.textContent = t > 0.02 ? `${posSide} 쪽` : "—"; nIon.textContent = t > 0.02 ? "음이온" : "—"; }
    else { nPaper.textContent = "변화 없음"; nDir.textContent = "—"; nIon.textContent = "—"; }
    msg.textContent = t < 0.02 ? "전원을 켜고 색이 바뀐 자리가 어느 쪽으로 움직이는지 보세요."
      : s.kind === "acid" ? `붉은 자리가 (−)극으로 갑니다. 색을 바꾸는 입자는 양이온이고, ${s.name.split(" ")[0]}의 양이온은 ${s.cat[0]}입니다.${s.str < 1 ? " 아세트산은 물에서 일부만 이온화해 H⁺가 적어서 색이 옅습니다." : ""}`
      : s.kind === "base" ? `푸른 자리가 (+)극으로 갑니다. 색을 바꾸는 입자는 음이온이고, ${s.name.split(" ")[0]}의 음이온은 ${s.an[0]}입니다.`
      : "Na⁺와 Cl⁻도 움직이지만 리트머스의 색을 바꾸지 못합니다. 이온이 움직인다고 모두 산성이나 염기성을 띠지는 않습니다.";
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.s; t = 0; on = false; update(); }));
  powB.addEventListener("click", () => { on = !on; if (on && t >= 1) t = 0; update(); });
  flipB.addEventListener("click", () => { leftNeg = !leftNeg; t = 0; update(); });
  resetB.addEventListener("click", () => { t = 0; on = false; update(); });
  update();
  loop(cv, (dt) => { if (!on) return; t = Math.min(1, t + dt / 8); if (t >= 1) on = false; update(); });
})();
