/* 카드: 수소는 왜 네 가지 색의 빛만 낼까? — 보어 모형 에너지 준위와 선 스펙트럼 */
(() => {
  const root = document.getElementById("card-phy-lm-hyd");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const dEEl = $(".de"), lEl = $(".lamh"), rEl = $(".region");
  const RH = 1.09677583e7, E1 = 13.598, NAIR = 1.000277;
  let ni = 3, nf = 2;
  const seen = new Map(); // "ni-nf" → λ

  const En = (n) => -E1 / (n * n);
  // 진공 파장을 구한 뒤 200 nm 이상은 공기 중 파장으로 바꾼다(관측표와 같은 기준)
  const lamOf = (a, b) => { const v = 1e9 / (RH * (1 / (b * b) - 1 / (a * a))); return v > 200 ? v / NAIR : v; };
  const region = (l) => (l < 380 ? "자외선" : l <= 750 ? "가시광선" : "적외선");
  const SERIES = { 1: "라이먼 계열", 2: "발머 계열", 3: "파셴 계열", 4: "브래킷 계열" };

  function wl2rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    let f = 1; if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return `rgb(${[r, g, b].map((v) => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8))).join(",")})`;
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 에너지 준위 (n = 2 이상은 −3.6~0 eV를 크게, n = 1은 축을 끊고 아래에)
    const lx0 = 44, lx1 = Math.round(w * 0.33), top = 16, midB = h * 0.68, bot = h - 22;
    const Y = (E) => (E > -3.7 ? top + (-E / 3.6) * (midB - top) : bot);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    for (let n = 1; n <= 7; n++) {
      const y = Math.round(Y(En(n))) + .5, on = n === ni || n === nf;
      ctx.strokeStyle = on ? C.ink : C.ink3; ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(lx0, y); ctx.lineTo(lx1, y); ctx.stroke();
      ctx.fillStyle = on ? C.ink : C.ink3;
      if (n <= 4 || n === 7) ctx.fillText(`n=${n}`, lx0 - 4, y + 3.5);
      if (n <= 3) { ctx.textAlign = "left"; ctx.fillText(`${En(n).toFixed(2)} eV`, lx1 + 4, y + 3.5); ctx.textAlign = "right"; }
    }
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx0, top + .5); ctx.lineTo(lx1, top + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("0 eV (n=∞)", lx1 + 4, top + 3.5);
    // 축 끊김 표시
    const by = (midB + bot) / 2;
    ctx.strokeStyle = C.ink3;
    ctx.beginPath(); ctx.moveTo(lx0 + 8, by - 3); ctx.lineTo(lx0 + 18, by + 3); ctx.moveTo(lx0 + 12, by - 3); ctx.lineTo(lx0 + 22, by + 3); ctx.stroke();
    ctx.fillText("(축 생략)", lx0 + 26, by + 4);
    // 전이 화살표
    const l = lamOf(ni, nf), x = (lx0 + lx1) / 2, y0 = Y(En(ni)), y1 = Y(En(nf));
    const col = l >= 380 && l <= 750 ? wl2rgb(l) : C.ink2;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 6, y1 - 10); ctx.lineTo(x + 6, y1 - 10); ctx.closePath(); ctx.fill();
    // 광자 물결
    ctx.lineWidth = 1.6; ctx.beginPath();
    for (let k = 0; k <= 40; k++) { const px = x + 10 + k * 1.3, py = (y0 + y1) / 2 + 5 * Math.sin(k * 0.8); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();

    // 스펙트럼: 위 = 90~2000 nm 전체(로그 눈금), 아래 = 가시광 확대
    const sx0 = Math.round(w * 0.55), sx1 = w - 10, sw = sx1 - sx0;
    const LX = (lam) => sx0 + Math.log(lam / 90) / Math.log(2000 / 90) * sw;
    const s1y = 30, s1h = 22;
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("전체 (로그 눈금)", sx0, s1y - 6);
    ctx.fillStyle = C.night; ctx.fillRect(sx0, s1y, sw, s1h);
    for (let lam = 380; lam <= 750; lam += 2) { ctx.fillStyle = wl2rgb(lam); ctx.globalAlpha = 0.18; ctx.fillRect(LX(lam), s1y + s1h - 4, LX(lam + 2) - LX(lam) + 0.5, 4); }
    ctx.globalAlpha = 1;
    for (const [k, lam] of seen) { const on = k === `${ni}-${nf}`; ctx.fillStyle = lam >= 380 && lam <= 750 ? wl2rgb(lam) : on ? "#fff" : "#9a9aa0"; ctx.fillRect(LX(lam) - (on ? 1 : 0.5), s1y + 2, on ? 2.5 : 1.5, s1h - 4); }
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (const t of [100, 200, 500, 1000, 2000]) { ctx.fillText(t, Math.min(LX(t), sx1 - 12), s1y + s1h + 13); }
    ctx.fillText("자외선", (LX(90) + LX(380)) / 2, s1y + s1h + 26);
    ctx.fillText("가시", (LX(380) + LX(750)) / 2, s1y + s1h + 26);
    ctx.fillText("적외선", (LX(750) + LX(2000)) / 2, s1y + s1h + 26);
    const s2y = s1y + s1h + 50, s2h = h - s2y - 30;
    const VX = (lam) => sx0 + (lam - 380) / 370 * sw;
    ctx.textAlign = "left"; ctx.fillText("가시광선 확대 (380~750 nm)", sx0, s2y - 6);
    ctx.fillStyle = C.night; ctx.fillRect(sx0, s2y, sw, s2h);
    for (const [k, lam] of seen) {
      if (lam < 380 || lam > 750) continue;
      const on = k === `${ni}-${nf}`;
      ctx.fillStyle = wl2rgb(lam); ctx.fillRect(VX(lam) - 1.5, s2y + 2, 3, s2h - 4);
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.textAlign = "center";
      ctx.fillText(lam.toFixed(1), VX(lam), s2y + s2h + 13);
    }
    ctx.textAlign = "left";
  }

  function update() {
    const l = lamOf(ni, nf);
    seen.set(`${ni}-${nf}`, l);
    dEEl.textContent = `${(En(ni) - En(nf)).toFixed(2)} eV`;
    lEl.textContent = `${l.toFixed(1)} nm`;
    rEl.textContent = `${region(l)} · ${SERIES[nf]}`;
    draw();
  }
  const upBtns = root.querySelectorAll("[data-ni]"), dnBtns = root.querySelectorAll("[data-nf]");
  const sync = () => {
    upBtns.forEach((b) => { b.setAttribute("aria-pressed", +b.dataset.ni === ni); b.disabled = +b.dataset.ni <= nf; });
    dnBtns.forEach((b) => b.setAttribute("aria-pressed", +b.dataset.nf === nf));
  };
  upBtns.forEach((b) => b.addEventListener("click", () => { ni = +b.dataset.ni; sync(); update(); }));
  dnBtns.forEach((b) => b.addEventListener("click", () => { nf = +b.dataset.nf; if (ni <= nf) ni = nf + 1; sync(); update(); }));
  $(".all").addEventListener("click", () => {
    for (let a = nf + 1; a <= 7; a++) seen.set(`${a}-${nf}`, lamOf(a, nf));
    update();
  });
  $(".clear").addEventListener("click", () => { seen.clear(); update(); });
  sync(); update();
})();
