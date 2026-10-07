/* 카드: 유전자 몇백 개로 어떻게 수백만 가지 항체를 만들까? — V(D)J 재배열, 클론 선택, 자기 관용 (모양 공간은 모식) */
(() => {
  const root = document.getElementById("card-adbio-vdj");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bNew = $(".b-new"), bSel = $(".b-sel"), bInf = $(".b-inf"), bReset = $(".b-reset");
  const nComb = $(".n-comb"), nBind = $(".n-bind"), nSelf = $(".n-self"), msg = $(".msg");

  /* 사람 유전체의 기능성 유전자 조각 수 (대략값, 개인마다 다름) */
  const NV = 40, ND = 23, NJ = 6, NVK = 40, NJK = 5, NVL = 30, NJL = 4;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const R = 0.065;
  const SELF = [[0.22, 0.30], [0.70, 0.78], [0.80, 0.25]];
  const ANT = [0.42, 0.62];
  let clones = [], last = null, selected = false, infected = false;

  function makeClone() {
    const v = 1 + Math.floor(rnd() * NV), d = 1 + Math.floor(rnd() * ND), j = 1 + Math.floor(rnd() * NJ);
    const kappa = rnd() < 0.6, lv = 1 + Math.floor(rnd() * (kappa ? NVK : NVL)), lj = 1 + Math.floor(rnd() * (kappa ? NJK : NJL));
    const nAdd = Math.floor(rnd() * 8);
    /* 수용체 모양: 조합과 이음부 변화가 정하는 임의의 점 (모식) */
    const c = { v, d, j, kappa, lv, lj, nAdd, x: 0.03 + rnd() * 0.94, y: 0.03 + rnd() * 0.94, size: 1, gone: false };
    c.self = SELF.some(([sx, sy]) => Math.hypot(c.x - sx, c.y - sy) < R);
    c.bind = Math.hypot(c.x - ANT[0], c.y - ANT[1]) < R;
    return c;
  }
  function reset() {
    seed = 7; clones = []; selected = false; infected = false;
    for (let i = 0; i < 400; i++) clones.push(makeClone());
    last = clones[clones.length - 1];
    msg.textContent = "골수에서 막 만들어진 B 림프구 400개입니다. 점 하나가 한 클론(같은 수용체를 가진 세포 집단)입니다.";
  }

  const { ctx, size } = fit(cv, () => draw());
  function locus(y, label, n, col, pick, x0, x1) {
    const step = (x1 - x0) / n;
    for (let i = 1; i <= n; i++) {
      ctx.fillStyle = i === pick ? col : "rgba(0,0,0,.18)";
      ctx.fillRect(x0 + (i - 1) * step + 0.5, y - (i === pick ? 8 : 5), Math.max(1.5, step - 1.2), i === pick ? 16 : 10);
    }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`${label} ×${n}`, (x0 + x1) / 2, y + 20);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = last;
    /* 1) 무거운 사슬 유전자 자리 */
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("무거운 사슬 유전자 자리 (생식 세포의 DNA, 14번 염색체)", 10, 16);
    const y1 = 38, xa = 10, xb = w - 46;
    const wV = (xb - xa) * 0.62, wD = (xb - xa) * 0.24;
    locus(y1, "V", NV, "#c0504d", c.v, xa, xa + wV);
    locus(y1, "D", ND, "#e0a02a", c.d, xa + wV + 10, xa + wV + 10 + wD);
    locus(y1, "J", NJ, "#3f6fa3", c.j, xa + wV + 20 + wD, xb);
    ctx.fillStyle = C.ink3; ctx.fillRect(xb + 8, y1 - 6, 28, 12); ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("C", xb + 22, y1 + 4);
    /* 재배열된 유전자 */
    const y2 = 86;
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("이 B 림프구에서 재배열된 유전자 (사이 DNA는 잘려 나감)", 10, y2 - 10);
    const seg = [["V" + c.v, "#c0504d", 70], ["+" + c.nAdd, "#999", 26], ["D" + c.d, "#e0a02a", 46], ["J" + c.j, "#3f6fa3", 42], ["C", C.ink3, 40]];
    let x = 10;
    seg.forEach(([t, col, ww]) => { ctx.fillStyle = col; ctx.fillRect(x, y2, ww, 16); ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(t, x + ww / 2, y2 + 12); x += ww + 2; });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`가벼운 사슬: ${c.kappa ? "κ" : "λ"} V${c.lv}–J${c.lj}   (+n: 이음부에 더해진 염기 수)`, x + 6, y2 + 12);
    /* 2) 모양 공간 */
    const s0 = 128, sh = h - s0 - 8, sw = Math.min(w - 20, sh), sx0 = (w - sw) / 2;
    const SX = (v) => sx0 + v * sw, SY = (v) => s0 + v * sh;
    ctx.strokeStyle = C.rule; ctx.strokeRect(sx0, s0, sw, sh);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("수용체의 항원 결합 부위 모양 (모식: 가까울수록 비슷한 모양)", sx0 + 4, s0 + 12);
    SELF.forEach(([a, b]) => {
      ctx.strokeStyle = "rgba(120,120,120,.6)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(SX(a), SY(b), R * sw, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(120,120,120,.8)"; ctx.fillRect(SX(a) - 5, SY(b) - 5, 10, 10);
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("자기 항원", SX(a), SY(b) + R * sw + 12);
    });
    if (infected) {
      ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(SX(ANT[0]), SY(ANT[1]), R * sw, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.forest; ctx.beginPath();
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? 4 : 9; ctx.lineTo(SX(ANT[0]) + rr * Math.cos(a), SY(ANT[1]) + rr * Math.sin(a)); }
      ctx.closePath(); ctx.fill();
      ctx.textAlign = "center"; ctx.fillText("병원체 항원", SX(ANT[0]), SY(ANT[1]) - R * sw - 4);
    }
    clones.forEach((k) => {
      if (k.gone) return;
      const r = 2.2 + 2.6 * Math.log10(k.size);
      ctx.fillStyle = k.size > 1 ? (k.self ? "rgba(181,83,47,.75)" : "rgba(59,124,42,.6)") : k.self ? "rgba(181,83,47,.9)" : "rgba(63,111,163,.65)";
      ctx.beginPath(); ctx.arc(SX(k.x), SY(k.y), r, 0, Math.PI * 2); ctx.fill();
    });
    if (last && !last.gone) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(SX(last.x), SY(last.y), 7, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1; }
  }
  function update() {
    const live = clones.filter((k) => !k.gone);
    nBind.textContent = `${live.filter((k) => k.bind).length}개`;
    const s = live.filter((k) => k.self).length;
    nSelf.textContent = `${s}개`; nSelf.className = "n-self " + (s ? "bad" : "good");
    draw();
  }
  bNew.addEventListener("click", () => { const c = makeClone(); if (infected && c.bind) c.size = 1; clones.push(c); last = c; msg.textContent = `새 B 림프구: 무거운 사슬 V${c.v}–D${c.d}–J${c.j}, 가벼운 사슬 ${c.kappa ? "κ" : "λ"} V${c.lv}–J${c.lj}.${c.self ? " 이 수용체는 자기 항원에 붙습니다." : ""}`; update(); });
  bSel.addEventListener("click", () => {
    if (selected) return;
    selected = true; let n = 0;
    clones.forEach((k) => { if (k.self && !k.gone) { k.gone = true; n++; } });
    msg.textContent = `골수에서 자기 항원에 강하게 붙은 클론 ${n}개가 제거되었습니다(음성 선택). 이제 남은 클론은 자기 항원에 반응하지 않습니다.`;
    update();
  });
  bInf.addEventListener("click", () => {
    if (infected) return;
    infected = true;
    let nb = 0, ns = 0;
    clones.forEach((k) => {
      if (k.gone) return;
      if (k.bind) { k.size = 2000; nb++; }
      else if (k.self) { k.size = 300; ns++; }
    });
    msg.textContent = nb ? `병원체 항원에 붙는 클론 ${nb}개만 골라져 증식했습니다(클론 선택). 이들이 형질 세포와 기억 세포가 됩니다.` : "병원체 항원에 맞는 클론이 없습니다. 새 B 림프구를 더 만들어 보세요.";
    if (ns) msg.textContent += ` 음성 선택을 거치지 않은 자기 반응 클론 ${ns}개도 염증 속에서 함께 활성화되었습니다(자가 면역 위험).`;
    update();
  });
  bReset.addEventListener("click", () => { reset(); update(); });
  const heavy = NV * ND * NJ, light = NVK * NJK + NVL * NJL;
  nComb.textContent = `${heavy.toLocaleString()} × ${light} ≈ ${(heavy * light / 1e6).toFixed(1)}백만`;
  reset(); update();
  /* ?demo: 음성 선택을 건너뛰고 병원체 침입까지 진행한 상태 */
  if (/[?&]demo\b/.test(location.search)) bInf.click();
})();
