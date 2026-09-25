/* 카드: 말이집이 있으면 왜 신호가 더 빠를까? — 도약 전도, 축삭 지름과 전도 속도
   속도 어림식 (실측 자료에 맞춘 근사): 말이집 있음 v ≈ 6·d, 말이집 없음 v ≈ 1.1·√d  (v: m/s, d: μm) */
(() => {
  const root = document.getElementById("card-bio-saltatory");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sD = $(".diam"), oD = $(".diam-out");
  const nU = $(".vu"), nM = $(".vm"), nNeed = $(".need"), msg = $(".sal-msg");
  const MY_MAX = 20;

  const dOf = () => Math.pow(10, +sD.value); // 로그 슬라이더
  const vUn = (d) => 1.1 * Math.sqrt(d);
  const vMy = (d) => 6 * d;

  let d = 10, t = 0, hold = 0; // t: 실제 시간(초), 재생 배율로 늘여서 보여 준다
  const { ctx, size } = fit(cv, () => draw());

  const fmtD = (x) => x >= 100 ? `${Math.round(x)}` : x >= 10 ? x.toFixed(0) : x.toFixed(1);
  const fmtV = (v) => v >= 10 ? v.toFixed(0) : v.toFixed(1);
  const fmtT = (s) => s * 1000 >= 100 ? `${Math.round(s * 1000)} ms` : `${(s * 1000).toFixed(1)} ms`;

  function speeds() {
    const vu = vUn(d), vm = d <= MY_MAX ? vMy(d) : null;
    return { vu, vm, slow: vu, fast: vm || vu };
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = speeds();
    const pad = 14, x0 = pad + 4, x1 = w - pad - 4, len = x1 - x0;
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";

    /* 위: 1 m 경주 */
    const topH = h * 0.46;
    ctx.fillStyle = C.ink2; ctx.fillText("1 m를 달리는 경주 (척수에서 발끝까지 어림)", x0, 16);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`;
    ctx.fillText(`t = ${fmtT(t)}`, x1, 16);
    const track = (y, v, label, color, myel) => {
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
      ctx.fillText(label, x0, y - 10);
      ctx.fillStyle = "#ece8dc"; ctx.fillRect(x0, y - 4, len, 8);
      if (myel) { ctx.fillStyle = "#f4ecd2"; for (let i = 0; i < 40; i++) ctx.fillRect(x0 + i * len / 40 + 1, y - 7, len / 40 - 2, 14); }
      if (v == null) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("이 굵기의 말이집 신경은 척추동물에 없음", x0 + len / 2, y + 4); return; }
      const p = clamp(v * t, 0, 1);
      ctx.fillStyle = color; ctx.fillRect(x0, y - 3, len * p, 6);
      ctx.beginPath(); ctx.arc(x0 + len * p, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = "right"; ctx.fillStyle = p >= 1 ? color : C.ink3;
      ctx.fillText(p >= 1 ? `도착 ${fmtT(1 / v)}` : "", x1, y - 10);
    };
    track(topH * 0.46, s.vu, `말이집 없음 · ${fmtV(s.vu)} m/s`, C.warn, false);
    track(topH * 0.86, s.vm, `말이집 있음 · ${s.vm ? fmtV(s.vm) + " m/s" : "—"}`, C.forest, true);

    /* 아래: 확대 그림 — 마디 6칸 */
    const y0 = topH + 14, bh = h - y0 - 6;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(pad, y0 - 6); ctx.lineTo(w - pad, y0 - 6); ctx.stroke();
    const dm = Math.min(d, MY_MAX), inter = 100 * dm * 1e-6; // 마디 사이 거리 ≈ 지름의 100배 (m)
    const win = inter * 6;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    ctx.fillText(`확대: ${win * 1000 >= 1 ? (win * 1000).toFixed(1) + " mm" : Math.round(win * 1e6) + " μm"} 구간, 훨씬 느리게 재생`, x0, y0 + 10);
    const zt = zoomT();
    // 말이집 없음 (위)
    const ya = y0 + bh * 0.36, yb = y0 + bh * 0.76, r = Math.max(6, Math.min(12, bh * 0.08));
    const pu = s.vu * zt / win;
    axon(ya, r, false, pu, C.warn, s);
    // 말이집 있음 (아래)
    if (s.vm) axon(yb, r, true, s.vm * zt / win, C.forest, s);
    else { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("—", x0 + len / 2, yb + 4); }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("말이집 없음", x0, ya - r - 8);
    ctx.fillText("말이집 있음 · 랑비에 결절에서만 활동 전위", x0, yb - r - 12);

    function axon(y, rr, myel, p, color) {
      // p: 앞머리 위치 (0~1 = 창 전체), 뒤쪽은 흥분이 남아 있다
      ctx.fillStyle = "#ece8dc"; ctx.fillRect(x0, y - rr * 0.55, len, rr * 1.1);
      const front = clamp(p, 0, 1.2);
      if (!myel) {
        const gx = x0 + len * Math.min(front, 1);
        const grd = ctx.createLinearGradient(gx - len * 0.5, 0, gx, 0);
        grd.addColorStop(0, "rgba(181,83,47,0)"); grd.addColorStop(1, "rgba(181,83,47,.75)");
        ctx.fillStyle = grd; ctx.fillRect(Math.max(x0, gx - len * 0.5), y - rr * 0.55, Math.min(len * 0.5, gx - x0), rr * 1.1);
        if (front > 0 && front < 1) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(gx, y, 4, 0, Math.PI * 2); ctx.fill(); }
        return;
      }
      const seg = len / 6, node = Math.max(4, seg * 0.07);
      for (let i = 0; i < 6; i++) {
        const sx = x0 + i * seg + node / 2;
        ctx.fillStyle = "#f1e5bf"; ctx.strokeStyle = "#cdbb85";
        ctx.beginPath(); ctx.roundRect(sx, y - rr, seg - node, rr * 2, rr * 0.8); ctx.fill(); ctx.stroke();
      }
      const reached = Math.floor(front * 6 + 1e-9); // 도달한 마디 수
      for (let i = 0; i <= 6; i++) {
        const nx = x0 + i * seg;
        const on = i <= reached && front >= 0;
        ctx.fillStyle = on ? color : C.rule;
        ctx.globalAlpha = on ? (i === reached ? 1 : 0.55) : 1;
        ctx.fillRect(nx - node / 2, y - rr * 0.55, node, rr * 1.1);
        ctx.globalAlpha = 1;
        if (on && i === reached && reached < 6) {
          // 다음 마디까지 축삭 안을 흐르는 국소 전류 (화살표)
          ctx.strokeStyle = color; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(nx + node, y); ctx.lineTo(nx + seg - node, y); ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(nx + seg - node, y); ctx.lineTo(nx + seg - node - 5, y - 3); ctx.lineTo(nx + seg - node - 5, y + 3); ctx.fill();
        }
      }
    }
  }

  // 확대 그림의 재생 시간: 말이집 있는 쪽이 창을 약 2초에 지나도록
  let zclock = 0;
  const zoomT = () => {
    const s = speeds(), dm = Math.min(d, MY_MAX), win = 600 * dm * 1e-6;
    return zclock * (win / s.fast) / 2.0;
  };

  function update() {
    d = dOf();
    oD.textContent = fmtD(d);
    const s = speeds();
    nU.textContent = `${fmtV(s.vu)} m/s`;
    nM.textContent = s.vm ? `${fmtV(s.vm)} m/s` : "—";
    const need = s.vm ? Math.pow(s.vm / 1.1, 2) : null;
    nNeed.textContent = need ? (need >= 1000 ? `${(need / 1000).toFixed(1)} mm` : `${Math.round(need)} μm`) : "—";
    msg.textContent = s.vm
      ? `말이집 있는 축삭이 약 ${Math.round(s.vm / s.vu)}배 빠릅니다. 말이집 없이 이 속도를 내려면 지름이 ${nNeed.textContent}는 되어야 합니다.`
      : "오징어처럼 말이집이 없는 동물은 축삭을 굵게 만들어 속도를 얻습니다. 이만큼 굵어도 초속 수십 m에 그칩니다.";
    t = 0; hold = 0; zclock = 0;
    draw();
  }

  sD.addEventListener("input", update);
  $(".restart").addEventListener("click", update);
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { sD.value = Math.log10(+b.dataset.d); update(); }));
  update();

  loop(cv, (dt) => {
    const s = speeds();
    const total = 1 / s.slow; // 느린 쪽이 도착하는 실제 시간
    const rate = total / 6; // 느린 쪽이 약 6초에 도착하도록
    if (t < total) t = Math.min(total, t + dt * rate);
    else { hold += dt; if (hold > 2) { t = 0; hold = 0; } }
    zclock += dt; if (zclock > 7) zclock = 0;
    draw();
  });
})();
