/* 카드: 휴지 전위는 왜 −70 mV 근처일까? — 네른스트 식과 골드만–호지킨–카츠(GHK) 식 */
(() => {
  const root = document.getElementById("card-adbio-ghk");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sKo = $(".ko"), sNa = $(".pna"), sCl = $(".pcl"), sT = $(".tc");
  const oKo = $(".ko-out"), oNa = $(".pna-out"), oCl = $(".pcl-out"), oT = $(".tc-out");
  const nEK = $(".n-ek"), nENa = $(".n-ena"), nV = $(".n-v");

  /* 포유류 뉴런의 대표 농도 (mM) */
  const Ki = 140, Nai = 15, Nao = 145, Cli = 10, Clo = 110;
  const R = 8.314, Fa = 96485;
  let Ko = 5;

  const { ctx, size } = fit(cv, () => draw());
  function state() {
    const T = 273.15 + +sT.value, s = R * T / Fa * 1000; /* mV */
    const pNa = 10 ** +sNa.value, pCl = +sCl.value;
    const EK = s * Math.log(Ko / Ki), ENa = s * Math.log(Nao / Nai), ECl = -s * Math.log(Clo / Cli);
    const V = s * Math.log((Ko + pNa * Nao + pCl * Cli) / (Ki + pNa * Nai + pCl * Clo));
    return { s, pNa, pCl, EK, ENa, ECl, V };
  }
  function arrow(x, y0, y1, col, wid) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wid;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    const dir = Math.sign(y1 - y0), hw = 4 + wid;
    ctx.beginPath(); ctx.moveTo(x, y1 + dir * 2); ctx.lineTo(x - hw, y1 - dir * hw * 1.4); ctx.lineTo(x + hw, y1 - dir * hw * 1.4); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    const st = state();
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 전압 눈금 */
    const vx = 70, vTop = 24, vBot = h - 24;
    const VY = (v) => vTop + (80 - v) / 200 * (vBot - vTop);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(vx, vTop); ctx.lineTo(vx, vBot); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let v = 80; v >= -120; v -= 40) { ctx.fillText(String(v), vx - 6, VY(v) + 3); ctx.beginPath(); ctx.moveTo(vx - 3, VY(v)); ctx.lineTo(vx, VY(v)); ctx.stroke(); }
    ctx.textAlign = "left"; ctx.fillText("mV", vx - 30, vTop - 10);
    const mark = (v, col, lab, dx) => {
      const y = VY(Math.max(-120, Math.min(80, v)));
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(vx, y); ctx.lineTo(vx + 26 + dx, y); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = col; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(lab, vx + 30 + dx, y + 4);
    };
    mark(st.ENa, "#c0504d", `E_Na ${st.ENa.toFixed(0)}`, 0);
    mark(st.EK, "#3f6fa3", `E_K ${st.EK.toFixed(0)}`, 0);
    /* E_Cl이 E_K나 V와 가까우면 겹치지 않게 옆으로 */
    mark(st.ECl, "#7a5ca8", `E_Cl ${st.ECl.toFixed(0)}`, Math.abs(st.ECl - st.EK) < 14 ? 72 : 0);
    const yV = VY(Math.max(-120, Math.min(80, st.V)));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(vx - 2, yV); ctx.lineTo(vx - 14, yV - 6); ctx.lineTo(vx - 14, yV + 6); ctx.closePath(); ctx.fill();
    ctx.font = `bold 12px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`V ${st.V.toFixed(0)}`, vx - 16, yV - 9);
    /* 오른쪽: 막과 이온 흐름 */
    const mx0 = w * 0.5, mx1 = w - 12, my = h * 0.5, mt = 14;
    ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(mx0, my - mt / 2, mx1 - mx0, mt);
    ctx.strokeStyle = C.amber; ctx.strokeRect(mx0, my - mt / 2, mx1 - mx0, mt);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("세포 밖", mx0, 16); ctx.fillText("세포 안", mx0, h - 8);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    const ions = [
      { n: "K⁺", g: 1, E: st.EK, col: "#3f6fa3", o: Ko, i: Ki },
      { n: "Na⁺", g: st.pNa, E: st.ENa, col: "#c0504d", o: Nao, i: Nai },
      { n: "Cl⁻", g: st.pCl, E: st.ECl, col: "#7a5ca8", o: Clo, i: Cli, neg: true },
    ];
    const cw = (mx1 - mx0) / 3;
    ions.forEach((io, k) => {
      const cx = mx0 + cw * (k + 0.5);
      ctx.fillStyle = io.col; ctx.font = `bold 12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(io.n, cx, 36);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText(`${io.o.toFixed(io.o < 10 ? 1 : 0)} mM`, cx, 50);
      ctx.fillText(`${io.i} mM`, cx, h - 26);
      /* GHK 전류식으로 계산한 알짜 전류 (바깥 방향 +). 휴지 상태에서는 세 전류의 합이 0 */
      const u = st.V / st.s, z = io.neg ? -1 : 1, e = Math.exp(-z * u);
      const I = Math.abs(u) < 1e-6 ? io.g * (io.i - io.o) : io.g * u * (io.i - io.o * e) / (1 - e);
      const outward = io.neg ? I < 0 : I > 0;
      const mag = Math.min(1, Math.abs(I) / 30);
      if (mag > 0.01) {
        const L = 20 + 60 * Math.sqrt(mag), wid = 1 + 4 * Math.sqrt(mag);
        if (outward) arrow(cx, my + mt / 2 + 6 + L * 0.2, my - mt / 2 - L * 0.8, io.col, wid);
        else arrow(cx, my - mt / 2 - 6 - L * 0.2, my + mt / 2 + L * 0.8, io.col, wid);
      } else { ctx.fillStyle = C.ink3; ctx.fillText("평형", cx, my + 24); }
    });
  }
  function update() {
    Ko = 10 ** +sKo.value;
    oKo.textContent = Ko.toFixed(Ko < 10 ? 1 : 0);
    oNa.textContent = (10 ** +sNa.value).toFixed(10 ** +sNa.value < 0.1 ? 3 : 2);
    oCl.textContent = (+sCl.value).toFixed(2);
    oT.textContent = sT.value;
    const st = state();
    nEK.textContent = `${st.EK.toFixed(1)} mV`; nENa.textContent = `${st.ENa.toFixed(1)} mV`; nV.textContent = `${st.V.toFixed(1)} mV`;
    draw();
  }
  [sKo, sNa, sCl, sT].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const [ko, pna, pcl] = b.dataset.p.split(",").map(Number);
    sKo.value = Math.log10(ko); sNa.value = Math.log10(pna); sCl.value = pcl; sT.value = 37; update();
  }));
  update();
})();
