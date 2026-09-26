/* 카드: 산화는 산소와의 반응일까, 전자의 이동일까? — 반응별 전자 이동 보기 */
(() => {
  const root = document.getElementById("card-is2-redox-electron");
  if (!root) return;
  const { C, F, clamp, ease, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), pS = $(".prog"), playB = $(".play");
  const nLost = $(".lost"), nGain = $(".gain"), nO = $(".ocrit"), eq = $(".eq"), oMsg = $(".omsg"), eMsg = $(".emsg");

  // 잃는 쪽(d)과 얻는 쪽(a). before/after는 입자 표시, e는 한 입자가 주고받는 전자 수
  const R = {
    mgo: { eq: "2Mg + O₂ → 2MgO", d: { n: 2, e: 2, b: "Mg", a: "Mg²⁺", col: "#9aa3ad" }, a: { n: 2, e: 2, b: "O", a: "O²⁻", col: "#d4493a", bond: "pre" },
      o: "Mg는 산소를 얻었으므로 산화, 산소는 판정 기준 자체라 따로 말하기 어렵습니다.", oShort: "Mg 산화",
      e: "Mg 원자 2개가 전자를 2개씩 잃고(산화), O 원자 2개가 2개씩 얻습니다(환원)." },
    zncu: { eq: "Zn + Cu²⁺ → Zn²⁺ + Cu", d: { n: 1, e: 2, b: "Zn", a: "Zn²⁺", col: "#8c9aa6" }, a: { n: 1, e: 2, b: "Cu²⁺", a: "Cu", col: "#c46a3a" },
      o: "반응에 산소가 없습니다. 산소 기준으로는 산화인지 환원인지 말할 수 없습니다.", oShort: "판정 불가",
      e: "Zn이 전자 2개를 잃어 Zn²⁺가 되고(산화), Cu²⁺가 그 전자를 받아 Cu가 됩니다(환원)." },
    nacl: { eq: "2Na + Cl₂ → 2NaCl", d: { n: 2, e: 1, b: "Na", a: "Na⁺", col: "#b9a36a" }, a: { n: 2, e: 1, b: "Cl", a: "Cl⁻", col: "#5f9c4f", bond: "pre" },
      o: "반응에 산소가 없습니다. 산소 기준으로는 판정할 수 없습니다.", oShort: "판정 불가",
      e: "Na 원자 2개가 전자를 1개씩 잃고(산화), Cl 원자 2개가 1개씩 얻습니다(환원)." },
    mgh: { eq: "Mg + 2H⁺ → Mg²⁺ + H₂", d: { n: 1, e: 2, b: "Mg", a: "Mg²⁺", col: "#9aa3ad" }, a: { n: 2, e: 1, b: "H⁺", a: "H", col: "#6f8fae", bond: "post" },
      o: "묽은 염산에 마그네슘을 넣는 반응입니다. 산소가 오가지 않아 산소 기준으로는 판정할 수 없습니다.", oShort: "판정 불가",
      e: "Mg가 전자 2개를 잃고(산화), H⁺ 2개가 1개씩 받아 수소 기체 H₂가 됩니다(환원)." },
  };
  let key = "mgo", playing = false;

  const { ctx, size } = fit(cv, () => draw());

  function atomPos(n, i, cx, span) { return n === 1 ? cx : cx - span / 2 + span * i / (n - 1); }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = R[key], p = +pS.value / 100, pe = ease(p);
    const yD = h * 0.28, yA = h * 0.74, rad = Math.min(30, w / 14);
    const span = Math.min(w * 0.42, 220);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("전자를 잃는 쪽", 10, yD - rad - 14);
    ctx.fillText("전자를 얻는 쪽", 10, yA - rad - 14);
    const dPos = Array.from({ length: r.d.n }, (_, i) => atomPos(r.d.n, i, w / 2, span));
    const q = clamp((p - 0.85) / 0.15, 0, 1), qq = clamp(p / 0.15, 0, 1);
    // O₂, Cl₂는 처음에 분자로 붙어 있다가 떨어지고, H⁺는 반응 뒤 H₂로 붙는다
    const aSpan = r.a.bond === "post" ? span * (1 - 0.55 * q) : r.a.bond === "pre" ? span * (0.45 + 0.55 * qq) : span;
    const aPos = Array.from({ length: r.a.n }, (_, i) => atomPos(r.a.n, i, w / 2, aSpan));
    // 원자
    const atom = (x, y, s, col, lab, charge) => {
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fillStyle = col; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(s * .55)}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + s * .2);
      if (charge) { ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.fillText(charge, x + s * .95, y - s * .75); }
    };
    const split = (t) => { const m = t.match(/^([A-Za-z]+)(.*)$/); return [m[1], m[2]]; };
    const dLab = split(p < 0.98 ? r.d.b : r.d.a), aLab = split(p < 0.98 ? r.a.b : r.a.a);
    dPos.forEach((x) => atom(x, yD, rad, r.d.col, dLab[0], dLab[1]));
    aPos.forEach((x) => atom(x, yA, rad * (r.a.b === "H⁺" ? .7 : 1), r.a.col, aLab[0], aLab[1]));
    // 전자: 잃는 쪽의 전자가 얻는 쪽으로 이동
    let k = 0;
    for (let i = 0; i < r.d.n; i++) for (let j = 0; j < r.d.e; j++) {
      const ai = Math.floor(k / r.a.e), aj = k % r.a.e; k++;
      const sx = dPos[i] + (j - (r.d.e - 1) / 2) * 14, sy = yD + rad + 8;
      const ex = aPos[ai] + (aj - (r.a.e - 1) / 2) * 14, ey = yA - rad - 8;
      const t = clamp(pe * 1.15 - (k - 1) * 0.04, 0, 1);
      const x = sx + (ex - sx) * t + Math.sin(t * Math.PI) * 18 * (ai % 2 ? 1 : -1), y = sy + (ey - sy) * t;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `700 9px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("−", x, y + 3);
    }
    // 화살표 라벨
    ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    ctx.fillText(p < 0.02 ? "반응 전" : p > 0.98 ? "반응 후" : "전자 이동 중", w - 10, h / 2 + 4);
  }

  function update() {
    const r = R[key];
    eq.textContent = r.eq;
    const tot = r.d.n * r.d.e, moved = Math.round(tot * clamp(+pS.value / 100, 0, 1));
    nLost.textContent = `${moved}개`; nGain.textContent = `${moved}개`;
    nO.textContent = r.oShort; nO.classList.toggle("bad", r.oShort === "판정 불가");
    oMsg.textContent = r.o; eMsg.textContent = r.e;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === key)));
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.r; pS.value = 0; playing = !NM.reduce; update(); }));
  pS.addEventListener("input", () => { playing = false; update(); });
  playB.addEventListener("click", () => { pS.value = 0; playing = true; update(); });
  update();
  loop(cv, (dt) => {
    if (!playing) return;
    pS.value = Math.min(100, +pS.value + dt * 40);
    if (+pS.value >= 100) playing = false;
    update();
  });
})();
