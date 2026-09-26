/* 카드: 뇌우는 왜 여름 오후에 잘 생길까? — 공기 덩어리 방법으로 본 대기의 안정도 (모식) */
(() => {
  const root = document.getElementById("card-earth-thunder");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sD = $(".dt"), sDD = $(".dd"), sG = $(".g");
  const oD = $(".dt-out"), oDD = $(".dd-out"), oG = $(".g-out");
  const nB = $(".n-b"), nT = $(".n-t"), nK = $(".n-k");

  const TE0 = 26, ZTROP = 12, ZMAX = 14, GD = 10, GM = 5;
  const env = (z) => TE0 - (+sG.value) * Math.min(z, ZTROP);
  function parcelModel() {
    const dT = +sD.value, dd = +sDD.value, zl = dd / (GD - 2);
    const Tp = (z) => z <= zl ? TE0 + dT - GD * z : TE0 + dT - GD * zl - GM * (z - zl);
    // 처음으로 주변보다 차가워지는 높이까지 올라간다
    let top = 0;
    for (let z = 0; z <= ZMAX; z += 0.01) { if (Tp(z) < env(z)) break; top = z; }
    if (dT === 0) top = 0;
    const cloud = top > zl;
    const depth = cloud ? top - zl : 0;
    const kind = !cloud ? "구름 없음" : depth < 2.5 ? "적운" : top < 8 ? "웅대 적운" : "적란운 (뇌우)";
    return { Tp, zl, top: Math.min(top, ZTROP + 0.8), cloud, kind };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const small = w < 480, m = parcelModel();
    ctx.clearRect(0, 0, w, h);
    const top = 18, bot = h - 28, Z = (z) => bot - z / ZMAX * (bot - top);
    // ── 왼쪽: 구름 ──
    const sx = 6, sw = Math.round(w * .3), cx = sx + sw / 2;
    const sky = ctx.createLinearGradient(0, top, 0, bot); sky.addColorStop(0, "#c6d8ea"); sky.addColorStop(1, "#eef4f8");
    ctx.fillStyle = sky; ctx.fillRect(sx, top, sw, bot - top);
    ctx.strokeStyle = "rgba(93,93,97,.4)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, Z(ZTROP)); ctx.lineTo(sx + sw, Z(ZTROP)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("대류권 계면", sx + 3, Z(ZTROP) - 3);
    ctx.beginPath(); ctx.arc(sx + sw - 14, top + 14, 8, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill();
    if (m.cloud) {
      const yb = Z(m.zl), yt = Z(m.top), deep = m.top >= 8;
      const half = Math.min(sw * .3, sw * (.12 + (m.top - m.zl) * .025));
      ctx.save(); ctx.beginPath(); ctx.rect(sx, top, sw, bot - top); ctx.clip();
      ctx.fillStyle = deep ? "rgb(150,153,160)" : "rgb(250,250,250)";
      ctx.fillRect(cx - half, yt + 6, 2 * half, yb - yt - 6);
      const nb = Math.max(2, Math.round((yb - yt) / (half * 1.1)));
      for (let i = 0; i <= nb; i++) {
        const y = yb - (yb - yt) * i / nb, r = half * (.55 + .12 * ((i * 7) % 3));
        ctx.beginPath(); ctx.arc(cx - half * .45, y, r, 0, Math.PI * 2); ctx.arc(cx + half * .45, y + r * .2, r, 0, Math.PI * 2); ctx.fill();
      }
      if (deep) { ctx.beginPath(); ctx.ellipse(cx + sw * .06, yt + 4, sw * .46, 9, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillRect(cx - half, yb - 3, 2 * half, 3);
      ctx.restore();
      if (deep) {
        ctx.strokeStyle = "rgba(63,111,163,.7)"; ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) { const x = cx - half + 6 + i * (2 * half - 12) / 6; ctx.beginPath(); ctx.moveTo(x, yb + 3); ctx.lineTo(x - 3, bot - 2); ctx.stroke(); }
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(cx + 4, (yb + yt) / 2); ctx.lineTo(cx - 4, yb - 10); ctx.lineTo(cx + 3, yb - 8); ctx.lineTo(cx - 5, yb + 22); ctx.stroke();
      }
    } else {
      // 올라가다 멈추는 열기포
      ctx.strokeStyle = "rgba(181,83,47,.6)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, bot - 4); ctx.lineTo(cx, Math.min(bot - 8, Z(m.top))); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, Math.min(bot - 8, Z(m.top)), 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = "#b9c4a8"; ctx.fillRect(sx, bot, sw, 5);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, top + .5, sw - 1, bot - top + 4);

    // ── 오른쪽: 기온–높이 ──
    const gx0 = sx + sw + (small ? 32 : 40), gw = w - gx0 - 10;
    const lo = TE0 - 9.5 * ZTROP - 5, hi = TE0 + 10;
    const X = (T) => gx0 + (T - lo) / (hi - lo) * gw;
    NM.axes(ctx, { x0: gx0, y0: top, w: gw, h: bot - top, X, Y: Z,
      xt: [-80, -60, -40, -20, 0, 20].filter((v) => v >= lo).map((v) => [v, String(v)]),
      yt: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, String(v)]), xlabel: "기온 (°C)", ylabel: "높이 (km)" });
    // 떠오르는 구간(공기 덩어리가 더 따뜻한 곳) 칠하기
    ctx.fillStyle = "rgba(181,83,47,.12)";
    ctx.beginPath();
    const zt = Math.max(0, m.top);
    for (let z = 0; z <= zt; z += .05) ctx.lineTo(X(m.Tp(z)), Z(z));
    for (let z = zt; z >= 0; z -= .05) ctx.lineTo(X(env(z)), Z(z));
    ctx.closePath(); ctx.fill();
    // 주변 공기
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath();
    for (let z = 0; z <= ZMAX; z += .1) { z ? ctx.lineTo(X(env(z)), Z(z)) : ctx.moveTo(X(env(z)), Z(z)); } ctx.stroke();
    // 공기 덩어리 (꼭대기까지만 실선, 그 위는 점선)
    const pline = (z0, z1, dash) => { ctx.setLineDash(dash); ctx.strokeStyle = C.warn; ctx.lineWidth = dash.length ? 1.2 : 2.4; ctx.beginPath(); for (let z = z0; z <= z1 + 1e-6; z += .05) { const x = X(m.Tp(z)); z === z0 ? ctx.moveTo(x, Z(z)) : ctx.lineTo(x, Z(z)); } ctx.stroke(); ctx.setLineDash([]); };
    pline(0, Math.max(.05, zt), []);
    if (zt < ZMAX - .1) pline(zt, Math.min(ZMAX, zt + 3), [4, 4]);
    if (m.zl < ZMAX) {
      ctx.strokeStyle = "#3f6fa3"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx0, Z(m.zl)); ctx.lineTo(gx0 + gw, Z(m.zl)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "right"; ctx.fillText("응결 시작 높이", gx0 + gw - 4, Z(m.zl) - 4);
    }
    ctx.textAlign = "left";
  }

  function update() {
    oD.textContent = sD.value; oDD.textContent = sDD.value; oG.textContent = (+sG.value).toFixed(1);
    const m = parcelModel();
    nB.textContent = m.cloud ? `${(m.zl * 1000).toFixed(0)} m` : "—";
    nT.textContent = m.cloud ? `${m.top.toFixed(1)} km` : "—";
    nK.textContent = m.kind;
    nK.classList.toggle("bad", m.top >= 8 && m.cloud);
    draw();
  }
  [sD, sDD, sG].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [d, dd, g] = b.dataset.set.split(","); sD.value = d; sDD.value = dd; sG.value = g; update();
  }));
  update();
})();
