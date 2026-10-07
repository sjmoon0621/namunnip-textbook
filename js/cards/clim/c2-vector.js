/* 카드: 모기가 옮기는 병은 왜 기온이 오르면 더 넓게, 더 오래 퍼질까? — 온도-전파력 곡선(모식) × 실제 월평균 기온 */
(() => {
  const root = document.getElementById("card-clim-vector");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const N = window.NMNormals || {};
  const CITIES = Object.keys(N);
  // [이름, 하한, 최적, 상한] — Mordecai 외(2017) 뎅기 R0의 온도 반응 (최적·한계 온도)
  const MOS = [["흰줄숲모기", 16.2, 26.4, 31.6, "#3f6fa3"], ["이집트숲모기", 17.8, 29.1, 34.6, C.apple]];
  let city = CITIES[0], mos = 0;
  // (T−T0)^p (Tm−T)^0.5 꼴, 봉우리가 최적 온도에 오도록 p를 정하고 최댓값 1로 맞춘다 (모식)
  const curve = ([, T0, Tp, Tm]) => {
    const p = 0.5 * (Tp - T0) / (Tm - Tp), raw = (T) => (T <= T0 || T >= Tm ? 0 : Math.pow(T - T0, p) * Math.sqrt(Tm - T));
    const top = raw(Tp); return (T) => raw(T) / top;
  };
  const R = MOS.map(curve);
  const M = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const g1 = fit($(".c2-curve"), () => draw()), g2 = fit($(".c2-month"), () => draw());

  $(".c2-city").innerHTML = '<span class="mono small dim">도시</span>' + CITIES.map((c, i) => `<button type="button" class="chip" data-c="${c}" aria-pressed="${i === 0}">${c}</button>`).join("");

  function draw() {
    const dT = +$(".dt").value, f = R[mos], col = MOS[mos][4];
    const T = (N[city] || []).map((t) => t + dT), r = T.map(f);
    // 위: 전파력 곡선
    {
      const { ctx, size: { w, h } } = g1; if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const x0 = 36, y0 = 20, gw = w - x0 - 12, gh = h - y0 - 34, lo = -5, hi = 36;
      const X = (t) => x0 + (t - lo) / (hi - lo) * gw, Y = (v) => y0 + gh - v * gh * 0.9;
      axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 10, 20, 30].map((t) => [t, `${t} °C`]), yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], ylabel: "상대 전파력 (모식)" });
      MOS.forEach((m, i) => {
        ctx.beginPath(); for (let t = lo; t <= hi; t += 0.1) { const y = Y(R[i](t)); t === lo ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); }
        ctx.strokeStyle = m[4]; ctx.lineWidth = i === mos ? 2.2 : 1; ctx.globalAlpha = i === mos ? 1 : 0.35; ctx.stroke(); ctx.globalAlpha = 1;
      });
      T.forEach((t, i) => {
        const x = X(t), y = Y(r[i]);
        ctx.fillStyle = r[i] > 0 ? col : C.ink3; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
        if ([0, 3, 6, 7, 9].includes(i)) { ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${M[i]}월`, x, i === 7 ? y + 16 : y - 8); }
      });
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = col;
      ctx.fillText(`${MOS[mos][0]}: 최적 ${MOS[mos][2]} °C`, x0 + 6, y0 + 22); ctx.fillText(`전파 가능 ${MOS[mos][1]}–${MOS[mos][3]} °C`, x0 + 6, y0 + 37);
    }
    // 아래: 달별 막대
    {
      const { ctx, size: { w, h } } = g2; if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const x0 = 36, y0 = 20, gw = w - x0 - 12, gh = h - y0 - 30, bw = gw / 12;
      const Y = (v) => y0 + gh - v * gh;
      axes(ctx, { x0, y0, w: gw, h: gh, X: (i) => x0 + bw * (i + 0.5), Y, xt: M.map((m, i) => [i, `${m}월`]), yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], ylabel: `${city} 달별 상대 전파력 (기온 +${dT.toFixed(1)} °C)` });
      const base = (N[city] || []).map(f);
      r.forEach((v, i) => {
        ctx.fillStyle = col; ctx.globalAlpha = 0.75; ctx.fillRect(x0 + bw * i + bw * 0.18, Y(v), bw * 0.64, Y(0) - Y(v)); ctx.globalAlpha = 1;
        if (dT > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]); ctx.strokeRect(x0 + bw * i + bw * 0.18 + .5, Y(base[i]) + .5, bw * 0.64 - 1, Y(0) - Y(base[i])); ctx.setLineDash([]); }
      });
      if (dT > 0) { ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선: 1991–2020년 기온", x0 + gw - 4, y0 + 4); }
    }
    const on = r.filter((v) => v > 0).length, half = r.filter((v) => v >= 0.5).length, mx = Math.max(...r);
    const base = (N[city] || []).map(f), on0 = base.filter((v) => v > 0).length, half0 = base.filter((v) => v >= 0.5).length;
    $(".n1").textContent = dT > 0 ? `${on0} → ${on}개월` : `${on}개월`;
    $(".n2").textContent = dT > 0 ? `${half0} → ${half}개월` : `${half}개월`;
    $(".n3").textContent = mx.toFixed(2);
    $(".n1").className = "n1" + (on > on0 ? " bad" : "");
    $(".n2").className = "n2" + (half > half0 ? " bad" : "");
  }
  root.addEventListener("click", (e) => {
    const c = e.target.closest("[data-c]"), m = e.target.closest("[data-m]");
    if (c) { city = c.dataset.c; root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b === c))); draw(); }
    if (m) { mos = +m.dataset.m; root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b === m))); draw(); }
  });
  $(".dt").addEventListener("input", () => { $(".t-out").textContent = (+$(".dt").value).toFixed(1); draw(); });
  if (/[?&]demo\b/.test(location.search)) { $(".dt").value = 2; $(".t-out").textContent = "2.0"; }
  draw();
})();
