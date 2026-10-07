/* 카드: 두 집단의 평균 차이는 우연일까, 효과일까? — 웰치·짝지은 t 검정, p값의 분포, 효과 크기, 이상값
   실제 자료: Cushny & Peebles (1905) J. Physiol. 32:501–510, Student (1908) Biometrika 6:1–25에 인용.
   R datasets의 sleep 자료와 같은 값 (늘어난 수면 시간, 시간). */
(() => {
  const root = document.getElementById("card-resr-ttest");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, S = NMRsStat;
  const $ = (s) => root.querySelector(s);
  const SLEEP_A = [0.7, -1.6, -0.2, -1.2, -0.1, 3.4, 3.7, 0.8, 0.0, 2.0];
  const SLEEP_B = [1.9, 0.8, 1.1, 0.1, -0.1, 4.4, 5.5, 1.6, 4.6, 3.4];
  let src = "sim", pair = 0, outlier = false, n = 8, eff = 1;
  let A = [], B = [], res = null;
  const ps = [];

  function sample() {
    A = Array.from({ length: n }, () => 10 + 2 * L.gauss());
    B = Array.from({ length: n }, () => 10 + eff + 2 * L.gauss());
  }
  function analyse(record) {
    let a = A, b = B;
    if (src === "sleep") { a = SLEEP_A; b = SLEEP_B; }
    else if (outlier) b = [...B.slice(0, -1), 25];
    res = src === "sleep" && pair ? S.paired(a, b) : S.welch(a, b);
    res.a = a; res.b = b;
    if (record && src === "sim") { ps.push({ p: res.p, k: outlier }); if (ps.length > 200) ps.shift(); }
  }

  const cv = fit($(".cv-wide"), () => drawMain());
  const hv = fit($(".tt-hist"), () => drawHist());

  function drawMain() {
    const { ctx } = cv, { w, h } = cv.size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    const lw = w * 0.5, all = [...res.a, ...res.b];
    let lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.1 || 1; lo -= pad; hi += pad;
    const box = { x0: 36, y0: 22, w: lw - 46, h: h - 50 };
    const Y = (v) => box.y0 + box.h - (v - lo) / (hi - lo) * box.h;
    NM.axes(ctx, { ...box, X: (v) => v, Y, xt: [], yt: L.ticks(lo, hi, 4).map((v) => [v, String(+v.toPrecision(3))]), ylabel: src === "sleep" ? "늘어난 수면 (시간)" : "자란 키 (cm)" });
    const xa = box.x0 + box.w * 0.28, xb = box.x0 + box.w * 0.72;
    const names = src === "sleep" ? ["약 1", "약 2"] : ["대조군", "비료"];
    if (src === "sleep" && pair) {
      ctx.strokeStyle = "rgba(93,93,97,0.35)"; ctx.lineWidth = 1;
      res.a.forEach((v, i) => { ctx.beginPath(); ctx.moveTo(xa, Y(v)); ctx.lineTo(xb, Y(res.b[i])); ctx.stroke(); });
    }
    const strip = (vals, x, col) => {
      vals.forEach((v, i) => {
        const jit = src === "sleep" && pair ? 0 : ((i * 7) % 9 - 4) * 2.2;
        ctx.fillStyle = col; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(x + jit, Y(v), 3.2, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      });
      const st = L.stats(vals), tc = S.tcrit(vals.length - 1), e = tc * st.se, bx = x + 22;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(bx, Y(st.mean - e)); ctx.lineTo(bx, Y(st.mean + e)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 6, Y(st.mean)); ctx.lineTo(bx + 6, Y(st.mean)); ctx.stroke();
    };
    strip(res.a, xa, C.amber); strip(res.b, xb, C.forest);
    ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(names[0], xa, h - 10); ctx.fillText(names[1], xb, h - 10);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText("막대: 평균 ± 95% 구간", box.x0 + box.w, box.y0 - 7);

    /* 오른쪽: 귀무가설 아래 t 분포 */
    const rb = { x0: lw + 16, y0: 22, w: w - lw - 26, h: h - 50 }, df = res.df, T = 6;
    const pdf = (t) => Math.pow(1 + t * t / df, -(df + 1) / 2);
    let norm = 0; for (let i = -600; i <= 600; i++) norm += pdf(i / 50) / 50;
    const top = 0.42, X = (t) => rb.x0 + (t + T) / (2 * T) * rb.w, YY = (p) => rb.y0 + rb.h - p / top * rb.h;
    NM.axes(ctx, { ...rb, X, Y: YY, xt: [-4, -2, 0, 2, 4].map((v) => [v, String(v)]), yt: [], xlabel: "t" });
    const tt = Math.abs(res.t);
    ctx.fillStyle = "rgba(212,73,58,0.35)";
    [[-T, -tt], [tt, T]].forEach(([s, e]) => {
      if (e <= s) return;
      ctx.beginPath(); ctx.moveTo(X(s), YY(0));
      for (let i = 0; i <= 60; i++) { const t = s + (e - s) * i / 60; ctx.lineTo(X(t), YY(pdf(t) / norm)); }
      ctx.lineTo(X(e), YY(0)); ctx.closePath(); ctx.fill();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const t = -T + 2 * T * i / 120; i ? ctx.lineTo(X(t), YY(pdf(t) / norm)) : ctx.moveTo(X(t), YY(pdf(t) / norm)); }
    ctx.stroke();
    const tc = S.tcrit(df);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    [-tc, tc].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), rb.y0 + rb.h * 0.3); ctx.lineTo(X(v), YY(0)); ctx.stroke(); });
    ctx.setLineDash([]);
    const tx = X(Math.max(-T, Math.min(T, res.t)));
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, rb.y0 + 14); ctx.lineTo(tx, YY(0)); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.font = `11px ${F.mono}`;
    ctx.textAlign = res.t > 0 ? "left" : "right";
    ctx.fillText(`이번 t = ${res.t.toFixed(2)}`, res.t > 0 ? rb.x0 + 2 : rb.x0 + rb.w, rb.y0 + 10);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("효과 없을 때 t 분포", rb.x0, rb.y0 - 7);
  }

  function drawHist() {
    const { ctx } = hv, { w, h } = hv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (src !== "sim") {
      ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("실제 자료는 한 번 얻은 자료라 다시 뽑을 수 없습니다.", w / 2, h / 2);
      return;
    }
    const box = { x0: 40, y0: 18, w: w - 52, h: h - 50 };
    const lp = (p) => Math.log10(Math.max(p, 1e-4));
    const X = (v) => box.x0 + (v + 4) / 4 * box.w;
    NM.axes(ctx, { ...box, X, Y: (v) => v, xt: [[-4, "0.0001"], [-3, "0.001"], [-2, "0.01"], [lp(0.05), "0.05"], [0, "1"]], yt: [], xlabel: "p값 (로그 눈금)" });
    ctx.fillStyle = "rgba(212,73,58,0.08)"; ctx.fillRect(box.x0, box.y0, X(lp(0.05)) - box.x0, box.h);
    const nb = 32, cnt = new Array(nb).fill(0);
    const bins = ps.map((q) => Math.min(nb - 1, Math.floor((lp(q.p) + 4) / 4 * nb)));
    const top = Math.max(4, ...bins.reduce((c, b) => (c[b]++, c), new Array(nb).fill(0)));
    ps.forEach((q, i) => {
      const b = bins[i], k = cnt[b]++;
      const cx = box.x0 + (b + 0.5) * box.w / nb, cy = box.y0 + box.h - (k + 0.5) * box.h / top;
      ctx.fillStyle = q.k ? C.warn : C.forest; ctx.beginPath(); ctx.arc(cx, cy, Math.min(3.2, box.h / top / 2), 0, 7); ctx.fill();
    });
    const sig = ps.filter((q) => q.p < 0.05).length;
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`p < 0.05: ${sig} / ${ps.length}`, box.x0 + box.w, box.y0 - 5);
  }

  function readout() {
    const r = res, f = (v) => (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1));
    $(".v-d").textContent = `${f(r.diff)} (${f(r.lo)}~${f(r.hi)})`;
    $(".v-t").textContent = `${r.t.toFixed(2)} (${r.df.toFixed(src === "sleep" && pair ? 0 : 1)})`;
    $(".v-p").textContent = S.fp(r.p);
    $(".v-p").className = "v-p " + (r.p < 0.05 ? "good" : "");
    $(".v-es").textContent = r.d.toFixed(2);
    const v = $(".verdict"); v.className = "verdict small";
    if (src === "sleep") {
      v.textContent = pair
        ? `짝지어 비교하면 환자마다의 차이(약 2 − 약 1)만 봅니다. 평균 차는 같지만 표준오차가 작아져 t가 커지고 p = ${S.fp(r.p)}입니다. 설계가 검정 방법을 정합니다.`
        : `독립 집단처럼 비교하면 환자 사이의 큰 개인차가 그대로 잡음이 되어 p = ${S.fp(r.p)}입니다. 그러나 이 자료는 같은 환자에게서 얻은 것입니다.`;
      return;
    }
    if (outlier) v.textContent = "잘못 적은 값 하나가 처리군 평균을 끌어올리고 표준편차도 크게 부풀렸습니다. 평균 차는 커졌지만 구간이 넓어졌습니다. 기록을 확인해 이유가 분명하면 고치거나 빼고, 그 사실을 밝힙니다.";
    else if (eff === 0 && ps.length >= 20) v.textContent = `참효과가 0인데도 p < 0.05가 약 5%쯤 나옵니다. 0.05를 기준으로 삼으면 효과가 없을 때 20번에 한 번꼴로 "효과 있음"이라고 잘못 판단합니다.`;
    else v.textContent = "";
  }
  const update = (record) => { analyse(record); drawMain(); drawHist(); readout(); };

  root.querySelector(".card-fig").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.src) {
      src = b.dataset.src;
      root.querySelectorAll("[data-src]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $(".tt-sim").hidden = src !== "sim"; $(".tt-real").hidden = src === "sim"; $(".tt-hist").hidden = src !== "sim";
      $(".tt-note").textContent = src === "sim"
        ? "모식 실험은 2주 동안 자란 키를 정규 분포에서 뽑았습니다(대조군 평균 10 cm, 표준편차 2 cm). 검정은 두 집단의 분산이 다를 수 있다고 보는 웰치 t 검정입니다."
        : "자료: Cushny & Peebles (1905), Student (1908)이 인용. 두 수면제를 각각 먹었을 때 평소보다 늘어난 수면 시간(시간), 환자 10명. 짝지은 비교는 차이 10개에 대한 t 검정입니다.";
      update(false);
    } else if (b.dataset.pair) {
      pair = +b.dataset.pair; root.querySelectorAll("[data-pair]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(false);
    } else if (b.classList.contains("again")) { sample(); update(true); }
    else if (b.classList.contains("again20")) { for (let i = 0; i < 20; i++) { sample(); analyse(true); } update(false); }
    else if (b.classList.contains("out")) { outlier = !outlier; b.setAttribute("aria-pressed", String(outlier)); update(false); }
    else if (b.classList.contains("clear")) { ps.length = 0; update(false); }
  });
  $(".n").addEventListener("input", () => { n = +$(".n").value; $(".n-out").textContent = n; ps.length = 0; sample(); update(true); });
  $(".e").addEventListener("input", () => { eff = +$(".e").value; $(".e-out").textContent = eff.toFixed(eff % 1 ? 2 : 1); ps.length = 0; sample(); update(true); });
  sample(); analyse(true);
  if (L.demo) for (let i = 0; i < 39; i++) { sample(); analyse(true); }
  readout();
})();
