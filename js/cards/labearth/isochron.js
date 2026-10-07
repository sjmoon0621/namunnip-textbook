/* 카드: 어떤 방사성 시계를 골라야 암석의 나이를 제대로 잴 수 있을까? — Rb–Sr 등시선, K–Ar, U–Pb, ¹⁴C (가상 시료, 실제 붕괴 상수) */
(() => {
  const root = document.getElementById("card-labearth-isochron");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 붕괴 상수 (1/년): Steiger & Jäger 1977 (K, U), Villa 외 2015 (Rb) */
  const LRB = 1.3972e-11, LK = 5.543e-10, LKE = 0.581e-10, LU = 1.55125e-10, T14 = 5730, L14 = Math.LN2 / T14;
  /* 가상 시료: t 참 나이(년), sr0 처음 ⁸⁷Sr/⁸⁶Sr, rb 광물별 ⁸⁷Rb/⁸⁶Sr, tK K–Ar 겉보기 나이(나중 가열로 Ar 손실) */
  const S = {
    gr: { name: "화강암", t: 175e6, sr0: 0.7080, rb: { wr: 1.8, pl: 0.15, kf: 3.5, bt: 60, ms: 25 }, K: true, zr: true },
    ba: { name: "현무암", t: 0.8e6, sr0: 0.7040, rb: { wr: 0.12, pl: 0.02 }, K: true, zr: false },
    gn: { name: "편마암", t: 1870e6, sr0: 0.7030, rb: { wr: 2.2, pl: 0.3, kf: 4.0, bt: 30, ms: 12 }, K: true, tK: 230e6, zr: true },
    ch: { name: "숯", t: 4500, carbon: true },
  };
  const MN = { wr: "전암", pl: "사장석", kf: "정장석", bt: "흑운모", ms: "백운모" };
  const METH = { rbsr: "Rb–Sr", kar: "K–Ar", upb: "U–Pb", c14: "¹⁴C" };
  let samp = "gr", meth = "rbsr", mineral = "wr", last = null;

  const fmtAge = (t) => {
    if (!Number.isFinite(t)) return "—";
    const a = Math.abs(t), sg = t < 0 ? "−" : "";
    if (a >= 1e8) return sg + (a / 1e8).toFixed(2) + "억 년";
    if (a >= 1e4) return sg + (a / 1e4).toFixed(1) + "만 년";
    return sg + Math.round(a).toLocaleString("ko-KR") + "년";
  };
  const ageOf = (m, R) => m === "kar" ? Math.log(1 + LK / LKE * R) / LK : m === "upb" ? Math.log(1 + R) / LU : m === "c14" ? -Math.log(R) / L14 : NaN;

  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "시료" }, { key: "m", label: "방법" }, { key: "tg", label: "대상" },
    { key: "r1s", label: "⁸⁷Rb/⁸⁶Sr · D/P · N/N₀" }, { key: "r2", label: "⁸⁷Sr/⁸⁶Sr", res: 0.00001 }, { key: "age", label: "나이 / 비고" },
  ], () => { drawPlot(); drawSpec(); });

  function measure() {
    const s = S[samp];
    const row = { s: s.name, m: METH[meth], tg: "—", r1: "—", r2: "—", age: "—", _s: samp, _m: meth };
    if (meth === "rbsr") {
      row.tg = MN[mineral];
      if (s.carbon) { row.age = "Rb·Sr 거의 없음"; }
      else if (!(mineral in s.rb)) { row.age = `${MN[mineral]} 없음`; }
      else {
        const x = s.rb[mineral];
        row.r1 = L.measure(x, { rel: 0.01, res: 0.0001 });
        row.r2 = L.measure(s.sr0 + x * Math.expm1(LRB * s.t), { sd: 0.00005, res: 0.00001 });
        row.age = "등시선으로";
      }
    } else if (meth === "kar") {
      row.tg = samp === "ba" ? "전암" : "흑운모";
      if (s.carbon) row.age = "칼륨 거의 없음";
      else { const t = s.tK || s.t; row.r1 = L.measure(LKE / LK * Math.expm1(LK * t), { rel: 0.015, res: 1e-7 }); row.age = fmtAge(ageOf("kar", row.r1)); }
    } else if (meth === "upb") {
      row.tg = "지르콘";
      if (!s.zr) row.age = s.carbon ? "우라늄 없음" : "지르콘이 거의 없음";
      else { row.r1 = L.measure(Math.expm1(LU * s.t), { rel: 0.005, res: 1e-6 }); row.age = fmtAge(ageOf("upb", row.r1)); }
    } else {
      row.tg = s.carbon ? "숯" : "탄소 없음";
      if (!s.carbon) row.age = "생물 탄소가 없음";
      else {
        let f = Math.exp(-L14 * s.t);
        if ($(".contam").checked) f = 0.98 * f + 0.02;
        row.r1 = L.measure(f, { rel: 0.005, res: 0.0001 });
        row.age = row.r1 < 0.002 ? "검출 한계 이하" : fmtAge(ageOf("c14", row.r1));
      }
    }
    if (typeof row.r1 === "number") row.r1s = row.r1 < 0.001 ? row.r1.toExponential(3) : +row.r1.toPrecision(5) + "";
    last = row;
    tbl.add(row);
  }

  /* ── 질량 분석기 그림 ── */
  const sp = fit($(".ic-cv"), () => drawSpec());
  function drawSpec() {
    const { ctx } = sp, { w, h } = sp.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    /* 장치 모식: 이온원 → 자석(부채꼴) → 검출기. 무거운 이온일수록 덜 휜다 */
    const ax = w * 0.05, ay = h * 0.8, mx = w * 0.17, rr0 = Math.min(w * 0.2, h * 0.42);
    ctx.fillStyle = "#c9ccd2"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(mx, ay - rr0, rr0 + 16, Math.PI / 2, 0, true); ctx.arc(mx, ay - rr0, rr0 - 16, 0, Math.PI / 2, false); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(ax - 12, ay - 12, 24, 24); ctx.strokeRect(ax - 12, ay - 12, 24, 24);
    [[-8, C.forest], [0, C.warn], [8, C.amber]].forEach(([d, col]) => {
      const rr = rr0 + d;
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(ax + 12, ay); ctx.lineTo(mx, ay);
      ctx.arc(mx, ay - rr, rr, Math.PI / 2, 0, true); ctx.lineTo(mx + rr, h * 0.1); ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(mx + rr - 4, h * 0.1 - 6, 8, 6);
    });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("이온원", ax - 12, ay + 24); ctx.fillText("자석", mx + rr0 * 0.2, ay - rr0 * 0.15); ctx.fillText("검출기", mx + rr0 + 14, h * 0.1);
    /* 봉우리: 모원소와 자원소의 상대량 */
    const bx = w * 0.5, bw = w * 0.46, by = h * 0.82, bh = h * 0.62;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.stroke();
    let bars = [];
    const r = last;
    if (r && typeof r.r1 === "number") {
      if (r._m === "rbsr") bars = [["⁸⁶Sr", 1], ["⁸⁷Sr", r.r2], ["⁸⁷Rb", r.r1]];
      else if (r._m === "c14") bars = [["¹⁴C 남은 비율", r.r1], ["붕괴함", 1 - r.r1]];
      else { const P = 1 / (1 + r.r1); bars = [[r._m === "kar" ? "⁴⁰K" : "²³⁸U", P], [r._m === "kar" ? "⁴⁰Ar*" : "²⁰⁶Pb", r.r1 * P]]; }
    }
    const mx2 = Math.max(1e-9, ...bars.map((b) => b[1]));
    bars.forEach(([lab, v], i) => {
      const x = bx + 14 + i * (bw / Math.max(3, bars.length)), hh = Math.max(1.5, v / mx2 * bh);
      ctx.fillStyle = [C.forest, C.warn, C.amber][i]; ctx.fillRect(x, by - hh, 22, hh);
      ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(lab, x - 4, by + 14);
      ctx.fillStyle = C.ink3; ctx.fillText(v < 0.001 ? v.toExponential(2) : v.toFixed(4), x - 4, by - hh - 5);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(bars.length ? `마지막 측정: ${r.s} · ${r.m} · ${r.tg}` : (r ? `마지막 측정: ${r.s} · ${r.m} — ${r.age}` : "아직 측정하지 않았습니다"), bx, 14);
  }

  /* ── 그래프 ── */
  const pv = fit($(".ic-plot"), () => drawPlot());
  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 58, y0: 22, w: w - 72, h: h - 58 };
    const rows = tbl.rows.filter((r) => r._s === samp && r._m === meth && typeof r.r1 === "number");
    const n1 = $(".n1"), n2 = $(".n2"), n3 = $(".n3");
    if (meth === "rbsr") {
      $(".n1-l").textContent = "등시선 기울기"; $(".n2-l").textContent = "초기 ⁸⁷Sr/⁸⁶Sr";
      const pts = rows.map((r) => ({ x: r.r1, y: r.r2 }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
      L.plot(ctx, b, { pts, fit: f, xlabel: "⁸⁷Rb/⁸⁶Sr", ylabel: "⁸⁷Sr/⁸⁶Sr" });
      if (f) {
        const t = Math.log1p(f.a) / LRB, dt = (f.sa || 0) / ((1 + f.a) * LRB);
        n1.textContent = f.a.toExponential(3); n2.textContent = f.b.toFixed(5);
        n3.textContent = Number.isFinite(dt) && dt > 0 ? `${fmtAge(t)} ± ${fmtAge(dt)}` : fmtAge(t);
      } else { n1.textContent = "—"; n2.textContent = "—"; n3.textContent = "광물 2개 이상"; }
      return;
    }
    $(".n1-l").textContent = meth === "c14" ? "N/N₀ 평균" : "D/P 평균"; $(".n2-l").textContent = "측정 횟수";
    const st = L.stats(rows.map((r) => r.r1));
    const ages = rows.map((r) => ageOf(meth, r.r1)).filter(Number.isFinite);
    let tmax = { kar: 5e8, upb: 3e9, c14: 4e4 }[meth];
    if (ages.length) tmax = Math.max(...ages) * 2.2;
    const unit = tmax >= 1e7 ? 1e6 : tmax >= 1e4 ? 1e3 : 1, ul = unit === 1e6 ? "백만 년" : unit === 1e3 ? "천 년" : "년";
    const g = (t) => meth === "kar" ? LKE / LK * Math.expm1(LK * t) : meth === "upb" ? Math.expm1(LU * t) : Math.exp(-L14 * t);
    const ymax = meth === "c14" ? 1.05 : g(tmax) * 1.08;
    const r = L.plot(ctx, b, { pts: [], model: (x) => g(x * unit), xr: [0, tmax / unit], yr: [0, ymax], xlabel: `시간 (${ul})`, ylabel: meth === "c14" ? "남은 ¹⁴C 비율 N/N₀" : meth === "kar" ? "⁴⁰Ar*/⁴⁰K" : "²⁰⁶Pb/²³⁸U" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    rows.forEach((row) => {
      const t = ageOf(meth, row.r1) / unit;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(r.X(0), r.Y(row.r1)); ctx.lineTo(r.X(t), r.Y(row.r1)); ctx.lineTo(r.X(t), r.Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(r.X(t), r.Y(row.r1), 3.4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    n1.textContent = st.n ? (st.mean < 0.001 ? st.mean.toExponential(3) : st.mean.toFixed(5)) : "—";
    n2.textContent = String(st.n);
    const sa = L.stats(ages);
    n3.textContent = sa.n ? (sa.n > 1 ? `${fmtAge(sa.mean)} ± ${fmtAge(sa.se)}` : fmtAge(sa.mean)) : "—";
  }

  /* ── 조작 ── */
  const group = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    set(b.dataset[attr]); $(".ic-min").classList.toggle("on", meth === "rbsr"); drawPlot();
  });
  group(".ic-samp", "s", (v) => { samp = v; });
  group(".ic-meth", "m", (v) => { meth = v; });
  group(".ic-min", "x", (v) => { mineral = v; });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; drawSpec(); });

  if (L.demo) {
    ["wr", "pl", "kf", "bt", "ms"].forEach((m) => { mineral = m; measure(); });
    meth = "kar"; measure(); measure(); meth = "upb"; measure();
    samp = "gn"; meth = "kar"; measure(); meth = "upb"; measure();
    samp = "ch"; meth = "upb"; measure(); meth = "c14"; measure();
    samp = "gr"; meth = "rbsr"; mineral = "wr";
    tbl.add(tbl.rows.pop());
    drawPlot();
  }
})();
