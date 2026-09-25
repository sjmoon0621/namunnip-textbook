/* 카드: 따뜻한 물은 왜 바다 위쪽에만 있을까? — 수온의 연직 분포 (모식 모형) */
(() => {
  const root = document.getElementById("card-earth-thermocline");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sLat = $(".lat"), sSea = $(".season"), sWind = $(".wind");
  const oLat = $(".lat-out"), oSea = $(".sea-out"), oWind = $(".wind-out");
  const nSst = $(".n-sst"), nMix = $(".n-mix"), nDiff = $(".n-diff"), msg = $(".msg");

  // 모식 모형 — 층 구조를 보이기 위한 것이며 실제 관측값이 아니다.
  // 연평균 표층 수온: 적도 약 28 °C에서 고위도로 갈수록 낮아짐. 계절 진폭은 중위도에서 가장 큼.
  const rad = (d) => d * Math.PI / 180;
  const LM = 300;        // 주 수온 약층의 두께 척도 (m)
  const LS = 25;         // 여름 계절 수온 약층의 두께 척도 (m)
  function model(lat, s, U) {
    const Tann = 1 + 27 * Math.cos(rad(lat)) ** 2;
    const A = Math.max(0, 7 * Math.sin(rad(2 * lat)));
    const Ts = Math.max(-1.8, Tann + s * A);
    const Tmain = Math.min(Tann, Ts);
    const Tdeep = Math.min(2, Tmain);
    const winterMix = s < 0 ? 60 * Math.min(1, lat / 25) : 0;
    const h = 10 + 4 * U + winterMix;
    const T = (z) => z <= h ? Ts : Tdeep + (Tmain - Tdeep) * Math.exp(-(z - h) / LM) + (Ts - Tmain) * Math.exp(-(z - h) / LS);
    return { Ts, Tdeep, Tmain, h, T };
  }

  // 수온 → 색
  const STOPS = [[-2, [44, 74, 122]], [6, [63, 111, 163]], [13, [111, 160, 184]], [19, [168, 196, 160]], [24, [224, 160, 42]], [30, [212, 73, 58]]];
  function tcol(T, a = 1) {
    let i = 0; while (i < STOPS.length - 2 && T > STOPS[i + 1][0]) i++;
    const [t0, c0] = STOPS[i], [t1, c1] = STOPS[i + 1];
    const k = NM.clamp((T - t0) / (t1 - t0), 0, 1);
    const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  const { ctx, size } = fit(cv, () => draw());
  const ZMAX = 1000, TMIN = -2, TMAX = 30;

  function arrow(x1, y1, x2, y2, col, lw = 1.5) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 6;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45)); ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const lat = +sLat.value, s = +sSea.value, U = +sWind.value;
    const m = model(lat, s, U), ref = model(10, 0, 6);
    ctx.clearRect(0, 0, w, h);
    const small = w < 480;
    const top = small ? 40 : 46, bot = h - 30;
    const Yz = (z) => top + z / ZMAX * (bot - top);

    // ── 왼쪽: 바다 단면 ──
    const cx0 = 8, cw = Math.round(w * (small ? .3 : .3));
    // 하늘
    ctx.fillStyle = "#eef2f4"; ctx.fillRect(cx0, 0, cw, top);
    const sunA = Math.max(0.15, Math.cos(rad(lat)) * (s > 0 ? 1.1 : s < 0 ? .75 : 1));
    ctx.beginPath(); ctx.arc(cx0 + 16, 17, 6 + 5 * sunA, 0, Math.PI * 2); ctx.fillStyle = `rgba(224,160,42,${0.35 + 0.6 * Math.min(1, sunA)})`; ctx.fill();
    // 바람 화살표
    const nArr = Math.min(3, Math.ceil(U / 7));
    for (let i = 0; i < nArr; i++) {
      const y = 12 + i * 9, len = 10 + U * 1.6;
      arrow(cx0 + cw - 8 - len, y + 4, cx0 + cw - 8, y + 4, C.ink2, 1.2);
    }
    if (U === 0) { ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("바람 없음", cx0 + cw - 6, 18); }
    // 물: 깊이에 따른 색
    for (let y = top; y < bot; y++) {
      const z = (y - top) / (bot - top) * ZMAX;
      ctx.fillStyle = tcol(m.T(z)); ctx.fillRect(cx0, y, cw, 1.2);
    }
    // 수면 물결
    ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = cx0; x <= cx0 + cw; x += 2) { const y = top + Math.sin(x * .25) * Math.min(3, U * .2); x === cx0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    // 혼합층의 뒤섞임 표시
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
    const hy = Yz(m.h);
    for (let i = 0; i < 3 && hy - top > 10; i++) {
      const x = cx0 + cw * (0.25 + i * 0.25), r = Math.min(10, (hy - top) / 2 - 2);
      if (r < 3) continue;
      ctx.beginPath(); ctx.ellipse(x, (top + hy) / 2, r * .9, r, 0, 0.3, Math.PI * 1.8); ctx.stroke();
    }
    ctx.strokeStyle = C.card; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(cx0, hy); ctx.lineTo(cx0 + cw, hy); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.strokeRect(cx0 + .5, top + .5, cw - 1, bot - top - 1);

    // ── 오른쪽: 수온–깊이 그래프 ──
    const gx0 = cx0 + cw + (small ? 34 : 44), gw = w - gx0 - 10;
    const X = (T) => gx0 + (T - TMIN) / (TMAX - TMIN) * gw;
    NM.axes(ctx, { x0: gx0, y0: top, w: gw, h: bot - top, X, Y: Yz,
      xt: [[0, "0"], [10, "10"], [20, "20"], [30, "30"]],
      yt: [[0, "0"], [200, "200"], [400, "400"], [600, "600"], [800, "800"], [1000, "1000"]] });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("수온 (°C) →", gx0, top - 8);
    ctx.textAlign = "right"; ctx.fillText("깊이 m", gx0 - 4, top - 8);

    // 층 구분 (주 수온 약층의 아래 경계: 차이가 처음의 15 %로 줄어드는 깊이)
    const strong = m.Ts - m.Tdeep > 5;
    const zb = m.h + LM * Math.log(1 / 0.15);
    const band = (z0, z1, col, label) => {
      const y0 = Yz(z0), y1 = Yz(Math.min(ZMAX, z1));
      ctx.fillStyle = col; ctx.fillRect(gx0 + 1, y0, gw - 1, y1 - y0);
      const ly = z0 === 0 ? (y1 - y0 > 15 ? y0 + 14 : y1 + 12) : (y0 + y1) / 2 + 4;
      const curveX = X(m.T(Math.min(ZMAX, (ly - top) / (bot - top) * ZMAX)));
      const right = curveX < gx0 + gw * .55;
      ctx.fillStyle = C.ink2; ctx.textAlign = right ? "right" : "left"; ctx.font = `11px ${F.sans}`;
      ctx.fillText(label, right ? gx0 + gw - 6 : gx0 + 6, ly);
    };
    if (strong) {
      band(0, m.h, "rgba(224,160,42,.10)", "혼합층");
      band(m.h, zb, "rgba(181,83,47,.07)", "수온 약층");
      band(zb, ZMAX, "rgba(63,111,163,.07)", "심해층");
    } else {
      band(0, m.h, "rgba(224,160,42,.10)", "혼합층");
      band(m.h, ZMAX, "rgba(63,111,163,.07)", "수온 약층 거의 없음");
    }
    // 비교선
    const curve = (mm) => { ctx.beginPath(); for (let z = 0; z <= ZMAX; z += 4) { const x = X(mm.T(z)), y = Yz(z); z ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } };
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; curve(ref); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2.4; curve(m); ctx.stroke();
    // 혼합층 바닥 표시
    ctx.beginPath(); ctx.arc(X(m.Ts), Yz(m.h), 3.5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.textAlign = "left";
  }

  const SEA = { "-1": "겨울", "0": "연평균", "1": "여름" };
  function update() {
    const lat = +sLat.value, s = +sSea.value, U = +sWind.value;
    const m = model(lat, s, U);
    oLat.textContent = lat; oSea.textContent = SEA[s]; oWind.textContent = U;
    nSst.textContent = `${m.Ts.toFixed(1)} °C`;
    nMix.textContent = `${Math.round(m.h)} m`;
    const d = m.Ts - m.T(1000);
    nDiff.textContent = `${d.toFixed(1)} °C`;
    msg.textContent = d < 5
      ? "표층과 깊은 곳의 수온 차가 작아 밀도 차도 작습니다. 수온 약층이 거의 없어 위아래로 잘 섞입니다."
      : m.h > 90
        ? "바람과 냉각이 표층을 깊게 섞어 혼합층이 두껍습니다. 수온 약층은 그만큼 아래로 밀려납니다."
        : "따뜻하고 가벼운 표층 아래로 수온이 급하게 떨어지는 수온 약층이 뚜렷합니다.";
    draw();
  }
  [sLat, sSea, sWind].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [la, se, wi] = b.dataset.set.split(",");
    sLat.value = la; sSea.value = se; sWind.value = wi; update();
  }));
  update();
})();
