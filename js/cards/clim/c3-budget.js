/* 카드: 탄소중립은 왜 ‘언제까지’만큼 ‘어떻게 줄이느냐’가 중요할까? — GCB 2025 과거 배출 + IPCC AR6 남은 탄소 예산 */
(() => {
  const root = document.getElementById("card-clim-budget");
  if (!root || !window.NMBudget) return;
  const { C, F, fit, axes, clamp } = NM;
  const D = NMBudget, $ = (s) => root.querySelector(s);
  const N = D.fos.length, YL = D.y0 + N - 1;                // 마지막 관측 해 (2024)
  const tot = D.fos.map((v, i) => v + D.luc[i]);
  const E0 = tot[N - 1];
  const sumRange = (a, b) => { let s = 0; for (let y = a; y <= b; y++) s += tot[y - D.y0]; return s; };
  const used2020 = sumRange(2020, YL), cumAll = sumRange(D.y0, YL);
  // IPCC AR6 WG1 표 SPM.2 (2020년 1월 1일부터, GtCO₂)
  const GOALS = [["1.5 °C (50 %)", 500], ["1.5 °C (67 %)", 400], ["1.7 °C (67 %)", 700], ["2 °C (67 %)", 1150]];
  const TCRE = 0.45;
  let goal = 0, shape = "lin";

  function path() {
    const s = +$(".sy").value, z = +$(".zy").value, out = [];
    for (let y = YL + 1; y <= 2100; y++) {
      let f;
      if (y <= s) f = 1;
      else if (y >= z) f = 0;
      else {
        const t = (y - s) / (z - s);
        f = shape === "lin" ? 1 - t : shape === "front" ? (1 - t) ** 2.2 : 1 - t ** 2.2;
      }
      out.push(E0 * f);
    }
    return out;
  }

  const A = fit($(".bg-ts"), () => draw()), B = fit($(".bg-bar"), () => drawBar());
  let P = [], cum = 0, budget = 0, outY = null;

  function compute() {
    const sy = $(".sy"), zy = $(".zy");
    if (+zy.value < +sy.value + 5) zy.value = +sy.value + 5;
    P = path(); budget = GOALS[goal][1] - used2020;
    cum = 0; outY = null;
    P.forEach((v, i) => { cum += v; if (outY === null && cum > budget) outY = YL + 1 + i; });
  }

  function draw() {
    const { ctx } = A, { w, h } = A.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 34, y0: 22, w: w - 58, h: h - 50 }, x0y = 1850, x1y = 2100, top = 50;
    const X = (y) => box.x0 + (y - x0y) / (x1y - x0y) * box.w, Y = (v) => box.y0 + box.h - v / top * box.h;
    axes(ctx, { ...box, X, Y, xt: [1850, 1900, 1950, 2000, 2050, 2100].map((y) => [y, String(y)]), yt: [0, 10, 20, 30, 40, 50].map((v) => [v, String(v)]), ylabel: "전 지구 CO₂ 배출 (GtCO₂/년)" });
    // 과거: 화석 + 토지 이용 (쌓기)
    const bw = box.w / (x1y - x0y);
    for (let i = 0; i < N; i++) {
      const y = D.y0 + i, x = X(y);
      ctx.fillStyle = "#8d8d92"; ctx.fillRect(x, Y(D.fos[i]), bw + 0.4, box.y0 + box.h - Y(D.fos[i]));
      ctx.fillStyle = "#b9a37a"; ctx.fillRect(x, Y(tot[i]), bw + 0.4, Y(D.fos[i]) - Y(tot[i]));
    }
    // 미래 경로: 예산 안(초록) / 넘은 뒤(붉은)
    let c = 0;
    P.forEach((v, i) => {
      const y = YL + 1 + i; c += v;
      ctx.fillStyle = c <= budget ? "rgba(59,124,42,.55)" : "rgba(181,83,47,.55)";
      ctx.fillRect(X(y), Y(v), bw + 0.4, box.y0 + box.h - Y(v));
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(X(YL) + bw / 2, Y(E0)); P.forEach((v, i) => ctx.lineTo(X(YL + 1 + i) + bw / 2, Y(v))); ctx.stroke(); ctx.lineWidth = 1;
    // 지금 선
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(2025) + .5, box.y0); ctx.lineTo(X(2025) + .5, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    // 범례
    const L = [["#8d8d92", "화석 연료·산업"], ["#b9a37a", "토지 이용 변화"], ["rgba(59,124,42,.55)", "미래: 예산 안"], ["rgba(181,83,47,.55)", "미래: 예산 초과"]];
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    L.forEach(([col, t], k) => { const x = box.x0 + 8, y = box.y0 + 10 + k * 15; ctx.fillStyle = col; ctx.fillRect(x, y - 8, 11, 9); ctx.fillStyle = C.ink2; ctx.fillText(t, x + 16, y); });
    if (outY) {
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${outY}년 예산 소진`, clamp(X(outY), box.x0 + 60, box.x0 + box.w - 60), Y(Math.min(top, E0 + 4)));
    }
  }

  function drawBar() {
    const { ctx } = B, { w, h } = B.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 10, ww = w - 20, mx = Math.max(1300, cum * 1.05), X = (v) => x0 + v / mx * ww;
    const yb = 24, bh = 24;
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("2025년 이후 누적 배출 (GtCO₂)과 목표별 남은 예산", x0, 14);
    ctx.fillStyle = cum <= budget ? "rgba(59,124,42,.6)" : "rgba(181,83,47,.6)";
    ctx.fillRect(X(0), yb, X(cum) - X(0), bh);
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`;
    const tx = X(cum) + 6 > w - 60 ? X(cum) - 6 : X(cum) + 6; ctx.textAlign = X(cum) + 6 > w - 60 ? "right" : "left";
    ctx.fillText(`${Math.round(cum)} Gt`, tx, yb + 17);
    GOALS.forEach(([n, b0], k) => {
      const b = b0 - used2020, x = X(b) + .5, on = k === goal;
      ctx.strokeStyle = on ? C.ink : C.ink3; ctx.lineWidth = on ? 2 : 1; ctx.setLineDash(on ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(x, yb - 4); ctx.lineTo(x, yb + bh + 6); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `${on ? "600 " : ""}10px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(n, clamp(x, x0 + 40, w - 40), yb + bh + 18 + (k === 0 || k === 3 ? 13 : 0));
    });
  }

  function update() {
    compute();
    $(".s-out").textContent = $(".sy").value; $(".z-out").textContent = $(".zy").value;
    $(".n-c").textContent = Math.round(cum) + " Gt";
    $(".n-b").textContent = Math.round(budget) + " Gt";
    const ny = $(".n-y"); ny.textContent = outY ? outY + "년" : "넘지 않음"; ny.className = "n-y " + (outY ? "bad" : "good");
    const e30 = P[2030 - YL - 1]; $(".n-30").textContent = `${e30.toFixed(0)} Gt (−${Math.round((1 - e30 / E0) * 100)} %)`;
    const v = $(".bg-v"), dT = TCRE * cum / 1000;
    v.className = "verdict small bg-v " + (cum <= budget ? "good" : "bad");
    v.textContent = (cum <= budget ? `${GOALS[goal][0]} 예산 안입니다.` : `${GOALS[goal][0]} 예산을 ${Math.round(cum - budget)} Gt 넘습니다.`) +
      ` 2025년 이후 배출로 더해지는 온난화는 약 ${dT.toFixed(2)} °C입니다(누적 1000 Gt당 0.45 °C로 셈). 지금 수준(${E0.toFixed(1)} Gt/년)을 유지하면 이 예산은 ${(budget / E0).toFixed(1)}년이면 다 씁니다. 참고로 1850–2024년 누적 배출은 약 ${Math.round(cumAll)} Gt입니다.`;
    draw(); drawBar();
  }

  root.querySelectorAll(".bg-goal .chip").forEach((b) => b.addEventListener("click", () => {
    goal = +b.dataset.g; root.querySelectorAll(".bg-goal .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  root.querySelectorAll(".bg-shape .chip").forEach((b) => b.addEventListener("click", () => {
    shape = b.dataset.s; root.querySelectorAll(".bg-shape .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  $(".sy").addEventListener("input", update);
  $(".zy").addEventListener("input", update);
  update();
})();
