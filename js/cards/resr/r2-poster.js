/* 카드: 포스터의 글자는 몇 걸음 밖에서도 읽혀야 할까? — 글자 크기, 보는 거리, 시각(분), A0 포스터에 들어가는 분량 (어림 모형) */
(() => {
  const root = document.getElementById("card-resr-poster");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const PW = 841, PH = 1189, M = 30, TOP = 170, GUT = 25, PT = 0.3528, HK = 0.85, OK = 15;
  const CW = (PW - 2 * M - 2 * GUT) / 3, BOT = PH - M;
  const FIGS = [[[400, 700]], [[TOP, 450], [650, 930]], [[TOP, 420]]];
  const SEGS = FIGS.map((fs) => {
    const out = []; let y = TOP;
    fs.forEach(([a, b]) => { if (a - y > 1) out.push([y, a]); y = b; });
    if (BOT - y > 1) out.push([y, BOT]);
    return out;
  });
  const TITLE = "액체 비료는 강낭콩 모종의 생장을 높일까?";
  const SAMPLE = "처리군은 대조군보다 평균 1.4 cm 더 자랐다.";
  const arcmin = (mm, dm) => mm / (dm * 1000) * 3437.75;
  const cv = fit($(".cv-wide"), () => draw());
  let st = {};

  function layout(bpt, chars) {
    const em = bpt * PT, lh = em * 1.5, cpl = Math.max(1, Math.floor(CW / em));
    let need = Math.ceil(chars / cpl), cap = 0;
    const lines = [];
    SEGS.forEach((segs, c) => segs.forEach(([a, b]) => {
      const n = Math.floor((b - a) / lh); cap += n;
      for (let i = 0; i < n && lines.length < need; i++) lines.push({ c, y: a + i * lh, last: false });
    }));
    if (lines.length) lines[lines.length - 1].last = true;
    return { em, lh, cpl, need, cap, lines, rest: chars - (lines.length - 1) * cpl };
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = +$(".d").value, bpt = +$(".b").value, tpt = +$(".t").value, chars = +$(".c").value;
    const L = layout(bpt, chars);
    const H = h - 26, s = H / PH, W = PW * s, ox = 8, oy = 8;
    ctx.fillStyle = "#fff"; ctx.fillRect(ox, oy, W, H);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(ox + .5, oy + .5, W, H);
    const X = (mm) => ox + mm * s, Y = (mm) => oy + mm * s;
    /* 제목 */
    const tem = tpt * PT, tw = TITLE.length * tem, tl = Math.ceil(tw / (PW - 2 * M));
    ctx.fillStyle = C.ink;
    for (let i = 0; i < tl; i++) {
      const lw = i < tl - 1 ? PW - 2 * M : tw - (tl - 1) * (PW - 2 * M);
      const y = M + i * tem * 1.25;
      if (y + tem > TOP - 10) { ctx.fillStyle = C.apple; }
      ctx.fillRect(X(M), Y(y), lw * s, Math.max(1, tem * HK * s));
    }
    /* 그림 */
    ctx.fillStyle = "#e4e6dc";
    FIGS.forEach((fs, c) => fs.forEach(([a, b]) => { const x = M + c * (CW + GUT); ctx.fillRect(X(x), Y(a + 8), CW * s, (b - a - 16) * s); }));
    /* 본문 줄 */
    ctx.fillStyle = C.ink2;
    L.lines.forEach((ln) => {
      const x = M + ln.c * (CW + GUT), lw = ln.last ? Math.min(CW, L.rest * L.em) : L.cpl * L.em;
      ctx.fillRect(X(x), Y(ln.y), Math.max(1, lw * s), Math.max(0.6, L.em * HK * s * 0.7));
    });
    const over = L.need > L.cap;
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = over ? C.warn : C.ink3;
    ctx.fillText(over ? `넘침: ${L.need - L.cap}줄` : "A0 포스터", ox + W / 2, h - 5);

    /* 오른쪽: 그 거리에서 본 크기 */
    const rx = ox + W + 22, rw = w - rx - 8;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`${d.toFixed(1)} m에서 보이는 크기`, rx, 18);
    const scr = (pt) => pt * PT * (0.5 / d) * 3.78;
    ctx.save(); ctx.beginPath(); ctx.rect(rx, 24, rw, h - 30); ctx.clip();
    ctx.fillStyle = C.ink;
    const tp = scr(tpt);
    ctx.font = `700 ${Math.max(1, tp)}px ${F.sans}`;
    wrap(ctx, TITLE, rx, 30 + tp, rw, tp * 1.25, 3);
    const bp = scr(bpt);
    ctx.font = `${Math.max(1, bp)}px ${F.sans}`; ctx.fillStyle = C.ink2;
    const yb = 30 + tp * 4.2 + 10;
    wrap(ctx, SAMPLE + " " + SAMPLE, rx, yb + bp, rw, bp * 1.5, 4);
    ctx.restore();
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(ox + W + 11.5, 10); ctx.lineTo(ox + W + 11.5, h - 10); ctx.stroke();
    st = { d, bpt, tpt, chars, L, over };
    readout();
  }

  function wrap(ctx, text, x, y, maxw, lh, maxLines) {
    let line = "", n = 0;
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxw && line) {
        ctx.fillText(line, x, y); y += lh; line = ""; if (++n >= maxLines) return;
      }
      line += ch;
    }
    if (line) ctx.fillText(line, x, y);
  }

  function readout() {
    const { d, bpt, tpt, L, over } = st;
    const ab = arcmin(bpt * PT * HK, d), at = arcmin(tpt * PT * HK, d);
    $(".d-out").textContent = d.toFixed(1); $(".b-out").textContent = bpt; $(".t-out").textContent = tpt; $(".c-out").textContent = st.chars;
    const vb = $(".v-b"), vt = $(".v-t"), vf = $(".v-f");
    vb.textContent = ab.toFixed(1) + "′"; vb.className = "v-b " + (ab >= OK ? "good" : ab < 5 ? "bad" : "");
    vt.textContent = at.toFixed(0) + "′"; vt.className = "v-t " + (at >= OK ? "good" : "bad");
    const fr = L.need / L.cap;
    vf.textContent = Math.round(fr * 100) + "%"; vf.className = "v-f " + (over ? "bad" : "");
    const v = $(".verdict"); v.className = "verdict small";
    const need = Math.ceil(OK / 3437.75 * d * 1000 / HK / PT);
    const msgs = [];
    if (ab < 5) msgs.push(`본문은 이 거리에서 시력 1.0으로도 알아보기 어렵습니다(5′ 미만).`);
    else if (ab < OK) msgs.push(`본문은 알아볼 수는 있지만 편히 읽기에는 작습니다. ${d.toFixed(1)} m에서 15′가 되려면 약 ${need} pt가 필요합니다.`);
    else msgs.push(`본문이 ${d.toFixed(1)} m에서 편히 읽힐 크기입니다.`);
    if (over) msgs.push(`이 크기로는 본문 ${st.chars}자가 들어가지 않습니다. 약 ${Math.floor(L.cap * L.cpl / 100) * 100}자 안으로 줄여야 합니다.`);
    v.textContent = msgs.join(" ");
    v.classList.add(ab >= OK && !over ? "good" : "bad");
  }

  ["d", "b", "t", "c"].forEach((k) => $("." + k).addEventListener("input", draw));
  if (/[?&]demo\b/.test(location.search)) { $(".b").value = 30; $(".c").value = 3000; }
})();
