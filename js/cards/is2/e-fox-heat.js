/* 카드: 추운 곳의 여우는 왜 귀가 작을까? — 표면적/부피와 열 손실 (구 모형, 모식) */
(() => {
  const root = document.getElementById("card-is2-fox-heat");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sM = $(".mass"), sE = $(".ear"), sT = $(".air");
  const oM = $(".mass-out"), oE = $(".ear-out"), oT = $(".air-out");
  const nSV = $(".sv"), nEar = $(".earpct"), nLoss = $(".loss"), msg = $(".x-msg");

  const TB = 37; // 체온 (°C)
  // 몸 = 같은 질량의 물 공 (밀도 1 g/cm³), 귀 = 얇은 삼각형 두 장 (앞뒤 면)
  const geo = (m, e) => {
    const V = m * 1000, r = Math.cbrt(3 * V / (4 * Math.PI));
    const Sb = 4 * Math.PI * r * r, Se = 2 * 2 * 0.35 * e * e;
    return { V, r, Sb, Se, S: Sb + Se, sv: (Sb + Se) / V };
  };
  // 대략의 대표 질량과 귀 길이 (모식 비율)
  const FOX = [
    { key: "fennec", name: "사막여우", m: 1.2, e: 12 },
    { key: "red", name: "붉은여우", m: 6, e: 8 },
    { key: "arctic", name: "북극여우", m: 3.5, e: 4 },
  ];
  const REF = geo(3.5, 4).sv * (TB + 30); // 북극여우, −30 °C = 100
  const loss = (g, T) => 100 * g.sv * Math.max(0, TB - T) / REF;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sM.value, e = +sE.value, T = +sT.value, g = geo(m, e);
    const stack = w / h < 1.3;
    const sw = stack ? w : w * 0.44, sh = stack ? h * 0.5 : h;
    // 배경: 기온 색
    const t = clamp((T + 40) / 75, 0, 1);
    ctx.fillStyle = `rgb(${Math.round(214 + 34 * t)},${Math.round(230 - 10 * t)},${Math.round(240 - 50 * t)})`;
    ctx.fillRect(0, 0, sw, sh);
    // 공 모형 (픽셀 크기: 10 kg 공이 화면 높이의 절반쯤)
    const px = (sh * 0.24) / Math.cbrt(3 * 10000 / (4 * Math.PI));
    const cx = sw / 2, cy = sh * 0.6, R = g.r * px, E = e * px;
    // 귀
    ctx.fillStyle = "#c9793a"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    [-1, 1].forEach((s) => {
      const bx = cx + s * R * 0.45, by = cy - R * 0.89;
      ctx.beginPath(); ctx.moveTo(bx - 0.35 * E, by + 2); ctx.lineTo(bx + s * 0.25 * E, by - E); ctx.lineTo(bx + 0.35 * E, by + 2); ctx.closePath();
      ctx.fill(); ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = "#d98b4a"; ctx.fill(); ctx.stroke();
    // 열 화살표: 1 kg당 손실에 비례하는 길이
    const lk = loss(g, T);
    const al = clamp(lk / 100, 0, 2.2) * 16;
    if (al > 1) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k + 0.5) * Math.PI * 2 / 10;
        if (Math.abs(a + Math.PI / 2) < 0.4) continue;
        const x0 = cx + Math.cos(a) * (R + 4), y0 = cy + Math.sin(a) * (R + 4);
        const x1 = cx + Math.cos(a) * (R + 4 + al), y1 = cy + Math.sin(a) * (R + 4 + al);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 5 * Math.cos(a - .5), y1 - 5 * Math.sin(a - .5));
        ctx.moveTo(x1, y1); ctx.lineTo(x1 - 5 * Math.cos(a + .5), y1 - 5 * Math.sin(a + .5)); ctx.stroke();
      }
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.fillText(`기온 ${T} °C`, 8, 15);
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("구 모형 · 모식", sw - 8, 15); ctx.textAlign = "left";
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("화살표: 1 kg당 열 손실", sw - 8, sh - 8); ctx.textAlign = "left";

    // 막대: 같은 기온에서 1 kg당 열 손실
    const bx0 = stack ? 70 : sw + 84, by0 = stack ? sh + 30 : 34, bw = (stack ? w : w - sw) - (stack ? 70 : 84) - 44, bh = (stack ? h - sh : h) - (stack ? 40 : 50);
    const rows = [...FOX.map((f) => ({ name: f.name, v: loss(geo(f.m, f.e), T), me: false })), { name: "조절한 모형", v: lk, me: true }];
    const vmax = Math.max(220, ...rows.map((r) => r.v));
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText("1 kg당 열 손실 (북극여우·−30 °C = 100)", bx0 - (stack ? 62 : 76), by0 - 12);
    const rh = bh / rows.length;
    rows.forEach((r, i) => {
      const y = by0 + i * rh + rh * 0.2, hh = rh * 0.55;
      ctx.fillStyle = r.me ? C.warn : "rgba(35,35,38,.2)";
      ctx.fillRect(bx0, y, Math.max(1, r.v / vmax * bw), hh);
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.font = `${r.me ? 600 : 400} 11px ${F.sans}`;
      ctx.fillText(r.name, bx0 - 6, y + hh / 2 + 4);
      ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink;
      ctx.fillText(Math.round(r.v), bx0 + r.v / vmax * bw + 5, y + hh / 2 + 4);
    });
  }

  function update() {
    const m = +sM.value, e = +sE.value, T = +sT.value, g = geo(m, e);
    oM.textContent = m.toFixed(1); oE.textContent = e; oT.textContent = T;
    nSV.textContent = `${g.sv.toFixed(3)} /cm`;
    nEar.textContent = `${Math.round(g.Se / g.S * 100)}%`;
    const lk = loss(g, T);
    nLoss.textContent = Math.round(lk);
    msg.textContent = T >= 30 ? "기온이 체온에 가까우면 열을 내보내기가 어렵습니다. 이때는 넓은 귀가 몸을 식히는 데 쓸모가 있습니다."
      : lk > 150 ? "몸이 작고 귀가 커서 1 kg당 열을 많이 잃습니다. 그만큼 더 많이 먹어서 열을 만들어야 합니다."
      : "몸집이 크고 귀가 작을수록 부피에 비해 표면적이 작아 1 kg당 열을 덜 잃습니다.";
    root.querySelectorAll("[data-fox]").forEach((b) => { const f = FOX.find((k) => k.key === b.dataset.fox); b.setAttribute("aria-pressed", f.m === m && f.e === e); });
    draw();
  }
  [sM, sE, sT].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-fox]").forEach((b) => b.addEventListener("click", () => {
    const f = FOX.find((k) => k.key === b.dataset.fox); sM.value = f.m; sE.value = f.e; update();
  }));
  update();
})();
