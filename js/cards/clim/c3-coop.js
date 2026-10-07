/* 카드: 모두에게 이로운 감축을 왜 서로 미루고, 협약은 그것을 어떻게 바꿀까? — 반복 공공재 게임 (모식, 상대값) */
(() => {
  const root = document.getElementById("card-clim-cooperate");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const NR = 8, Y0 = 2025, E = 10, B = 0.3, R0 = 0.3;
  const NAMES = ["우리나라", "가 나라", "나 나라", "다 나라", "라 나라"];
  const COLS = [C.ink, "#2f62a8", "#3f8f5a", "#c08a1f", "#8a4f9e"];
  const K = [null, 0.72, 0.8, 0.88, 0.96];        // 다른 나라가 남을 따라가는 정도
  let hist, score, round;

  const opt = () => ({ tr: $(".t-tr").checked, rc: $(".t-rc").checked, tc: $(".t-tc").checked });
  const cost = (t) => opt().tc ? Math.pow(0.75, t) : 1;

  function reset() { hist = []; score = [0, 0, 0, 0, 0]; round = 0; update(); }

  function play(myR) {
    if (round >= NR) return;
    const o = opt(), c = cost(round);
    let r;
    if (round === 0) r = [myR, R0, R0, R0, R0];
    else {
      const prev = hist[round - 1];
      r = prev.map((v, i) => {
        if (i === 0) return myR;
        const others = prev.filter((_, j) => j !== i);
        const seen = others.reduce((s, x) => s + x, 0) / others.length * (o.tr ? 1 : 0.8);
        let n = K[i] * seen + (c < B ? 0.3 : 0);
        if (o.tr) n += 0.03;          // 점검을 받으면 약속을 조금 더 지키려 함
        n = Math.min(1, Math.max(0, n));
        if (o.rc) n = Math.max(n, v);
        return n;
      });
      if (o.rc && myR < prev[0]) r[0] = prev[0];
    }
    const tot = r.reduce((s, x) => s + E * x, 0);
    r.forEach((x, i) => { score[i] += B * tot - c * E * x; });
    hist.push(r); round++;
  }

  const A = fit($(".co-cv"), () => draw());
  function draw() {
    const { ctx } = A, { w, h } = A.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 24, w: w - 140, h: h - 54 };
    const X = (k) => box.x0 + (k + 0.5) / NR * box.w, Y = (v) => box.y0 + (1 - v) * box.h;
    axes(ctx, { ...box, X, Y, xt: Array.from({ length: NR }, (_, k) => [k, `${Y0 + 5 * k}`]), yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, Math.round(v * 100) + "%"]), ylabel: "감축률 (선) · 세계 배출 (막대, 상대값)" });
    // 세계 배출 막대 (최대 50)
    hist.forEach((r, k) => {
      const em = r.reduce((s, x) => s + E * (1 - x), 0) / 50;
      ctx.fillStyle = "rgba(181,83,47,.16)"; const bw = box.w / NR * 0.6;
      ctx.fillRect(X(k) - bw / 2, Y(em), bw, box.y0 + box.h - Y(em));
    });
    for (let i = 4; i >= 0; i--) {
      ctx.strokeStyle = COLS[i]; ctx.fillStyle = COLS[i]; ctx.lineWidth = i === 0 ? 2.6 : 1.5;
      ctx.beginPath(); hist.forEach((r, k) => { k ? ctx.lineTo(X(k), Y(r[i])) : ctx.moveTo(X(k), Y(r[i])); }); ctx.stroke();
      hist.forEach((r, k) => { ctx.beginPath(); ctx.arc(X(k), Y(r[i]), i === 0 ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.lineWidth = 1;
    // 범례
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    NAMES.forEach((n, i) => { const x = box.x0 + box.w + 14, y = box.y0 + 10 + i * 17; ctx.fillStyle = COLS[i]; ctx.fillRect(x, y - 4, 12, i === 0 ? 3 : 2); ctx.fillStyle = C.ink2; ctx.fillText(n, x + 17, y); });
    const x = box.x0 + box.w + 14, y = box.y0 + 10 + 5 * 17 + 4;
    ctx.fillStyle = "rgba(181,83,47,.3)"; ctx.fillRect(x, y - 8, 12, 10); ctx.fillStyle = C.ink2; ctx.fillText("세계 배출", x + 17, y);
    if (!hist.length) {
      ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("감축률을 정하고 “5년 진행”을 누르세요", box.x0 + box.w / 2, box.y0 + box.h / 2);
    }
  }

  function update() {
    $(".r-out").textContent = $(".rr").value;
    $(".n-t").textContent = round ? `${Y0}–${Y0 + 5 * round - 1}` : "시작 전";
    $(".n-me").textContent = score[0].toFixed(0);
    $(".n-ot").textContent = (score.slice(1).reduce((s, x) => s + x, 0) / 4).toFixed(0);
    const em = hist.reduce((s, r) => s + r.reduce((a, x) => a + E * (1 - x), 0), 0);
    $(".n-em").textContent = round ? `${em.toFixed(0)} / ${50 * round}` : "—";
    const v = $(".co-v");
    if (!round) { v.className = "verdict small co-v"; v.textContent = "다섯 나라가 처음에 모두 30 %씩 줄이기로 했습니다. 모두 100 % 줄이면 각 나라는 5년마다 이익 5를 얻고, 아무도 줄이지 않으면 0입니다."; }
    else {
      const last = hist[round - 1], avg = last.slice(1).reduce((s, x) => s + x, 0) / 4;
      const trend = round > 1 ? avg - hist[round - 2].slice(1).reduce((s, x) => s + x, 0) / 4 : 0;
      v.className = "verdict small co-v " + (avg >= 0.6 ? "good" : avg < 0.25 ? "bad" : "");
      const tw = Math.abs(trend) < 0.005 ? "지난 5년과 거의 같습니다. " : `지난 5년보다 ${trend > 0 ? "늘었" : "줄었"}습니다 (${trend > 0 ? "+" : ""}${(trend * 100).toFixed(1)} %p). `;
      v.textContent = `다른 나라의 평균 감축률은 ${Math.round(avg * 100)} %로, ` + tw +
        (opt().tc ? `지금 감축 비용은 1단위에 ${cost(round - 1).toFixed(2)}입니다. ` : "") +
        (round >= NR ? "게임이 끝났습니다. 규칙을 바꿔 처음부터 다시 해 보세요." : "");
    }
    root.querySelector(".next5").disabled = round >= NR; root.querySelector(".all8").disabled = round >= NR;
    draw();
  }

  $(".rr").addEventListener("input", update);
  $(".next5").addEventListener("click", () => { play(+$(".rr").value / 100); update(); });
  $(".all8").addEventListener("click", () => { while (round < NR) play(+$(".rr").value / 100); update(); });
  $(".reset").addEventListener("click", reset);
  root.querySelectorAll(".co-tog input").forEach((el) => el.addEventListener("change", reset));
  reset();
  if (/[?&]demo\b/.test(location.search)) { while (round < NR) play(0.3); update(); }
})();
