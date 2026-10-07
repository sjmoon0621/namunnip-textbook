/* 카드: 전체로 보면 차이가 있는데, 나눠 보면 사라지는 까닭은? — 심프슨 역설
   자료: UC Berkeley 대학원 1973년 가을, 지원자가 많은 6개 학과. Bickel, Hammel & O'Connell (1975) Science 187:398–404.
   R datasets의 UCBAdmissions와 같은 값. [남 합격, 남 지원, 여 합격, 여 지원] */
(() => {
  const root = document.getElementById("card-resr-simpson");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const D = [
    ["A", 512, 825, 89, 108], ["B", 353, 560, 17, 25], ["C", 120, 325, 202, 593],
    ["D", 138, 417, 131, 375], ["E", 53, 191, 94, 393], ["F", 22, 373, 24, 341],
  ];
  const on = D.map(() => true);
  const pct = (a, b) => (b ? 100 * a / b : NaN);
  const cv = fit($(".cv-wide"), () => draw());

  function agg() {
    let ma = 0, mn = 0, fa = 0, fn = 0;
    D.forEach((d, i) => { if (on[i]) { ma += d[1]; mn += d[2]; fa += d[3]; fn += d[4]; } });
    return { m: pct(ma, mn), f: pct(fa, fn), mn, fn };
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = agg(), top = 20, rateH = h * 0.5, base = top + rateH;
    const Y = (p) => base - p / 100 * rateH;
    const lw = Math.max(92, w * 0.24);
    const grid = (x0, x1) => {
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
      [0, 50, 100].forEach((p) => { ctx.beginPath(); ctx.moveTo(x0, Y(p) + .5); ctx.lineTo(x1, Y(p) + .5); ctx.stroke(); });
    };
    grid(30, w - 6);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [0, 50, 100].forEach((p) => ctx.fillText(p + "%", 26, Y(p) + 3));
    const bar = (x, bw, p, col, label) => {
      if (!Number.isFinite(p)) return;
      ctx.fillStyle = col; ctx.fillRect(x, Y(p), bw, base - Y(p));
      if (label) { ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(Math.round(p) + "%", x + bw / 2, Y(p) - 4); }
    };
    const bw0 = Math.min(26, (lw - 40) / 2);
    const lx = 36;
    bar(lx, bw0, a.m, C.ink2, true); bar(lx + bw0 + 4, bw0, a.f, C.forest, true);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("합친 값", lx + bw0 + 2, base + 16);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    ctx.fillText(`지원 ${a.mn + a.fn}명`, lx + bw0 + 2, base + 30);

    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(lw + 0.5, top - 6); ctx.lineTo(lw + 0.5, h - 6); ctx.stroke();
    const gx0 = lw + 10, gw = (w - gx0 - 4) / D.length, bw = Math.min(16, gw / 2 - 4);
    const appH = h - base - 46, maxApp = 825;
    D.forEach((d, i) => {
      const cx = gx0 + gw * (i + 0.5);
      ctx.globalAlpha = on[i] ? 1 : 0.22;
      bar(cx - bw - 1, bw, pct(d[1], d[2]), C.ink2, false);
      bar(cx + 1, bw, pct(d[3], d[4]), C.forest, false);
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(d[0], cx, base + 16);
      const ay = base + 24 + appH;
      const hm = d[2] / maxApp * appH, hf = d[4] / maxApp * appH;
      ctx.fillStyle = "rgba(93,93,97,0.45)"; ctx.fillRect(cx - bw - 1, ay - hm, bw, hm);
      ctx.fillStyle = "rgba(59,124,42,0.45)"; ctx.fillRect(cx + 1, ay - hf, bw, hf);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("학과별 합격률", gx0, top - 8);
    ctx.fillText("지원자 수 (A학과 남성 825명이 최대)", gx0, h - 6);
    ctx.textAlign = "right";
    ctx.fillStyle = C.ink2; ctx.fillRect(w - 92, top - 16, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText("남", w - 64, top - 8);
    ctx.fillStyle = C.forest; ctx.fillRect(w - 54, top - 16, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText("여", w - 26, top - 8);
    readout(a);
  }

  function readout(a) {
    $(".v-all").textContent = Number.isFinite(a.m) ? `${a.m.toFixed(1)}% / ${a.f.toFixed(1)}%` : "—";
    const sel = D.filter((_, i) => on[i]);
    const win = sel.filter((d) => pct(d[3], d[4]) > pct(d[1], d[2])).length;
    $(".v-win").textContent = sel.length ? `${win} / ${sel.length}` : "—";
    const fAll = D.reduce((s, d) => s + d[4], 0), fHard = D.slice(2).reduce((s, d) => s + d[4], 0);
    const mAll = D.reduce((s, d) => s + d[2], 0), mHard = D.slice(2).reduce((s, d) => s + d[2], 0);
    $(".v-hard").textContent = `${(100 * fHard / fAll).toFixed(0)}% (남 ${(100 * mHard / mAll).toFixed(0)}%)`;
    const v = $(".verdict"); v.className = "verdict small";
    if (sel.length >= 2 && win === sel.length && a.f < a.m) {
      v.textContent = "고른 학과 모두에서 여성 합격률이 높은데, 합치면 여성이 낮습니다. 여성 지원자가 합격률이 낮은 학과에 몰려 있기 때문입니다.";
      v.classList.add("bad");
    } else if (sel.length === 1) v.textContent = "학과 하나만 고르면 합친 값과 학과의 값이 같습니다. 같은 학과에 지원한 사람끼리 비교한 것이기 때문입니다.";
    else v.textContent = "";
  }

  root.querySelector(".card-fig").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.d) { const i = +b.dataset.d; on[i] = !on[i]; if (!on.some(Boolean)) on[i] = true; }
    else if (b.classList.contains("all")) on.fill(true);
    else return;
    root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(on[+x.dataset.d])));
    draw();
  });
  if (/[?&]demo\b/.test(location.search)) { on.fill(false); on[0] = on[5] = true; root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(on[+x.dataset.d]))); }
})();
