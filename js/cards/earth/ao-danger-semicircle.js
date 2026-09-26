/* 카드: 태풍 진로의 오른쪽은 왜 더 위험할까? — 회전 바람 + 이동 속도 (모식 태풍) */
(() => {
  const root = document.getElementById("card-earth-danger");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".v"), sP = $(".pos"), oV = $(".v-out"), oP = $(".pos-out");
  const nR = $(".n-r"), nL = $(".n-l"), nD = $(".n-d"), nVs = $(".n-v");

  const VM = 35, RM = 40, INFLOW = 20 * Math.PI / 180, OFF = 100; // m/s, km, 관측소는 진로에서 100 km
  let hemi = 1, side = 1;
  // 태풍 중심 기준 (dx 동, dy 북, km) 에서의 바람 벡터 (m/s). 태풍은 북쪽으로 이동.
  function wind(dx, dy) {
    const r = Math.hypot(dx, dy) || 1e-6;
    const vt = r < RM ? VM * r / RM : VM * Math.sqrt(RM / r);
    const tx = -dy / r * hemi, ty = dx / r * hemi;       // 북반구: 시계 반대 방향
    const ix = -dx / r, iy = -dy / r;                    // 중심 쪽
    const u = vt * (Math.cos(INFLOW) * tx + Math.sin(INFLOW) * ix);
    const v = vt * (Math.cos(INFLOW) * ty + Math.sin(INFLOW) * iy) + (+sV.value) / 3.6;
    return { u, v, s: Math.hypot(u, v) };
  }
  const DIRS = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
  const fromDir = (u, v) => DIRS[Math.round(((Math.atan2(-u, -v) * 180 / Math.PI + 360) % 360) / 22.5) % 16] + "풍";
  const col = (s) => {
    const k = clamp(s / 55, 0, 1);
    return `rgb(${Math.round(247 - 35 * k)},${Math.round(244 - 170 * k)},${Math.round(236 - 180 * k)})`;
  };
  function arrow(x1, y1, x2, y2, c, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 4 + lw * 1.3;
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .5), y2 - hl * Math.sin(a - .5)); ctx.lineTo(x2 - hl * Math.cos(a + .5), y2 - hl * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const small = w < 480, strip = small ? 46 : 52, mh = h - strip;
    const S = mh / 620, pos = +sP.value;
    const PX = (x) => w / 2 + x * S, PY = (y) => mh / 2 - y * S;
    ctx.clearRect(0, 0, w, h);
    // 풍속 색 지도
    const st = small ? 5 : 6;
    for (let py = 0; py < mh; py += st) for (let px = 0; px < w; px += st) {
      const x = (px + st / 2 - w / 2) / S, y = (mh / 2 - py - st / 2) / S;
      ctx.fillStyle = col(wind(x, y - pos).s); ctx.fillRect(px, py, st + .5, st + .5);
    }
    // 진로
    ctx.strokeStyle = C.ink2; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(PX(0), mh); ctx.lineTo(PX(0), 0); ctx.stroke(); ctx.setLineDash([]);
    arrow(PX(0), PY(pos) - 20, PX(0), PY(pos) - 52, C.ink, 2);
    // 바람 화살표
    const g = small ? 34 : 44;
    for (let py = g / 2; py < mh; py += g) for (let px = g / 2; px < w; px += g) {
      const x = (px - w / 2) / S, y = (mh / 2 - py) / S, wd = wind(x, y - pos);
      if (wd.s < 3) continue;
      const L = clamp(wd.s * .55, 5, g * .7);
      arrow(px - wd.u / wd.s * L / 2, py + wd.v / wd.s * L / 2, px + wd.u / wd.s * L / 2, py - wd.v / wd.s * L / 2, "rgba(35,35,38,.55)", 1.1);
    }
    // 중심과 반원 이름
    ctx.beginPath(); ctx.arc(PX(0), PY(pos), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.font = `600 ${small ? 11 : 12.5}px ${F.sans}`; ctx.textAlign = "center";
    const danger = hemi > 0 ? 1 : -1;
    ctx.fillStyle = C.warn; ctx.fillText("위험 반원", PX(danger * (small ? 110 : 150)), 18);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("안전 반원", PX(-danger * (small ? 110 : 150)), 18);
    // 관측소
    const sx = PX(side * OFF), sy = PY(0);
    ctx.beginPath(); ctx.rect(sx - 5, sy - 5, 10, 10); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = side > 0 ? "left" : "right";
    ctx.fillText("관측소", sx + side * 9, sy + 4);
    // 축척
    ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(8, mh - 8); ctx.lineTo(8 + 100 * S, mh - 8); ctx.stroke();
    ctx.fillText("100 km", 10, mh - 12);
    ctx.textAlign = "right"; ctx.fillText(hemi > 0 ? "북반구 · 위가 북쪽" : "남반구 · 위가 북쪽", w - 8, mh - 8);
    // 아래 띠: 태풍 위치에 따른 관측소의 풍향
    ctx.fillStyle = C.card; ctx.fillRect(0, mh, w, strip);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(0, mh + .5); ctx.lineTo(w, mh + .5); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("관측소의 풍향 (태풍 위치 −300 → +300 km)", 8, mh + 13);
    const n = 13, x0 = 22, dxs = (w - 44) / (n - 1);
    for (let i = 0; i < n; i++) {
      const p = -300 + i * 50, wd = wind(side * OFF, -p), cx = x0 + i * dxs, cy = mh + (strip + 12) / 2 + 4;
      const on = Math.abs(p - pos) < 25, L = 9;
      arrow(cx - wd.u / wd.s * L, cy + wd.v / wd.s * L, cx + wd.u / wd.s * L, cy - wd.v / wd.s * L, on ? C.warn : C.ink2, on ? 2 : 1.2);
    }
  }

  function update() {
    oV.textContent = sV.value;
    const p = +sP.value; oP.textContent = `${p < 0 ? "−" : p > 0 ? "+" : ""}${Math.abs(p)}`;
    // 이동 방향(북)의 오른쪽 = 동쪽
    nR.textContent = `${wind(RM, 0).s.toFixed(0)} m/s`;
    nL.textContent = `${wind(-RM, 0).s.toFixed(0)} m/s`;
    const wd = wind(side * OFF, -p);
    nD.textContent = fromDir(wd.u, wd.v); nVs.textContent = `${wd.s.toFixed(0)} m/s`;
    draw();
  }
  [sV, sP].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll(".hemi").forEach((b) => b.addEventListener("click", () => { hemi = +b.dataset.h; root.querySelectorAll(".hemi").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  root.querySelectorAll(".side").forEach((b) => b.addEventListener("click", () => { side = +b.dataset.s; root.querySelectorAll(".side").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  update();
})();
