/* 카드: 지표는 받은 에너지를 어떤 길로 내보낼까? — 전 지구 평균 열수지(Trenberth 등 2009, 반올림) */
(() => {
  const root = document.getElementById("card-esys-budget");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nIn = $(".n-in"), nOut = $(".n-out"), nNet = $(".n-net"), nList = $(".n-list");
  // [이름, 값, 종류, 출발, 도착, 가로 위치(0~1)]  층: sp(우주) atm(대기) sfc(지표)
  const FL = [
    ["들어오는 태양 복사", 341, "sw", "sp", "in", 0.08],
    ["구름·대기의 반사", 79, "sw", "atm", "sp", 0.16],
    ["대기의 흡수", 78, "sw", "in", "atm", 0.25],
    ["지표의 흡수", 161, "sw", "in", "sfc", 0.08],
    ["지표의 반사", 23, "sw", "sfc", "sp", 0.34],
    ["현열 (전도·대류)", 17, "heat", "sfc", "atm", 0.44],
    ["숨은열 (증발)", 80, "heat", "sfc", "atm", 0.53],
    ["지표 복사", 396, "lw", "sfc", "atm*", 0.66],
    ["대기의 창", 40, "lw", "sfc", "sp", 0.78],
    ["역복사", 333, "lw", "atm", "sfc", 0.9],
    ["대기가 우주로 내보내는 복사", 199, "lw", "atm", "sp", 0.72],
  ];
  // 지표 복사 396 중 356은 대기가 흡수, 40은 대기의 창으로 나감
  const LAYER = {
    toa: { in: [["들어오는 태양 복사", 341]], out: [["반사 (79 + 23)", 102], ["우주로 나가는 적외선 (199 + 40)", 239]] },
    atm: { in: [["태양 복사 흡수", 78], ["현열", 17], ["숨은열", 80], ["지표 복사 흡수 (396 − 40)", 356]], out: [["역복사", 333], ["우주로 내보내는 복사", 199]] },
    sfc: { in: [["태양 복사 흡수", 161], ["역복사", 333]], out: [["지표 복사", 396], ["현열", 17], ["숨은열", 80]] },
  };
  const INV = { toa: ["들어오는 태양 복사", "구름·대기의 반사", "지표의 반사", "대기의 창", "대기가 우주로 내보내는 복사"], atm: ["대기의 흡수", "현열 (전도·대류)", "숨은열 (증발)", "지표 복사", "역복사", "대기가 우주로 내보내는 복사"], sfc: ["지표의 흡수", "역복사", "지표 복사", "현열 (전도·대류)", "숨은열 (증발)"] };
  const COL = { sw: "#e0a02a", lw: "#b5532f", heat: "#3b7c2a" };
  let sel = "sfc";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ySp = 34, yA0 = h * 0.3, yA1 = h * 0.62, ySf = h * 0.84, X = (f) => 14 + f * (w - 28);
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, ySp); ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("우주 (대기 꼭대기)", 10, 21);
    ctx.fillStyle = "rgba(110,164,230,.14)"; ctx.fillRect(0, yA0, w, yA1 - yA0); ctx.fillStyle = C.ink2; ctx.fillText("대기 (구름·온실 기체)", X(0.11), yA1 - 8);
    ctx.fillStyle = "#b9a58a"; ctx.fillRect(0, ySf, w, h - ySf); ctx.fillStyle = "#fff"; ctx.fillText("지표 (땅·바다)", 10, ySf + 18);
    const Y = { sp: ySp, atm: (yA0 + yA1) / 2, sfc: ySf, in: yA0 - 20 };
    FL.forEach(([name, v, kind, from, to, fx]) => {
      const x = X(fx), lw = Math.max(2, v / 14), hot = INV[sel].includes(name);
      let ya = Y[from], yb = to === "in" ? null : Y[to.replace("*", "")];
      if (from === "in") ya = Y.in; if (to === "in") yb = ya;
      if (name === "들어오는 태양 복사") { ya = ySp; yb = yA0 - 6; }
      if (name === "대기의 흡수") { ya = ySp + 6; yb = Y.atm; }
      if (name === "지표의 흡수") { ya = yA0 - 6; yb = ySf; }
      if (name === "지표 복사") yb = Y.atm;
      ctx.globalAlpha = hot ? 1 : 0.22;
      ctx.strokeStyle = COL[kind]; ctx.fillStyle = COL[kind]; ctx.lineWidth = lw;
      const dir = Math.sign(yb - ya); ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb - dir * 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x - lw / 2 - 5, yb - dir * 10); ctx.lineTo(x + lw / 2 + 5, yb - dir * 10); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; const ym = (ya + yb) / 2; ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(x - 15, ym - 9, 30, 13); ctx.fillStyle = C.ink; ctx.fillText(v, x, ym + 2);
      ctx.globalAlpha = 1;
    });
    // 태양 복사 갈래 표시
    ctx.strokeStyle = COL.sw; ctx.lineWidth = 2; ctx.globalAlpha = sel === "toa" ? 1 : 0.4; ctx.beginPath(); ctx.moveTo(X(0.08), yA0 - 6); ctx.lineTo(X(0.34), yA0 - 6); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; [["sw", "태양 복사(단파)"], ["lw", "적외선 복사(장파)"], ["heat", "현열·숨은열"]].forEach(([k, t], i) => { ctx.fillStyle = COL[k]; ctx.fillRect(w - 120, 44 + i * 14, 10, 8); ctx.fillStyle = C.ink2; ctx.fillText(t, w - 106, 52 + i * 14); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("단위: W/m²", w - 10, h - 6);
  }
  function update() {
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === sel)));
    const L = LAYER[sel], si = L.in.reduce((a, x) => a + x[1], 0), so = L.out.reduce((a, x) => a + x[1], 0);
    nIn.textContent = `${si} W/m²`; nOut.textContent = `${so} W/m²`; nNet.textContent = `${si - so > 0 ? "+" : ""}${si - so} W/m²${Math.abs(si - so) <= 1 ? " (반올림 오차·쌓이는 열 수준)" : ""}`;
    nList.textContent = `들어옴: ${L.in.map(([n, v]) => `${n} ${v}`).join(" + ")} · 나감: ${L.out.map(([n, v]) => `${n} ${v}`).join(" + ")}`;
    draw();
  }
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { sel = b.dataset.l; update(); }));
  update();
})();
