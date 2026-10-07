/* 카드: 모든 집단에서 더 나은 치료가 전체로는 더 나쁠 수 있을까? — 심슨의 역설 (실제 자료 두 가지)
   신장 결석: Charig C.R. 외 (1986) BMJ 292:879–882, 개복 수술(A)과 경피적 신쇄석술(B).
   대학원 입학: Bickel, Hammel, O'Connell (1975) Science 187:398–404, 지원자가 많은 여섯 학과 (R 데이터셋 UCBAdmissions와 같은 수). */
(() => {
  const root = document.getElementById("card-fusi-simpson");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const KID = { A: { s: [81, 87], l: [192, 263] }, B: { s: [234, 270], l: [55, 80] } };
  const UCB = [["A", 512, 825, 89, 108], ["B", 353, 560, 17, 25], ["C", 120, 325, 202, 593], ["D", 138, 417, 131, 375], ["E", 53, 191, 94, 393], ["F", 22, 373, 24, 341]];
  const sF = $(".f");
  let ds = "kid";

  const cv = fit($(".cv-wide"), () => draw());
  const p = (x) => (x * 100).toFixed(1) + " %";
  const setNums = (k, v, bad) => ["1", "2", "3"].forEach((n, i) => { $(".k" + n).textContent = k[i]; const d = $(".v" + n); d.textContent = v[i]; d.className = "v" + n + (bad === i ? " bad" : ""); });

  function bars(ctx, box, groups, yMax, legend) {
    const Y = (v) => box.y0 + box.h - v / yMax * box.h;
    axes(ctx, { ...box, X: (v) => v, Y, xt: [], yt: [0, 20, 40, 60, 80, 100].filter((v) => v <= yMax * 100 + 1e-9).map((v) => [v / 100, v + "%"]) });
    const gw = box.w / groups.length;
    groups.forEach((g, i) => {
      const gx = box.x0 + i * gw, bw = Math.min(30, gw * 0.32);
      if (g.sep) { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx, box.y0); ctx.lineTo(gx, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]); }
      g.v.forEach((v, k) => {
        const x = gx + gw / 2 + (k ? 2 : -bw - 2);
        ctx.fillStyle = k ? C.leaf : C.amber; ctx.fillRect(x, Y(v.r), bw, box.y0 + box.h - Y(v.r));
        ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(Math.round(v.r * 100) + "", x + bw / 2, Y(v.r) - 4);
        ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`;
        ctx.fillText(v.n, x + bw / 2, box.y0 + box.h + 26);
      });
      ctx.fillStyle = g.sep ? C.ink : C.ink2; ctx.font = `${g.sep ? 600 : 400} 11.5px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(g.name, gx + gw / 2, box.y0 + box.h + 13);
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.amber; ctx.fillRect(box.x0, 6, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(legend[0], box.x0 + 14, 15);
    const lw = ctx.measureText(legend[0]).width;
    ctx.fillStyle = C.leaf; ctx.fillRect(box.x0 + lw + 28, 6, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(legend[1], box.x0 + lw + 42, 15);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("막대 아래 숫자: 사람 수", box.x0 + box.w, 15);
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 38, y0: 30, w: w - 48, h: h - 72 };
    if (ds === "kid") {
      const f = +sF.value / 100, nA = 350;
      const rS = KID.A.s[0] / KID.A.s[1], rL = KID.A.l[0] / KID.A.l[1];
      const nAl = Math.round(nA * f), nAs = nA - nAl, aAll = rS * (1 - f) + rL * f;
      const bAll = (KID.B.s[0] + KID.B.l[0]) / (KID.B.s[1] + KID.B.l[1]);
      bars(ctx, box, [
        { name: "작은 결석", v: [{ r: rS, n: nAs }, { r: KID.B.s[0] / KID.B.s[1], n: KID.B.s[1] }] },
        { name: "큰 결석", v: [{ r: rL, n: nAl }, { r: KID.B.l[0] / KID.B.l[1], n: KID.B.l[1] }] },
        { name: "전체", sep: true, v: [{ r: aAll, n: nA }, { r: bAll, n: KID.B.s[1] + KID.B.l[1] }] },
      ], 1, ["A 개복 수술", "B 경피적 신쇄석술"]);
      setNums(["A 전체 성공률", "B 전체 성공률", "전체로 보면 더 나은 쪽"], [p(aAll), p(bAll), aAll > bAll ? "A" : "B"], aAll > bAll ? -1 : 2);
    } else {
      const gs = UCB.map(([d, ma, mn, wa, wn]) => ({ name: "학과 " + d, v: [{ r: ma / mn, n: mn }, { r: wa / wn, n: wn }] }));
      const M = UCB.reduce((a, r) => [a[0] + r[1], a[1] + r[2]], [0, 0]), W = UCB.reduce((a, r) => [a[0] + r[3], a[1] + r[4]], [0, 0]);
      gs.push({ name: "전체", sep: true, v: [{ r: M[0] / M[1], n: M[1] }, { r: W[0] / W[1], n: W[1] }] });
      bars(ctx, box, gs, 1, ["남성", "여성"]);
      const k = UCB.filter((r) => r[3] / r[4] > r[1] / r[2]).length;
      setNums(["남성 합격률 (여섯 학과)", "여성 합격률 (여섯 학과)", "여성 합격률이 더 높은 학과"], [p(M[0] / M[1]), p(W[0] / W[1]), `${k} / 6`]);
    }
  }

  const NOTE = {
    kid: "출처: Charig 외 (1986) BMJ 292:879–882. 결석 지름 2 cm 미만을 작은 결석으로 나눔. 막대 위 숫자는 성공률(%)입니다. 슬라이더는 집단별 성공률을 그대로 두고 A 환자 구성만 바꾼 가상 상황이며, 75 %가 실제 자료입니다.",
    ucb: "출처: Bickel·Hammel·O'Connell (1975) Science 187:398–404. 1973년 가을 UC 버클리 대학원에서 지원자가 가장 많았던 여섯 학과(학과 이름은 A~F로 가림). 막대 위 숫자는 합격률(%)입니다.",
  };
  function setDs(d) {
    ds = d;
    root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.d === d)));
    $(".f2-mix").hidden = d !== "kid";
    $(".src-note").textContent = NOTE[d];
    draw();
  }
  $(".ds").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) setDs(b.dataset.d); });
  sF.addEventListener("input", () => { $(".f-out").textContent = sF.value; draw(); });
  $(".real").addEventListener("click", () => { sF.value = 75; $(".f-out").textContent = "75"; draw(); });
  setDs("kid");
})();
