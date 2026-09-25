/* 카드: 바다는 왜 넘치지도, 마르지도 않을까? — 물 순환의 수지 균형 (Trenberth 외, 2007 전 지구 물 수지) */
(() => {
  const root = document.getElementById("card-is1-water-budget");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sR = $(".runoff"), oR = $(".runoff-out");
  const nO = $(".b-ocean"), nL = $(".b-land"), nS = $(".sea");

  // 흐름: 천 km³/년, 저장량: 천 km³
  const Q = { eo: 413, po: 373, pl: 113, el: 73, tr: 40 };
  const STORE = { atm: 12.7, ocean: 1335040, land: 41975 };
  const OCEAN_AREA = 3.61e8; // km²
  let R = +sR.value, phase = 0;

  const { ctx, size } = fit(cv, () => draw());

  function budget() {
    const ocean = Q.po + R - Q.eo;          // 해양: 들어옴(강수+유출) − 나감(증발)
    const land = Q.pl - Q.el - R;           // 육지: 강수 − 증발산 − 유출
    const sea = ocean * 1000 / OCEAN_AREA * 1e6; // km³ → 해수면 mm
    return { ocean, land, sea };
  }

  // 화살표 + 흐르는 점
  function flow(x1, y1, x2, y2, q, col, label, labelSide) {
    const lw = Math.max(1, Math.sqrt(q) * 0.55 * size.k);
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    if (q > 0) {
      ctx.strokeStyle = col; ctx.globalAlpha = 0.28; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * 8, y2 - uy * 8); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = col;
      const hw = Math.max(5, lw * 0.9);
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * 11 - uy * hw, y2 - uy * 11 + ux * hw); ctx.lineTo(x2 - ux * 11 + uy * hw, y2 - uy * 11 - ux * hw); ctx.fill();
      // 점 간격은 일정, 점 크기는 흐름에 비례하지 않고 개수(밀도)가 흐름에 비례
      const n = Math.max(1, Math.round(q / 12));
      for (let i = 0; i < n; i++) {
        const f = ((i / n) + phase) % 1;
        const jitter = ((i * 37) % 7 - 3) / 3 * lw * 0.3;
        ctx.beginPath(); ctx.arc(x1 + dx * f * 0.95 - uy * jitter, y1 + dy * f * 0.95 + ux * jitter, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (label == null) return;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = q > 0 ? C.ink : C.ink3;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.textAlign = labelSide === "l" ? "right" : labelSide === "c" ? "center" : "left";
    const ox = labelSide === "l" ? -lw / 2 - 6 : labelSide === "c" ? 0 : lw / 2 + 6;
    const oy = labelSide === "c" ? -lw / 2 - 5 : 0;
    ctx.fillText(`${label} ${Math.round(q)}`, mx + ox, my + oy + 4);
    ctx.textAlign = "left";
  }

  function box(x, y, w, h, fill, title, lines, bal) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = bal == null ? C.ink2 : Math.abs(bal) < 0.5 ? C.forest : C.warn;
    ctx.lineWidth = bal == null || Math.abs(bal) < 0.5 ? 1 : 2; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    ctx.fillStyle = C.ink; ctx.font = `700 13px ${F.sans}`; ctx.fillText(title, x + 8, y + 18);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    lines.forEach((t, i) => ctx.fillText(t, x + 8, y + 33 + i * 14));
    if (bal != null) {
      const ok = Math.abs(bal) < 0.5;
      ctx.font = `600 12px ${F.mono}`; ctx.fillStyle = ok ? C.forest : C.warn; ctx.textAlign = "right";
      ctx.fillText(ok ? "균형 0" : `${bal > 0 ? "+" : "−"}${Math.abs(Math.round(bal))} /년`, x + w - 8, y + 18); ctx.textAlign = "left";
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    size.k = Math.min(1, w / 640);
    ctx.clearRect(0, 0, w, h);
    const b = budget();
    const narrow = w < 380;
    const pad = 8, gap = w * 0.05;
    const aY = pad, aH = h * 0.24;
    const gY = h * 0.66, gH = h - gY - pad;
    const landW = (w - 2 * pad - gap) * 0.4;
    const lx = pad, ox = pad + landW + gap, ow = w - pad - ox;
    // 대기 (육지 위 / 해양 위)
    const midA = lx + landW + gap / 2;
    box(lx, aY, midA - lx - 2, aH, "#eef3f7", "대기 (육지 위)", [], null);
    box(midA + 2, aY, w - pad - midA - 2, aH, "#eef3f7", "대기 (바다 위)", [], null);
    if (!narrow) {
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
      ctx.fillText("대기 전체 저장량 12.7", w - pad - 8, aY + 18); ctx.fillText("평균 약 9.5일 머묾", w - pad - 8, aY + 32); ctx.textAlign = "left";
    }
    // 대기 안의 수증기 이동
    flow(midA + 36, aY + aH * 0.62, midA - 36, aY + aH * 0.62, Q.tr, "#6c8fae", narrow ? "" : "수증기 이동", "c");
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("흐름: 천 km³/년 · 저장량: 천 km³", w - pad - 6, aY + aH - 6); ctx.textAlign = "left";
    // 육지, 해양
    box(lx, gY, landW, gH, "#efe8dc", "육지", narrow ? [`저장 약 4.2만`] : [`저장량 약 42,000`, `(대부분 빙하·지하수)`], b.land);
    box(ox, gY, ow, gH, "#dbe7f1", "해양", narrow ? [`저장 약 134만`] : [`저장량 1,335,040`, `평균 약 3,200년 머묾`], b.ocean);
    // 흐름
    const lc = lx + landW * 0.5, oc = ox + ow * 0.5, y1 = aY + aH + 4, y2 = gY - 4;
    const blue = "#3f78a8", green = C.forest;
    flow(lc - landW * 0.2, y1, lc - landW * 0.2, y2, Q.pl, blue, "강수", "l");
    flow(lc + landW * 0.2, y2, lc + landW * 0.2, y1, Q.el, green, "증발산", "r");
    flow(oc - ow * 0.18, y1, oc - ow * 0.18, y2, Q.po, blue, "강수", "l");
    flow(oc + ow * 0.18, y2, oc + ow * 0.18, y1, Q.eo, "#c07a2a", "증발", "r");
    // 유출: 육지 → 해양 (아래쪽)
    const ry = gY + gH * 0.72;
    flow(lx + landW - 4, ry, ox + 4, ry, R, blue, null, "c");
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(`유출 ${R}`, lx + landW + gap / 2, gY + gH * 0.72 - 10); ctx.textAlign = "left";
  }

  function update() {
    R = +sR.value; oR.textContent = R;
    const b = budget();
    const f = (v) => Math.abs(v) < 0.5 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(Math.round(v))}`;
    nO.textContent = f(b.ocean); nL.textContent = f(b.land);
    nO.className = nL.className = "";
    nO.classList.add(Math.abs(b.ocean) < 0.5 ? "good" : "bad"); nL.classList.add(Math.abs(b.land) < 0.5 ? "good" : "bad");
    nS.textContent = Math.abs(b.sea) < 0.05 ? "0 mm" : `${b.sea > 0 ? "+" : "−"}${Math.abs(b.sea).toFixed(0)} mm`;
    nS.className = Math.abs(b.sea) < 0.05 ? "good" : "bad";
    draw();
  }
  sR.addEventListener("input", update);
  update();
  loop(cv, (dt) => { if (NM.reduce) return; phase = (phase + dt * 0.12) % 1; draw(); });
})();
