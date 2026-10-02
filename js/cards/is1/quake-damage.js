/* 카드: 규모가 같은 지진인데 왜 피해는 수백 배씩 다를까? — 진도 감쇠 어림, 건물 취약성, 예산 안에서 대책 고르기 */
(() => {
  const root = document.getElementById("card-is1-quake-damage");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sZ = $(".z"), sR = $(".r"), sP = $(".p");
  const plans = new Set(), BUDGET = 10;
  const Phi = (x) => 1 / (1 + Math.exp(-1.702 * x));   // 정규 누적 분포 근사
  const mmi = (M, R) => Math.min(12, Math.max(1, 1.5 * M - 3.5 * Math.log10(R) + 3));
  // 도시: 반지름 15 km, 인구 밀도는 중심에서 지수적으로 줄어듦. 링마다 진도와 사망률을 더한다
  function assess() {
    const M = +sM.value, z = +sZ.value, d = +sR.value, P = +sP.value * 1e4;
    const code = plans.has("code") ? 0.95 : 0.2;
    let deaths = 0, Ic = mmi(M, Math.hypot(d, z));
    const N = 24;
    for (let i = 0; i < N; i++) for (let j = 0; j < 12; j++) {
      const rr = (i + 0.5) / N * 15, th = j / 12 * 2 * Math.PI;
      const w = Math.exp(-rr / 5) * rr;                                      // 넓이 × 밀도
      const x = d + rr * Math.cos(th), y = rr * Math.sin(th), I = mmi(M, Math.hypot(Math.hypot(x, y), z));
      const rate = (1 - code) * 0.06 * Phi(Math.log(I / 9.6) / 0.08) + code * 0.06 * Phi(Math.log(I / 12) / 0.08);
      deaths += w * rate;
    }
    const norm = Array.from({ length: N }, (_, i) => { const rr = (i + 0.5) / N * 15; return Math.exp(-rr / 5) * rr * 12; }).reduce((a, b) => a + b);
    deaths = deaths / norm * P;
    if (plans.has("warn")) deaths *= 0.8;
    if (plans.has("drill")) deaths *= 0.85;
    if (plans.has("rescue")) deaths *= 0.8;
    return { Ic, deaths, code };
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  const icol = (I) => { const u = Math.max(0, Math.min(1, (I - 4) / 7)); return `rgba(${Math.round(240 - 20 * u)},${Math.round(220 - 170 * u)},${Math.round(140 - 110 * u)},.55)`; };
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const M = +sM.value, z = +sZ.value, d = +sR.value;
    const sc = Math.min(w * 0.55 / (d + 35), h * 0.9 / 60), ex = w * 0.14 + 15 * sc * 0.3, ey = h * 0.5;
    ctx.fillStyle = "#f4f1e8"; ctx.fillRect(0, 0, w, h);
    // 진도 고리 (지표)
    for (let I = 11; I >= 3; I--) {
      // mmi(M,R)=I 인 R
      const R = 10 ** ((1.5 * M + 3 - I) / 3.5); if (R <= z) continue;
      const rs = Math.sqrt(R * R - z * z) * sc;
      ctx.fillStyle = icol(I); ctx.beginPath(); ctx.arc(ex, ey, rs, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.warn; ctx.font = `600 14px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("★", ex, ey + 5);
    ctx.font = `10.5px ${F.sans}`; ctx.fillText("진앙", ex, ey + 18);
    // 도시
    const cx = ex + d * sc, r = assess();
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, ey, 15 * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let k = 0; k < 18; k++) { const a = k * 2.4, rr = Math.sqrt(k / 18) * 12 * sc; const bx = cx + Math.cos(a) * rr, by = ey + Math.sin(a) * rr; ctx.fillStyle = k / 18 < r.code ? "#5d7f9a" : "#a07a5a"; ctx.fillRect(bx - 3, by - 5, 6, 8); }
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText("도시", cx, ey - 15 * sc - 6);
    ctx.font = `10px ${F.mono}`; ctx.fillText(`${d} km`, (ex + cx) / 2, ey + 15 * sc + 14);
    // 진도 범례
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`;
    [[5, "V 약간 피해"], [7, "VII 약한 건물 손상"], [9, "IX 큰 피해"], [11, "XI 대부분 붕괴"]].forEach(([I, t], i) => { ctx.fillStyle = icol(I); ctx.fillRect(w - 128, 12 + i * 16, 12, 12); ctx.fillStyle = C.ink2; ctx.fillText(t, w - 112, 22 + i * 16); });
    ctx.fillStyle = "#5d7f9a"; ctx.fillRect(w - 128, 84, 8, 10); ctx.fillStyle = C.ink2; ctx.fillText("내진 건물", w - 116, 93);
    ctx.fillStyle = "#a07a5a"; ctx.fillRect(w - 128, 100, 8, 10); ctx.fillStyle = C.ink2; ctx.fillText("취약 건물", w - 116, 109);
    // 단면 (깊이)
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(`진원 깊이 ${z} km`, 8, h - 8);
    $(".n-i").textContent = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][Math.round(r.Ic)];
    const D = r.deaths;
    $(".n-d").textContent = D < 1 ? "거의 없음" : D < 10 ? "수 명" : D < 100 ? "수십 명" : D < 1000 ? "수백 명" : D < 1e4 ? "수천 명" : D < 1e5 ? "수만 명" : "수십만 명";
    $(".n-d").className = "n-d " + (D >= 1000 ? "bad" : D < 10 ? "good" : "");
  }
  function cost() { return [...plans].reduce((a, p) => a + +root.querySelector(`[data-p="${p}"]`).dataset.c, 0); }
  const upd = () => { $(".m-out").textContent = (+sM.value).toFixed(1); $(".z-out").textContent = sZ.value; $(".r-out").textContent = sR.value; $(".p-out").textContent = sP.value; $(".n-b").textContent = `${cost()} / ${BUDGET}`; draw(); };
  [sM, sZ, sR, sP].forEach((el) => el.addEventListener("input", upd));
  $(".plans").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    const p = b.dataset.p;
    if (plans.has(p)) plans.delete(p); else { if (cost() + +b.dataset.c > BUDGET) { $(".n-b").textContent = "예산 초과"; return; } plans.add(p); }
    b.setAttribute("aria-pressed", String(plans.has(p))); upd();
  });
  upd();
})();
