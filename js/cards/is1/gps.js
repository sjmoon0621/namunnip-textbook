/* 카드 1.1.3: GPS는 어떻게 시간으로 위치를 찾을까? — 의사거리 세 개와 수신기 시계 오차 (평면 모식) */
(() => {
  const root = document.getElementById("card-is1-gps");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sl = $(".b"), bOut = $(".b-out"), truth = $(".truth"), renew = $(".renew");
  const dCorr = $(".corr"), dSpread = $(".spread"), dVer = $(".verdict");

  const c = 299792458;               // m/s
  const VIEW = 3000;                 // 지도 가로 폭 (m)
  // 위성 방향 (수신기에서 본 방위, 도). 실제 하늘처럼 모두 ‘위쪽’에 몰려 있다.
  const SATS = [{ name: "위성 A", deg: 32 }, { name: "위성 B", deg: 96 }, { name: "위성 C", deg: 152 }];
  SATS.forEach((s) => { const a = s.deg * Math.PI / 180; s.u = [Math.cos(a), Math.sin(a)]; });
  const COL = ["#2f5f8a", C.amber, C.warn];

  // 숨은 참값: 수신기 위치 P(m), 시계 오차 bTrue(μs)
  const RECV = [
    { P: [-160, 60], b: 1.37 }, { P: [210, -40], b: -1.12 }, { P: [40, 100], b: 0.62 }, { P: [-300, -60], b: 1.48 }, { P: [120, 20], b: -0.88 },
  ];
  let ri = 0;

  // 선 i: u_i · p = u_i · P − δ,  δ = c (bTrue − bEst)
  const lineOff = (i, P, delta) => SATS[i].u[0] * P[0] + SATS[i].u[1] * P[1] - delta;
  function meet(i, j, P, delta) {
    const [a1, b1] = SATS[i].u, [a2, b2] = SATS[j].u, d1 = lineOff(i, P, delta), d2 = lineOff(j, P, delta);
    const det = a1 * b2 - a2 * b1;
    return [(d1 * b2 - d2 * b1) / det, (a1 * d2 - a2 * d1) / det];
  }

  const { ctx, size } = fit(cv, () => draw());

  function state() {
    const R = RECV[ri], bEst = +sl.value;
    const delta = c * (R.b - bEst) * 1e-6;
    const pts = [meet(0, 1, R.P, delta), meet(1, 2, R.P, delta), meet(0, 2, R.P, delta)];
    const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const spread = Math.max(d(pts[0], pts[1]), d(pts[1], pts[2]), d(pts[0], pts[2]));
    return { R, bEst, delta, pts, spread };
  }

  function update() {
    const s = state();
    bOut.textContent = (s.bEst >= 0 ? "+" : "") + s.bEst.toFixed(2);
    const corr = c * s.bEst * 1e-6;
    dCorr.textContent = Math.abs(corr) < 0.5 ? "0 m" : `${corr > 0 ? "−" : "+"}${Math.abs(corr).toFixed(0)} m`;
    dSpread.textContent = s.spread < 1 ? "< 1 m" : `${s.spread.toFixed(0)} m`;
    const ok = s.spread < 12;
    dVer.textContent = ok ? "한 점에서 만남" : "아직 어긋남";
    dVer.className = "verdict " + (ok ? "good" : "");
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = w / VIEW, cx = w / 2, cy = h * 0.42;
    const S = (p) => [cx + p[0] * k, cy - p[1] * k];
    const st = state();

    // 격자 (200 m)
    ctx.strokeStyle = "rgba(35,35,38,.06)"; ctx.lineWidth = 1;
    for (let x = -VIEW; x <= VIEW; x += 200) { const [sx] = S([x, 0]); ctx.beginPath(); ctx.moveTo(sx + .5, 0); ctx.lineTo(sx + .5, h); ctx.stroke(); }
    for (let y = -VIEW; y <= VIEW; y += 200) { const [, sy] = S([0, y]); ctx.beginPath(); ctx.moveTo(0, sy + .5); ctx.lineTo(w, sy + .5); ctx.stroke(); }

    // 삼각형 (선이 이루는 영역)
    const tri = st.pts.map(S);
    if (st.spread > 2) {
      ctx.fillStyle = "rgba(181,83,47,.12)";
      ctx.beginPath(); tri.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
    }

    // 거리선 (위성까지 거리가 같은 곳)
    SATS.forEach((s, i) => {
      const off = lineOff(i, st.R.P, st.delta);
      const n = s.u, t = [-n[1], n[0]];
      const base = [n[0] * off, n[1] * off];
      const L = VIEW * 2;
      const a = S([base[0] - t[0] * L, base[1] - t[1] * L]), b = S([base[0] + t[0] * L, base[1] + t[1] * L]);
      ctx.strokeStyle = COL[i]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      // 가장자리에 위성 방향 화살표와 이름
      const r = Math.min(w, h * 1.6) * 0.5;
      let ex = cx + n[0] * r, ey = cy - n[1] * r * 0.9;
      ex = Math.max(34, Math.min(w - 34, ex)); ey = Math.max(16, ey);
      ctx.fillStyle = COL[i]; ctx.font = `600 ${w < 520 ? 10.5 : 12}px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(`${s.name} ↗`.replace("↗", n[0] > 0.3 ? "↗" : n[0] < -0.3 ? "↖" : "↑"), ex, ey);
    });

    // 교점
    ctx.fillStyle = C.ink;
    tri.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); });
    if (st.spread < 12) {
      const [x, y] = S(st.pts[0]);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.forest; ctx.font = `700 12px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("여기!", x + 13, y + 4);
    }
    if (truth.checked) {
      const [x, y] = S(st.R.P);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(`실제 위치 · 시계 오차 ${st.R.b > 0 ? "+" : ""}${st.R.b.toFixed(2)} μs`, x + 10, y + 18);
    }

    // 축척 막대
    const sb = 500 * k, y0 = h - 12;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(10, y0); ctx.lineTo(10 + sb, y0); ctx.moveTo(10, y0 - 4); ctx.lineTo(10, y0); ctx.moveTo(10 + sb, y0 - 4); ctx.lineTo(10 + sb, y0); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("500 m", 14 + sb, y0 + 3);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText("1 μs 차이 = 300 m", w - 8, y0 + 3);
  }

  sl.addEventListener("input", update);
  truth.addEventListener("change", draw);
  renew.addEventListener("click", () => { ri = (ri + 1) % RECV.length; sl.value = 0; update(); });
  update();
})();
