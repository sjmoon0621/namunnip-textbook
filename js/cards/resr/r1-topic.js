/* 카드: 하고 싶은 주제와 할 수 있는 주제는 어떻게 맞출까? — FINER 기준 점수표와 주제 좁히기 */
(() => {
  const root = document.getElementById("card-resr-topic");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);

  /* 기준: 흥미 I, 독창성 N, 구체성 S, 실현 가능성 Fe, 안전·윤리 E, 의의 R */
  const KEYS = ["I", "N", "S", "Fe", "E", "R"];
  const COL = { I: "#e0a02a", N: "#7d4f8f", S: "#4a78b5", Fe: "#3b7c2a", E: "#9b7a55", R: "#b5d7ac" };
  const W = {
    bal: { I: 1, N: 1, S: 1, Fe: 1, E: 1, R: 1 },
    fun: { I: 3, N: 1, S: 1, Fe: 1, E: 1, R: 1 },
    can: { I: 1, N: 1, S: 2, Fe: 3, E: 1, R: 1 },
    new: { I: 1, N: 3, S: 1, Fe: 1, E: 1, R: 1 },
  };
  /* 예시 점수(1~5): [넓은 주제, 좁힌 주제] */
  const T = [
    { s: ["미세플라스틱 오염", "하천 상류·하류 모래 속 미세플라스틱 수"],
      full: ["미세플라스틱 오염을 연구한다", "학교 앞 하천 상류와 하류의 모래 1 kg에 든 미세플라스틱 개수는 다를까? (체, 여과지, 현미경)"],
      v: [{ N: 2, S: 1, Fe: 1, E: 5, R: 5 }, { N: 4, S: 5, Fe: 4, E: 4, R: 4 }] },
    { s: ["빛과 식물 생장", "LED 색과 무 새싹의 줄기 길이"],
      full: ["빛이 식물에 미치는 영향", "LED 빛의 색(빨강·파랑·흰색)에 따라 무 새싹의 줄기 길이는 어떻게 달라질까?"],
      v: [{ N: 1, S: 1, Fe: 3, E: 5, R: 3 }, { N: 2, S: 5, Fe: 5, E: 5, R: 3 }] },
    { s: ["블랙홀 연구", "공개 중력파 자료의 처프 신호 분석"],
      full: ["블랙홀의 비밀을 밝힌다", "LIGO 공개 자료에서 블랙홀 병합 신호의 주파수가 시간에 따라 어떻게 높아지는지 분석해 질량을 어림할 수 있을까?"],
      v: [{ N: 2, S: 1, Fe: 1, E: 5, R: 4 }, { N: 4, S: 4, Fe: 3, E: 5, R: 4 }] },
    { s: ["암 치료 물질 개발", "계피 추출물과 효모 발효"],
      full: ["암을 치료하는 천연 물질을 개발한다", "계피 추출물의 농도에 따라 효모가 발효로 내는 이산화 탄소의 양은 얼마나 줄어들까?"],
      v: [{ N: 3, S: 1, Fe: 1, E: 2, R: 5 }, { N: 3, S: 5, Fe: 5, E: 5, R: 3 }] },
  ];
  const state = T.map(() => ({ narrow: false, I: 3 }));
  let wk = "bal";

  const rowsHost = $(".r1t-rows");
  rowsHost.innerHTML = T.map((t, i) => `<div class="r1t-row">
      <div class="r1t-name"><b>주제 ${i + 1}</b><span class="r1t-full"></span></div>
      <button type="button" class="chip r1t-nar" data-i="${i}" aria-pressed="false">좁히기</button>
      <label class="r1t-int">흥미 <input type="range" min="1" max="5" step="1" value="3" data-i="${i}" aria-label="주제 ${i + 1}의 흥미"><output>3</output></label>
    </div>`).join("");

  const score = (i) => {
    const st = state[i], v = { ...T[i].v[st.narrow ? 1 : 0], I: st.I }, w = W[wk];
    const sw = KEYS.reduce((s, k) => s + w[k], 0);
    const parts = KEYS.map((k) => [k, v[k] * w[k] / sw * 20]);
    return { v, parts, total: parts.reduce((s, p) => s + p[1], 0), gate: v.Fe <= 1 || v.E <= 2 };
  };

  const cv = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = Math.min(190, w * 0.36), x0 = lw + 8, bw = w - x0 - 44, top = 22, rh = (h - top - 36) / T.length;
    const X = (v) => x0 + v / 100 * bw;
    NM.axes(ctx, { x0, y0: top, w: bw, h: h - top - 36, X, Y: (v) => v, xt: [0, 20, 40, 60, 80, 100].map((v) => [v, v + ""]), xlabel: "종합 점수" });
    const sc = T.map((_, i) => score(i)), best = sc.reduce((b, s, i) => (!s.gate && (b < 0 || s.total > sc[b].total) ? i : b), -1);
    sc.forEach((s, i) => {
      const y = top + rh * i + rh * 0.22, bh = rh * 0.56;
      let x = x0;
      s.parts.forEach(([k, v]) => { ctx.fillStyle = COL[k]; ctx.fillRect(x, y, X(v) - x0, bh); x += X(v) - x0; });
      if (s.gate) {
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y, x - x0, bh); ctx.clip();
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 3;
        for (let k = -bh; k < x - x0 + bh; k += 9) { ctx.beginPath(); ctx.moveTo(x0 + k, y + bh); ctx.lineTo(x0 + k + bh, y); ctx.stroke(); }
        ctx.restore();
      }
      ctx.fillStyle = i === best ? C.forest : (s.gate ? C.warn : C.ink); ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(s.total.toFixed(0), x + 5, y + bh / 2 + 4);
      ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink;
      let name = T[i].s[state[i].narrow ? 1 : 0];
      while (ctx.measureText(name).width > lw - 6 && name.length > 4) name = name.slice(0, -2) + "…";
      ctx.fillText(name, lw, y + bh / 2 - 2);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = s.gate ? C.warn : (i === best ? C.forest : C.ink3);
      ctx.fillText(s.gate ? (s.v.E <= 2 ? "안전·윤리 검토 필요" : "지금 여건으로 어려움") : (i === best ? "현재 1위" : (state[i].narrow ? "좁힌 주제" : "넓은 주제")), lw, y + bh / 2 + 12);
    });
  }

  function sync() {
    rowsHost.querySelectorAll(".r1t-row").forEach((row, i) => {
      row.querySelector(".r1t-full").textContent = T[i].full[state[i].narrow ? 1 : 0];
      const b = row.querySelector(".r1t-nar");
      b.setAttribute("aria-pressed", String(state[i].narrow)); b.textContent = state[i].narrow ? "넓히기" : "좁히기";
      row.querySelector("output").textContent = state[i].I;
    });
    draw();
  }
  rowsHost.addEventListener("click", (e) => {
    const b = e.target.closest(".r1t-nar"); if (!b) return;
    const i = +b.dataset.i; state[i].narrow = !state[i].narrow; sync();
  });
  rowsHost.addEventListener("input", (e) => {
    const r = e.target.closest("input[data-i]"); if (!r) return;
    state[+r.dataset.i].I = +r.value; sync();
  });
  $(".r1t-w").addEventListener("click", (e) => {
    const b = e.target.closest("[data-w]"); if (!b) return;
    wk = b.dataset.w;
    root.querySelectorAll(".r1t-w [data-w]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    draw();
  });
  sync();
  if (/[?&]demo\b/.test(location.search)) {
    state[0].narrow = true; state[2].narrow = true; state[2].I = 5; state[3].I = 5;
    rowsHost.querySelectorAll("input[data-i]").forEach((r, i) => { r.value = state[i].I; });
    sync();
  }
})();
