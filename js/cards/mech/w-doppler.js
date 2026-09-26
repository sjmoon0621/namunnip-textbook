/* 카드: 다가오는 사이렌은 왜 더 높게 들릴까? — 움직이는 음원의 파면, 앞·뒤 관찰 진동수, 스피드건 */
(() => {
  const root = document.getElementById("card-mech-doppler");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), sF = $(".f"), oV = $(".v-out"), oF = $(".f-out");
  const nFront = $(".n-front"), nBack = $(".n-back"), nLam = $(".n-lam"), nGun = $(".n-gun");
  const VS = 340;
  let t = 0;
  // 화면 시간: 실제 소리 속력 340 m/s를 화면 90 px/s로, 파동은 0.35 s마다 1개 (진동수는 표시용으로 느리게)
  const PX = 90 / VS, EMIT = 0.35;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const vs = +sV.value, cy = h / 2, x0 = w * 0.15, span = w * 0.7;
    // 음원 위치: 화면 왼쪽 15 %에서 출발해 85 %에 이르면 처음부터 되풀이
    const T = vs > 0 ? span / (vs * PX) : Infinity;
    const tt = vs > 0 ? t % T : t, sx = vs > 0 ? x0 + vs * PX * tt : w / 2;
    // 파면: 지금까지 낸 파동들
    const n = Math.floor(tt / EMIT);
    for (let k = Math.max(0, n - 30); k <= n; k++) {
      const te = k * EMIT, age = tt - te; if (age < 0) continue;
      const ex = vs > 0 ? x0 + vs * PX * te : w / 2, r = VS * PX * age;
      if (r > w * 1.2) continue;
      ctx.strokeStyle = `rgba(63,111,163,${Math.max(0.15, 0.8 - age * 0.12)})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(ex, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    // 음원과 관찰자
    ctx.fillStyle = "#b5532f"; ctx.fillRect(sx - 14, cy - 8, 28, 16); ctx.fillStyle = "#fff"; ctx.font = `600 9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("119", sx, cy + 3);
    const man = (x, lab) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, cy - 30, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 2, cy - 24, 4, 16); ctx.font = `11px ${F.sans}`; ctx.fillText(lab, x, cy + 26); };
    man(w - 30, "앞"); man(30, "뒤");
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(vs >= VS * 0.95 ? "소리 속력에 가까움: 앞쪽 파면이 겹침" : "음원 → 오른쪽으로 이동", 10, 16);
  }
  function update() {
    const vs = +sV.value, f = +sF.value;
    oV.textContent = vs; oF.textContent = f;
    const ff = f * VS / (VS - vs), fb = f * VS / (VS + vs);
    nFront.textContent = vs >= VS ? "—" : `${ff.toFixed(0)} Hz`; nBack.textContent = `${fb.toFixed(0)} Hz`;
    nLam.textContent = `${((VS - vs) / f * 100).toFixed(1)} cm`;
    nGun.textContent = `${(2 * Math.min(vs, 100) * 24e9 / 3e8 / 1000).toFixed(1)} kHz`;
    draw();
  }
  [sV, sF].forEach((el) => el.addEventListener("input", update));
  loop(cv, (dt) => { t += dt; draw(); });
  t = 3; update();
})();
