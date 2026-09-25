/* 카드: LED는 색마다 왜 필요한 전압이 다를까? — 띠 간격, 광자 에너지, 문턱 전압 */
(() => {
  const root = document.getElementById("card-phy-lm-led");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const vS = $(".volt"), vO = $(".volt-out");
  const iEl = $(".cur"), pEl = $(".ephot"), eEl = $(".ev");
  const HC = 1239.84, RS = 20, VT = 0.05;
  const LED = {
    ir: { name: "적외선", lam: 850, mat: "AlGaAs" },
    red: { name: "빨강", lam: 630, mat: "AlGaInP" },
    yel: { name: "노랑", lam: 590, mat: "AlGaInP" },
    grn: { name: "초록", lam: 525, mat: "InGaN" },
    blu: { name: "파랑", lam: 465, mat: "InGaN" },
    uv: { name: "자외선", lam: 395, mat: "InGaN" },
  };
  let cur = "red";
  // 모식: 문턱 전압을 광자 에너지(≈ 띠 간격)와 같게 두고, 그 위에서 직렬 저항 20 Ω처럼 전류가 는다
  const vth = (key) => HC / LED[key].lam;
  const I = (key, V) => VT * Math.log1p(Math.exp((V - vth(key)) / VT)) / RS * 1000; // mA

  function wl2rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    let f = 1; if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return [r, g, b].map((v) => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8)));
  }
  const col = (key, a = 1) => {
    const l = LED[key].lam;
    if (l > 780) return `rgba(120,90,90,${a})`;
    if (l < 400) return `rgba(130,90,200,${a})`;
    return `rgba(${wl2rgb(l).join(",")},${a})`;
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const V = +vS.value, i = I(cur, V), L = LED[cur];
    // 1) LED
    const cx = Math.round(w * 0.17), cy = h * 0.42, r = Math.min(w * 0.08, h * 0.16);
    const glow = clamp(i / 20, 0, 1), visible = L.lam >= 400 && L.lam <= 750;
    if (glow > 0.01 && visible) {
      const g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 3);
      g.addColorStop(0, col(cur, 0.55 * glow)); g.addColorStop(1, col(cur, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = visible ? col(cur, 0.25 + 0.75 * glow) : "rgba(200,200,205,.5)";
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r, Math.PI, 0); ctx.lineTo(cx + r, cy + r * 0.9); ctx.lineTo(cx - r, cy + r * 0.9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - r * 0.4, cy + r * 0.9); ctx.lineTo(cx - r * 0.4, cy + r * 1.9); ctx.moveTo(cx + r * 0.4, cy + r * 0.9); ctx.lineTo(cx + r * 0.4, cy + r * 1.5); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`${L.name} ${L.lam} nm`, cx, cy + r * 1.9 + 16);
    ctx.fillStyle = C.ink3; ctx.fillText(L.mat, cx, cy + r * 1.9 + 30);
    if (!visible && glow > 0.01) { ctx.fillStyle = C.warn; ctx.fillText("빛이 나오지만", cx, 16); ctx.fillText("눈에는 안 보임", cx, 30); }

    // 2) 전류-전압 그래프
    const gx0 = Math.round(w * 0.38), gx1 = w - 10, gy0 = 20, gy1 = h - 30;
    const X = (v) => gx0 + v / 4 * (gx1 - gx0), Y = (ma) => gy1 - Math.min(ma, 30) / 30 * (gy1 - gy0);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y,
      xt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4 V"]], yt: [[0, "0"], [10, "10"], [20, "20"], [30, "30"]], ylabel: "전류 (mA)" });
    for (const key of Object.keys(LED)) {
      const on = key === cur;
      ctx.beginPath();
      for (let v = 0; v <= 4; v += 0.01) { const y = Y(I(key, v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
      ctx.strokeStyle = col(key, on ? 1 : 0.45); ctx.lineWidth = on ? 2.6 : 1.2; ctx.stroke();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(X(V) + .5, gy0); ctx.lineTo(X(V) + .5, gy1); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(V), Y(i), 4.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const V = +vS.value, i = I(cur, V);
    vO.textContent = V.toFixed(2);
    iEl.textContent = i < 0.05 ? "≈ 0 mA" : `${i.toFixed(1)} mA`;
    pEl.textContent = `${vth(cur).toFixed(2)} eV`;
    eEl.textContent = `${V.toFixed(2)} eV`;
    eEl.classList.toggle("good", V >= vth(cur));
    draw();
  }
  vS.addEventListener("input", update);
  const chips = root.querySelectorAll("[data-led]");
  chips.forEach((b) => b.addEventListener("click", () => {
    cur = b.dataset.led; chips.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  update();
})();
