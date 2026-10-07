/* 카드: 기후 요소와 기후 인자 — 다섯 곳의 기후 그래프(ERA5 평년값 1991–2020)를 서울과 비교 */
(() => {
  const root = document.getElementById("card-clim-factors");
  if (!root || !window.NMClimo) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const P = {}; NMClimo.forEach((p) => { P[p.k] = p; });
  const SEOUL = P.seoul;
  // 서울과 비교한 가장 큰 차이를 만드는 기후 인자 (정답)
  const KEY = {
    seoul: null,
    sf: { ok: "sea", why: "샌프란시스코는 서울과 위도가 같지만 대륙 서쪽 해안에 있어 바다에서 불어오는 바람을 받고, 앞바다에는 찬 캘리포니아 해류가 흐릅니다. 바다는 천천히 데워지고 천천히 식으므로 연교차가 아주 작고, 여름이 서늘합니다. 여름에는 아열대 고기압에 덮여 비가 거의 오지 않습니다." },
    irk: { ok: "land", why: "이르쿠츠크는 서울보다 15° 북쪽이고 바다에서 수천 km 떨어진 대륙 안쪽입니다. 위도 때문에 연평균 기온이 낮고, 땅은 빨리 데워지고 빨리 식으므로 연교차가 40 °C 가까이 됩니다. 바다에서 오는 수증기가 적어 강수량도 적습니다." },
    lhasa: { ok: "alt", why: "라싸는 서울보다 8° 남쪽이라 햇빛은 더 강하지만, 해발 약 3650 m의 티베트고원에 있습니다. 높이 올라갈수록 기온이 낮아지므로(대류권에서 1 km에 약 6.5 °C) 연평균 기온이 서울보다 낮습니다." },
    sg: { ok: "lat", why: "싱가포르는 적도 바로 옆(1.4°N)입니다. 한 해 내내 태양이 높이 떠서 받는 햇빛의 양이 거의 바뀌지 않으므로 연교차가 1~2 °C에 그치고, 적도 저압대의 상승 기류로 비가 연중 많이 옵니다." },
  };
  const FN = { lat: "위도", alt: "해발 고도", sea: "바다·해류", land: "대륙 내부 (수륙 분포)" };
  let cur = "sf";
  const a = fit($(".fc-cv"), () => draw());
  const COL = { t: "#c4462f", p: "#2f62a8", ghost: "rgba(93,93,97,.45)" };

  function stats(p) {
    const mean = p.t.reduce((s, v) => s + v, 0) / 12, rng = Math.max(...p.t) - Math.min(...p.t);
    const tot = p.p.reduce((s, v) => s + v, 0), sum = p.p[5] + p.p[6] + p.p[7];
    return { mean, rng, tot, summer: sum / tot };
  }

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[cur];
    const box = { x0: 38, y0: 26, w: w - 80, h: h - 54 }, tlo = -25, thi = 35, phi = 350;
    const X = (m) => box.x0 + (m + 0.5) / 12 * box.w, Y = (v) => box.y0 + (thi - v) / (thi - tlo) * box.h, YP = (v) => box.y0 + box.h - v / phi * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 2, 4, 6, 8, 10].map((m) => [m, `${m + 1}월`]), yt: [-20, -10, 0, 10, 20, 30].map((v) => [v, String(v)]) });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = COL.t; ctx.textAlign = "left"; ctx.fillText("기온 (°C)", box.x0, box.y0 - 9);
    ctx.fillStyle = COL.p; ctx.textAlign = "right"; ctx.fillText("강수량 (mm/월)", box.x0 + box.w + 36, box.y0 - 9);
    ctx.textAlign = "left";
    [0, 100, 200, 300].forEach((v) => ctx.fillText(String(v), box.x0 + box.w + 6, YP(v) + 3));
    const bw = box.w / 12 * 0.62;
    // 서울(회색 테두리)과 고른 곳(파랑)의 강수
    for (let m = 0; m < 12; m++) {
      ctx.fillStyle = "rgba(47,98,168,.55)"; ctx.fillRect(X(m) - bw / 2, YP(Math.min(p.p[m], phi)), bw, YP(0) - YP(Math.min(p.p[m], phi)));
      if (cur !== "seoul") { ctx.strokeStyle = COL.ghost; ctx.lineWidth = 1; ctx.strokeRect(X(m) - bw / 2 + 0.5, YP(Math.min(SEOUL.p[m], phi)) + 0.5, bw - 1, YP(0) - YP(Math.min(SEOUL.p[m], phi)) - 1); }
    }
    const line = (arr, c, lw, dash) => {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      arr.forEach((v, m) => { const q = [X(m), Y(v)]; m ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.stroke(); ctx.setLineDash([]);
    };
    if (cur !== "seoul") line(SEOUL.t, COL.ghost, 1.6, [5, 3]);
    line(p.t, COL.t, 2.6, []);
    p.t.forEach((v, m) => { ctx.fillStyle = COL.t; ctx.beginPath(); ctx.arc(X(m), Y(v), 2.6, 0, Math.PI * 2); ctx.fill(); });
    // 범례
    ctx.font = `10.5px ${F.sans}`;
    const lx = box.x0 + 8, ly = box.y0 + 12;
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(lx - 4, ly - 11, 150, cur === "seoul" ? 18 : 32);
    ctx.fillStyle = COL.t; ctx.fillRect(lx, ly - 4, 14, 2.6); ctx.fillStyle = C.ink; ctx.fillText(`${p.name} (${p.lat}°N, ${p.elev} m)`, lx + 20, ly);
    if (cur !== "seoul") { ctx.strokeStyle = COL.ghost; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(lx, ly + 11); ctx.lineTo(lx + 14, ly + 11); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.fillText("서울 (회색 선·테두리)", lx + 20, ly + 14); }
  }

  function update() {
    const p = P[cur], s = stats(p), s0 = stats(SEOUL);
    const d = (v, v0, u, k = 1) => cur === "seoul" ? `${v.toFixed(k)}${u}` : `${v.toFixed(k)}${u} (서울 ${v0.toFixed(k)})`;
    $(".n-m").textContent = d(s.mean, s0.mean, " °C");
    $(".n-r").textContent = d(s.rng, s0.rng, " °C");
    $(".n-p").textContent = d(s.tot, s0.tot, " mm", 0);
    $(".n-s").textContent = cur === "seoul" ? `${Math.round(s.summer * 100)} %` : `${Math.round(s.summer * 100)} % (서울 ${Math.round(s0.summer * 100)})`;
    root.querySelectorAll(".guess [data-f]").forEach((bt) => { bt.disabled = cur === "seoul"; bt.setAttribute("aria-pressed", "false"); });
    const v = $(".verdict");
    v.className = "verdict small";
    v.textContent = cur === "seoul"
      ? "서울은 대륙 동쪽 해안의 중위도에 있습니다. 겨울에는 시베리아 고기압에서 찬 북서 계절풍이, 여름에는 북태평양 고기압에서 덥고 습한 남풍이 불어, 연교차가 크고 비가 여름(6–8월)에 몰립니다. 이 계절풍도 대륙과 바다가 나뉜 모양(수륙 분포)이 만든 것입니다."
      : `서울과 비교했을 때 ${p.name}의 기후를 가장 크게 바꾼 기후 인자는 무엇일까요? 아래에서 고르세요.`;
    draw();
  }

  $(".places").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-k]"); if (!bt) return;
    cur = bt.dataset.k; root.querySelectorAll(".places [data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  });
  $(".guess").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-f]"); if (!bt || !KEY[cur]) return;
    root.querySelectorAll(".guess [data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
    const k = KEY[cur], ok = bt.dataset.f === k.ok, v = $(".verdict");
    v.className = "verdict small " + (ok ? "good" : "bad");
    v.textContent = ok ? `맞습니다. ${k.why}` : `${FN[bt.dataset.f]}도 조금은 영향을 주지만, 가장 큰 차이를 만든 인자는 아닙니다. 연평균 기온, 연교차, 강수의 계절 분포를 서울과 다시 비교해 보세요.`;
  });
  update();
  if (/[?&]demo\b/.test(location.search)) root.querySelector('.guess [data-f="sea"]').click();
})();
