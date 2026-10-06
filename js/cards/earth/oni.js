/* 카드: 실제 관측 자료에서 엘니뇨와 라니냐의 해를 찾을 수 있을까? — NOAA CPC ONI·SOI 실측, 5계절 규칙 판정, 학생 표시와 비교 */
(() => {
  const root = document.getElementById("card-earth-oni");
  if (!root || !window.NMOni) return;
  const { C, F, fit, axes } = NM;
  const D = NMOni, $ = (s) => root.querySelector(s);
  const SEAS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"];
  const EN = "#c4462f", LN = "#2f62a8";
  // CPC처럼 소수 첫째 자리로 반올림한 값에 규칙을 적용
  const r1 = D.oni.map((v) => Math.round(v * 10) / 10);
  const N = r1.length, tOf = (k) => D.y0 + k / 12 + 1 / 24, sname = (k) => `${SEAS[k % 12]} ${D.y0 + Math.floor(k / 12)}`;

  // 3개월 평균 SOI를 ONI 계절에 맞춤 (ONI k의 가운데 달 = 1950년 1월부터 k번째 달)
  const soi3 = r1.map((_, k) => {
    const v = [k - 13, k - 12, k - 11].map((m) => D.soi[m]);
    return v.every((x) => x != null && Number.isFinite(x)) ? (v[0] + v[1] + v[2]) / 3 : null;
  });

  // NOAA 규칙: +0.5 이상(−0.5 이하)이 겹치는 3개월 평균으로 5계절 이상 이어지면 엘니뇨(라니냐)
  function episodes(th, run) {
    const out = []; let i = 0;
    while (i < N) {
      const s = r1[i] >= th ? 1 : r1[i] <= -th ? -1 : 0;
      if (!s) { i++; continue; }
      let j = i; while (j < N && (s > 0 ? r1[j] >= th : r1[j] <= -th)) j++;
      if (j - i >= run) out.push({ s, a: i, b: j - 1 });
      i = j;
    }
    return out;
  }
  const EPS = episodes(0.5, 5);
  // 겨울 Y–Y+1: NDJ(Y) 또는 DJF(Y+1)가 사건 안에 들면 그 사건의 해
  const W0 = D.y0 - 1, W1 = D.y0 + Math.floor((N - 1) / 12) - 1;
  const ruleOf = (Y) => { const k = (Y + 1 - D.y0) * 12; const e = EPS.find((e) => (k >= e.a && k <= e.b) || (k - 1 >= e.a && k - 1 <= e.b)); return e ? e.s : 0; };

  const EVENTS = {
    "1982": { a: 1982, s: 1, t: "1982–83 엘니뇨", fx: "에콰도르·페루 북부에 폭우와 홍수, 오스트레일리아 동부에 가뭄과 큰 산불이 났습니다. 페루 앞바다의 용승이 약해져 멸치 어획이 크게 줄었습니다." },
    "1997": { a: 1997, s: 1, t: "1997–98 엘니뇨", fx: "페루·에콰도르 홍수, 인도네시아 가뭄과 대규모 산불(동남아시아 연무), 열대 산호의 대규모 백화가 겹쳤습니다. 페루 멸치 어획이 크게 줄어 어분 값이 올랐습니다. 1998년은 그때까지 관측 사상 가장 더운 해였습니다." },
    "2015": { a: 2015, s: 1, t: "2015–16 엘니뇨", fx: "인도네시아에 큰 산불이 나고, 에티오피아·남부 아프리카에 가뭄이 들어 식량 부족이 생겼습니다. 2016년 그레이트배리어리프에서 대규모 산호 백화가 일어났고, 2016년은 그때까지 가장 더운 해였습니다." },
    "2023": { a: 2023, s: 1, t: "2023–24 엘니뇨", fx: "온난화 추세 위에 엘니뇨가 겹쳐 2023·2024년 지구 평균 기온이 잇따라 기록을 깼습니다. 아마존 유역의 큰 가뭄(2023)과 남부 아프리카 가뭄(2024 초)이 이어졌습니다. 가뭄의 원인에는 엘니뇨 말고도 다른 요인이 함께 작용했습니다." },
    "2010": { a: 2010, s: -1, t: "2010–11 라니냐", fx: "오스트레일리아 퀸즐랜드에 큰 홍수가 났고, 동아프리카에는 우기에 비가 오지 않아 심한 가뭄이 들었습니다. 페루 앞바다는 찬물이 강하게 솟아 평소처럼 어획이 유지되었습니다." },
    "2020": { a: 2020, s: -1, t: "2020–23 세 해 연속 라니냐", fx: "라니냐가 세 겨울 연속 이어진 드문 경우입니다. 동아프리카에서 우기 실패가 여러 번 겹친 가뭄, 오스트레일리아 동부의 홍수(2022)가 있었습니다." },
    "2026": { a: 2026, s: 1, t: "2026년 (자료 끝, 진행 중)", fx: "2026년 봄부터 ONI가 +0.5를 넘어 이어지고 있습니다. 아직 진행 중이라 최고값과 영향은 정해지지 않았고, 최근 값은 나중에 고쳐질 수 있습니다." },
  };

  let win = [D.y0, D.y0 + N / 12], reveal = false, ev = null;
  const marks = new Map();
  const a = fit($(".on-ts"), () => draw()), b = fit($(".on-sc"), () => drawSc());
  const BOX = (w, h) => ({ x0: 34, y0: 22, w: w - 66, h: h - 56 });

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = BOX(w, h), [t0, t1] = win, ylo = -2.5, yhi = 3;
    const X = (t) => box.x0 + (t - t0) / (t1 - t0) * box.w, Y = (v) => box.y0 + (yhi - v) / (yhi - ylo) * box.h;
    a.X = X; a.box = box;
    const span = t1 - t0, step = span > 40 ? 10 : span > 15 ? 5 : 1;
    const xt = []; for (let y = Math.ceil(t0 / step) * step; y <= t1; y += step) xt.push([y, String(y)]);
    axes(ctx, { ...box, X, Y, xt, yt: [-2, -1, 0, 1, 2, 3].map((v) => [v, (v > 0 ? "+" : "") + v]), ylabel: "ONI (°C, 니뇨 3.4 해역 수온 편차)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    if (reveal) EPS.forEach((e) => { ctx.fillStyle = e.s > 0 ? "rgba(196,70,47,.13)" : "rgba(47,98,168,.13)"; ctx.fillRect(X(tOf(e.a) - 1 / 24), box.y0, X(tOf(e.b) + 1 / 24) - X(tOf(e.a) - 1 / 24), box.h); });
    if (ev) { const x0 = X(ev.a + 0.25), x1 = X(ev.a + (ev.a === 2020 ? 3.4 : 1.4)); ctx.strokeStyle = ev.s > 0 ? EN : LN; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.strokeRect(x0, box.y0 + 1, x1 - x0, box.h - 2); ctx.setLineDash([]); }
    // 막대: 0보다 크면 붉게, 작으면 푸르게
    const bw = Math.max(1, box.w / ((t1 - t0) * 12) * 0.9);
    for (let k = 0; k < N; k++) {
      const t = tOf(k); if (t < t0 - 0.1 || t > t1 + 0.1) continue;
      const v = D.oni[k];
      ctx.fillStyle = v >= 0.5 ? EN : v <= -0.5 ? LN : v >= 0 ? "rgba(196,70,47,.35)" : "rgba(47,98,168,.35)";
      ctx.fillRect(X(t) - bw / 2, Math.min(Y(v), Y(0)), bw, Math.abs(Y(v) - Y(0)));
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    [0.5, -0.5].forEach((v) => { ctx.beginPath(); ctx.moveTo(box.x0, Y(v)); ctx.lineTo(box.x0 + box.w, Y(v)); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    ctx.fillText("+0.5", box.x0 + box.w + 2, Y(0.5) + 3); ctx.fillText("−0.5", box.x0 + box.w + 2, Y(-0.5) + 3);
    // 학생 표시 (겨울마다 위쪽 삼각형)
    marks.forEach((s, Y0) => {
      const t = Y0 + 1 + 1 / 24; if (t < t0 || t > t1) return;
      const x = X(t), y = box.y0 + 7, rs = ruleOf(Y0);
      ctx.fillStyle = s > 0 ? EN : LN; ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x - 5, y - 4); ctx.lineTo(x + 5, y - 4); ctx.fill();
      if (reveal) { ctx.strokeStyle = rs === s ? C.forest : C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke(); if (rs !== s) { ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.stroke(); } }
    });
    if (!marks.size && !reveal) { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("그래프를 누르면 그 겨울에 엘니뇨 → 라니냐 → 지움 순서로 표시됩니다", box.x0 + box.w / 2, h - 4); }
    else { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`표시 ${marks.size}개`, box.x0, h - 4); }
  }

  function corr(xs, ys) {
    const n = xs.length, mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
    return sxy / Math.sqrt(sxx * syy);
  }
  const pairs = []; for (let k = 0; k < N; k++) if (soi3[k] != null) pairs.push([D.oni[k], soi3[k], k]);
  const R = corr(pairs.map((p) => p[0]), pairs.map((p) => p[1]));

  function drawSc() {
    const { ctx } = b, { w, h } = b.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 52 };
    const X = (v) => box.x0 + (v + 2.5) / 5.5 * box.w, Y = (v) => box.y0 + (3 - v) / 6 * box.h;
    axes(ctx, { ...box, X, Y, xt: [-2, -1, 0, 1, 2, 3].map((v) => [v, String(v)]), yt: [-3, -2, -1, 0, 1, 2, 3].map((v) => [v, String(v)]), xlabel: "ONI (°C)", ylabel: "SOI (같은 3개월 평균, 표준화)" });
    const inEv = (k) => ev && tOf(k) >= ev.a + 0.25 && tOf(k) <= ev.a + (ev.a === 2020 ? 3.4 : 1.4);
    pairs.forEach(([o, s, k]) => { if (inEv(k)) return; ctx.fillStyle = o >= 0.5 ? "rgba(196,70,47,.35)" : o <= -0.5 ? "rgba(47,98,168,.35)" : "rgba(120,120,120,.25)"; ctx.beginPath(); ctx.arc(X(o), Y(s), 1.8, 0, Math.PI * 2); ctx.fill(); });
    if (ev) pairs.forEach(([o, s, k]) => { if (!inEv(k)) return; ctx.fillStyle = ev.s > 0 ? EN : LN; ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.arc(X(o), Y(s), 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    // 최소제곱 직선
    const mx = pairs.reduce((s, p) => s + p[0], 0) / pairs.length, my = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;
    const sl = pairs.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pairs.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(-2.5), Y(my + sl * (-2.5 - mx))); ctx.lineTo(X(3), Y(my + sl * (3 - mx))); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`r = ${R.toFixed(2)}  (n = ${pairs.length})`, box.x0 + box.w - 4, box.y0 + 14);
  }

  function compare() {
    let hit = 0, miss = 0, fa = 0;
    for (let Y0 = W0; Y0 <= W1; Y0++) {
      if (Y0 + 1 < win[0] || Y0 + 1 > win[1]) continue;
      const rs = ruleOf(Y0), ms = marks.get(Y0) || 0;
      if (rs && ms === rs) hit++; else if (rs && !ms) miss++;
      if (ms && ms !== rs) fa++;
    }
    return { hit, miss, fa };
  }
  function update() {
    draw(); drawSc();
    const nEN = new Set(), nLN = new Set();
    for (let Y0 = W0; Y0 <= W1; Y0++) { const s = ruleOf(Y0); if (s > 0) nEN.add(Y0); else if (s < 0) nLN.add(Y0); }
    $(".n-r").textContent = R.toFixed(2);
    const v = $(".verdict");
    if (ev) {
      const k0 = Math.round((ev.a + 0.25 - D.y0) * 12), k1 = Math.min(N - 1, Math.round((ev.a + (ev.a === 2020 ? 3.4 : 1.4) - D.y0) * 12));
      let pk = k0; for (let k = k0; k <= k1; k++) if (ev.s * D.oni[k] > ev.s * D.oni[pk]) pk = k;
      const e = EPS.find((e) => pk >= e.a && pk <= e.b);
      $(".n-p").textContent = `${D.oni[pk] > 0 ? "+" : ""}${D.oni[pk].toFixed(2)} °C`;
      $(".n-d").textContent = e ? `${e.b - e.a + 1}계절${e.b === N - 1 ? "+" : ""}` : "—";
      const ss = []; for (let k = k0; k <= k1; k++) if (soi3[k] != null) ss.push(soi3[k]);
      $(".n-s").textContent = ss.length ? (ss.reduce((s, x) => s + x, 0) / ss.length).toFixed(1) : "—";
      $(".ev-msg").innerHTML = `<b>${ev.t}</b> (가장 강했던 때 ${sname(pk)}). ${ev.fx}`;
    } else { ["n-p", "n-d", "n-s"].forEach((c) => ($("." + c).textContent = "—")); $(".ev-msg").textContent = ""; }
    if (reveal) {
      const { hit, miss, fa } = compare();
      v.className = "verdict small " + (marks.size && !fa && !miss ? "good" : marks.size ? "bad" : "");
      v.textContent = `1950년 이후 규칙상 엘니뇨 겨울 ${nEN.size}번, 라니냐 겨울 ${nLN.size}번(색 띠). ` + (marks.size ? `보이는 구간에서 규칙과 같은 표시 ${hit}개, 놓친 사건의 겨울 ${miss}개, 규칙과 다른 표시 ${fa}개. 동그라미가 초록이면 맞고, ×는 규칙과 다릅니다.` : "그래프를 눌러 내 판단을 표시해 비교해 보세요.");
    } else v.textContent = "";
  }

  $(".on-ts").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), box = a.box; if (!box) return;
    const t = win[0] + (e.clientX - r.left - box.x0) / box.w * (win[1] - win[0]);
    const Y0 = Math.round(t - 1 - 1 / 24); if (Y0 < W0 || Y0 > W1) return;
    const s = marks.get(Y0) || 0, nx = s === 0 ? 1 : s === 1 ? -1 : 0;
    nx ? marks.set(Y0, nx) : marks.delete(Y0); update();
  });
  const press = (sel, btn) => root.querySelectorAll(sel).forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
  $(".wins").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-w]"); if (!bt) return;
    const [p, q] = bt.dataset.w.split("-").map(Number); win = [p, q || D.y0 + N / 12]; press(".wins [data-w]", bt); update();
  });
  $(".evs").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-e]"); if (!bt) return;
    ev = EVENTS[bt.dataset.e]; press(".evs [data-e]", bt); press(".wins [data-w]", null);
    win = [Math.max(D.y0, ev.a - 3), Math.min(D.y0 + N / 12, ev.a + 4)]; update();
  });
  $(".go").addEventListener("click", () => { reveal = !reveal; $(".go").textContent = reveal ? "판정 숨기기" : "규칙으로 판정하기"; update(); });
  $(".clr").addEventListener("click", () => { marks.clear(); update(); });
  update();
  if (/[?&]demo\b/.test(location.search)) {
    root.querySelector('[data-w="1980-2000"]').click();
    [[1982, 1], [1986, 1], [1988, -1], [1991, 1], [1993, 1], [1997, 1], [1998, -1]].forEach(([y, s]) => marks.set(y, s));
    $(".go").click();
    root.querySelector('[data-e="1997"]').click();
    win = [1980, 2000]; update();
  }
})();
