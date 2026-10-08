/* 카드: 점 몇 개로 그래프의 뼈대를 세울 수 있을까? — f′, f′ = 0, 증감표, 극점, 절편과 양 끝, 잇기의 여섯 단계 */
(() => {
  const root = document.getElementById("card-calc1-sketch");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n, M = K.M;
  const $ = (s) => root.querySelector(s);
  const FS = [
    { f: (x) => x ** 3 - 3 * x + 1, d: (x) => 3 * x * x - 3, z: [-1, 1], xr: [-2.5, 2.5], yr: [-3, 5], ys: 1,
      fh: "<i>x</i><sup>3</sup> − 3<i>x</i> + 1", dh: "3<i>x</i><sup>2</sup> − 3 = 3(<i>x</i> + 1)(<i>x</i> − 1)",
      end: "최고차항 <i>x</i><sup>3</sup>의 계수가 양수이므로 왼쪽 끝은 아래로, 오른쪽 끝은 위로 갑니다." },
    { f: (x) => x ** 4 - 2 * x * x, d: (x) => 4 * x ** 3 - 4 * x, z: [-1, 0, 1], xr: [-2, 2], yr: [-2, 3], ys: 1,
      fh: "<i>x</i><sup>4</sup> − 2<i>x</i><sup>2</sup>", dh: "4<i>x</i><sup>3</sup> − 4<i>x</i> = 4<i>x</i>(<i>x</i> + 1)(<i>x</i> − 1)",
      end: "최고차항 <i>x</i><sup>4</sup>의 계수가 양수이고 차수가 짝수이므로 양 끝이 모두 위로 갑니다." },
    { f: (x) => -(x ** 4) + 4 * x ** 3, d: (x) => -4 * x ** 3 + 12 * x * x, z: [0, 3], xr: [-1.5, 4.5], yr: [-10, 30], ys: 10,
      fh: "−<i>x</i><sup>4</sup> + 4<i>x</i><sup>3</sup>", dh: "−4<i>x</i><sup>3</sup> + 12<i>x</i><sup>2</sup> = −4<i>x</i><sup>2</sup>(<i>x</i> − 3)",
      end: "최고차항 −<i>x</i><sup>4</sup>의 계수가 음수이고 차수가 짝수이므로 양 끝이 모두 아래로 갑니다." },
  ];
  let F = FS[0], step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const kind = (z) => { const l = F.d(z - 1e-3), r = F.d(z + 1e-3); return l > 0 && r < 0 ? "max" : l < 0 && r > 0 ? "min" : "none"; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: F.xr, yr: F.yr, ys: F.ys });
    if (step >= 2) for (const z of F.z) { ctx.save(); ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(g.X(z), g.y0); ctx.lineTo(g.X(z), g.y0 + g.h); ctx.stroke(); ctx.restore(); }
    if (step >= 5) {
      const s = (F.xr[1] - F.xr[0]) * 0.07;
      K.curve(ctx, g, F.f, C.ink3, { from: F.xr[0], to: F.xr[0] + s, width: 3 });
      K.curve(ctx, g, F.f, C.ink3, { from: F.xr[1] - s, to: F.xr[1], width: 3 });
      K.dot(ctx, g, 0, F.f(0), C.ink3, false, 4);
    }
    if (step >= 6) K.curve(ctx, g, F.f, C.forest, { width: 2.6 });
    if (step >= 4) for (const z of F.z) {
      const k = kind(z), y = F.f(z), col = k === "max" ? C.forest : k === "min" ? C.warn : C.ink;
      K.dot(ctx, g, z, y, col, k === "none", 5.5);
      const lab = `${k === "max" ? "극대" : k === "min" ? "극소" : "극값 아님"} (${n(z)}, ${n(y)})`;
      K.tag(ctx, g, lab, g.X(z) + 8, g.Y(y) + (k === "min" ? 16 : -16), col);
    }
  }

  function table() {
    const pts = [-Infinity, ...F.z, Infinity];
    let r1 = "<th><i>x</i></th>", r2 = "<th>f′(<i>x</i>)</th>", r3 = "<th>f(<i>x</i>)</th>";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mid = !isFinite(a) ? b - 0.5 : !isFinite(b) ? a + 0.5 : (a + b) / 2;
      const s = F.d(mid), cls = s > 0 ? "up" : "dn";
      r1 += "<td>…</td>"; r2 += `<td class="${cls}">${s > 0 ? "+" : M}</td>`; r3 += `<td class="${cls}">${s > 0 ? "↗" : "↘"}</td>`;
      if (isFinite(b)) {
        const k = kind(b);
        r1 += `<td>${n(b)}</td>`; r2 += "<td>0</td>"; r3 += `<td>${n(F.f(b))}${k === "none" ? "" : ` <b>${k === "max" ? "극대" : "극소"}</b>`}</td>`;
      }
    }
    return `<tr>${r1}</tr><tr>${r2}</tr><tr>${r3}</tr>`;
  }

  function update() {
    const T = [
      `f(<i>x</i>) = ${F.fh}의 그래프를 그려 봅니다. "다음 단계"를 누르세요.`,
      `① f′(<i>x</i>) = ${F.dh}`,
      `② f′(<i>x</i>) = 0에서 <i>x</i> = ${F.z.map((z) => n(z)).join(", ")}. 그래프에 세로 점선으로 표시했습니다.`,
      "③ 각 구간에서 f′의 부호를 정해 증감표를 만듭니다.",
      "④ f′의 부호가 바뀌는 점은 극점으로, 바뀌지 않는 점은 속이 빈 점으로 찍습니다.",
      `⑤ <i>y</i>절편은 f(0) = ${n(F.f(0))}입니다. ${F.end}`,
      "⑥ 증감표의 화살표를 따라 점들을 매끄럽게 잇습니다.",
    ];
    $(".go-step").innerHTML = T[step];
    $(".go-count").textContent = `${step} / 6`;
    $(".tbl").hidden = step < 3;
    $(".tb").innerHTML = table();
    $(".go-prev").disabled = step === 0; $(".go-next").disabled = step === 6;
    draw();
  }
  $(".go-prev").addEventListener("click", () => { step = Math.max(0, step - 1); update(); });
  $(".go-next").addEventListener("click", () => { step = Math.min(6, step + 1); update(); });
  K.chips(root, ".presets .chip", (b) => { F = FS[+b.dataset.k]; step = 0; update(); });
  update();
})();
