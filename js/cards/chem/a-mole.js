/* 카드: 원자 몇 개를 묶어야 원자량이 그대로 g이 될까? — 개수 축과 질량 축(로그) */
(() => {
  const root = document.getElementById("card-chem-mole");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN = $(".n"), oN = $(".n-out"), snap = $(".snap");
  const dN = $(".v-n"), dMol = $(".v-mol"), dMass = $(".v-mass");

  const NA = 6.02214076e23, U = 1.66053907e-24; // 1 u (g)
  const EL = [
    { s: "H", m: 1.008, c: "#8d8d92" },
    { s: "C", m: 12.011, c: C.ink },
    { s: "O", m: 15.999, c: C.apple },
    { s: "Fe", m: 55.845, c: "#a8642f" },
    { s: "Au", m: 196.97, c: C.amber },
  ];
  let pick = 1;

  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => (n < 0 ? "⁻" : "") + String(Math.abs(n)).split("").map((d) => SUP[+d]).join("");
  const sci = (x, d = 2) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(x) + 1e-9), m = x / 10 ** e;
    if (e >= -2 && e <= 3) return x >= 100 ? x.toFixed(0) : x.toPrecision(3);
    return `${m.toFixed(d)}×10${sup(e)}`;
  };
  const gram = (x) => x >= 0.01 ? `${x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : x.toFixed(0)} g` : `${sci(x)} g`;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lg = +sN.value, N = 10 ** lg;
    const small = w < 520;
    const x0 = small ? 14 : 22, pw = w - x0 * 2;
    const L0 = -24, L1 = 3, d = pw / (L1 - L0);             // 질량 축: 10⁻²⁴ g ~ 10³ g
    const XM = (lm) => x0 + (lm - L0) * d;
    const lmC = Math.log10(EL[1].m * U);
    const XN = (ln) => XM(ln + lmC);                      // 개수 축은 탄소가 바로 아래에 오도록 맞춘다
    const yN = h * 0.24, yM = h * 0.66;

    // ── 개수 축
    ctx.font = `${small ? 10 : 11}px ${F.mono}`;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(XN(0), yN); ctx.lineTo(XN(25), yN); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("원자의 개수 N", XN(0), yN - 30);
    const nTicks = [[0, "1개"], [3, "천"], [6, "백만"], [12, "10¹²"], [18, "10¹⁸"], [Math.log10(NA), "6.02×10²³"]];
    ctx.textAlign = "center";
    for (const [v, lab] of nTicks) {
      const x = XN(v);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x, yN - 4); ctx.lineTo(x, yN + 4); ctx.stroke();
      if (!small || v % 6 === 0 || v > 23) { ctx.fillStyle = v > 23 ? C.forest : C.ink3; ctx.fillText(lab, x, yN - 10); }
    }

    // ── 질량 축
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(XM(L0), yM); ctx.lineTo(XM(L1), yM); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("질량 (g)", XM(L0), yM - 12);
    ctx.textAlign = "center";
    for (let e = L0; e <= L1; e += 3) {
      const x = XM(e);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x, yM - 4); ctx.lineTo(x, yM + 4); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.fillText(e === 0 ? "1" : e === 3 ? "1000" : `10${sup(e)}`, x, yM + 17);
    }
    // 전자저울로 잴 수 있는 범위 (0.01 g 이상)
    ctx.fillStyle = "rgba(116,171,102,.14)";
    ctx.fillRect(XM(-2), yM - 26, XM(L1) - XM(-2), 26);
    ctx.fillStyle = C.forest; ctx.textAlign = "left";
    ctx.fillText(small ? "저울로 잼" : "학교 전자저울로 잴 수 있음", XM(-2) + 4, yM - 31);

    // ── 원소마다: N개의 질량
    const marks = EL.map((el, i) => ({ el, i, lm: lg + Math.log10(el.m * U) }));
    for (const { el, i, lm } of marks) {
      if (lm < L0 - 0.2 || lm > L1 + 0.2) continue;
      const on = i === pick;
      ctx.strokeStyle = on ? el.c : "rgba(141,141,146,.45)"; ctx.lineWidth = on ? 1.6 : 1;
      ctx.setLineDash(on ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(XN(lg), yN + 6); ctx.lineTo(XM(lm), yM - 6); ctx.stroke();
      ctx.setLineDash([]);
    }
    // 개수 표시
    ctx.beginPath(); ctx.arc(XN(lg), yN, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // 질량 표시: 점은 제자리, 이름표는 겹치지 않게 옆으로 벌려 놓고 가는 선으로 잇는다
    const vis = marks.filter(({ lm }) => lm >= L0 - 0.2 && lm <= L1 + 0.2);
    const gap = small ? 22 : 28, lx = vis.map(({ lm }) => XM(lm));
    for (let it = 0; it < 30; it++) for (let j = 1; j < lx.length; j++) {
      const o = gap - (lx[j] - lx[j - 1]); if (o > 0) { lx[j - 1] -= o / 2; lx[j] += o / 2; }
    }
    const ly = yM + (small ? 36 : 40);
    vis.forEach(({ el, i, lm }, j) => {
      const x = XM(lm), on = i === pick;
      ctx.strokeStyle = "rgba(141,141,146,.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, yM + 22); ctx.lineTo(lx[j], ly - 11); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, yM, on ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = el.c; ctx.fill();
      if (on) { ctx.strokeStyle = C.card; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.font = `${on ? "600 " : ""}${small ? 10.5 : 12}px ${F.mono}`;
      ctx.fillStyle = on ? C.ink : C.ink2; ctx.textAlign = "center";
      ctx.fillText(el.s, lx[j], ly);
    });

    // 딱 1몰일 때: 원자량 = g
    const atNA = Math.abs(lg - Math.log10(NA)) < 0.004;
    ctx.textAlign = "left"; ctx.font = `${small ? 11 : 12.5}px ${F.sans}`;
    const el = EL[pick];
    ctx.fillStyle = atNA ? C.forest : C.ink2;
    const line = atNA
      ? `${el.s} 원자 6.02×10²³개 = ${el.m < 100 ? el.m.toFixed(el.m < 20 ? 3 : 2) : el.m.toFixed(1)} g — 원자량과 같은 숫자`
      : `${el.s} 원자 ${sci(N)}개의 질량 = ${gram(N * el.m * U)}`;
    ctx.fillText(line, x0, h - (small ? 10 : 14));
  }

  function update() {
    const lg = +sN.value, N = 10 ** lg;
    oN.textContent = sci(N);
    dN.textContent = sci(N);
    dMol.textContent = `${sci(N / NA)} mol`;
    dMass.textContent = gram(N * EL[pick].m * U);
    draw();
  }
  root.querySelectorAll("[data-el]").forEach((b) => b.addEventListener("click", () => {
    pick = +b.dataset.el;
    root.querySelectorAll("[data-el]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  snap.addEventListener("click", () => { sN.value = Math.log10(NA).toFixed(4); update(); });
  sN.addEventListener("input", update);
  update();
})();
