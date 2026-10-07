/* 카드: 20 °C는 10 °C보다 두 배 따뜻할까? — 부호·단위를 바꿔도 결론이 같은 계산만 의미가 있다 (측정 척도) */
(() => {
  const root = document.getElementById("card-fusi-scale");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);

  const CLOUD = ["적운", "층운", "권운", "맑음"], GRADE = ["좋음", "보통", "나쁨", "매우나쁨"];
  const cat = (names, codes, data, label) => ({
    kind: "cat", data, encs: codes.map(([nm, cs]) => ({ nm, code: (v) => cs[names.indexOf(v)], cs })), names, label,
  });
  /* 모식 자료 (11일) */
  const V = {
    cloud: cat(CLOUD, [["부호 가", [1, 2, 3, 4]], ["부호 나", [3, 1, 4, 2]]],
      ["적운", "층운", "적운", "권운", "맑음", "적운", "층운", "적운", "권운", "적운", "맑음"], "명목 척도"),
    grade: cat(GRADE, [["부호 1·2·3·4", [1, 2, 3, 4]], ["부호 1·2·4·8", [1, 2, 4, 8]]],
      ["보통", "좋음", "나쁨", "보통", "보통", "매우나쁨", "나쁨", "좋음", "보통", "나쁨", "보통"], "순서 척도"),
    temp: { kind: "num", label: "등간 척도", data: [12.4, 15.1, 9.8, 18.3, 21.0, 16.7, 13.5, 4.2, 19.6, 22.4, 17.9],
      encs: [{ nm: "섭씨 °C", f: (c) => c, inv: (x) => x, u: "°C" }, { nm: "화씨 °F", f: (c) => c * 1.8 + 32, inv: (x) => (x - 32) / 1.8, u: "°F" }, { nm: "절대 온도 K", f: (c) => c + 273.15, inv: (x) => x - 273.15, u: "K" }], base: "°C" },
    rain: { kind: "num", label: "비율 척도", data: [2.5, 12.0, 0.5, 31.5, 7.0, 4.5, 18.0, 1.0, 9.5, 3.0, 55.0],
      encs: [{ nm: "밀리미터 mm", f: (m) => m, inv: (x) => x, u: "mm" }, { nm: "인치 in", f: (m) => m / 25.4, inv: (x) => x * 25.4, u: "in" }], base: "mm" },
  };
  let vk = "temp", ok = "ratio";

  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[(s.length - 1) / 2]; };
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  function mode(a) {
    const m = new Map(); a.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
    let best = null, n = 0; m.forEach((c, x) => { if (c > n) { n = c; best = x; } });
    return n > 1 ? best : null;
  }
  const r2 = (x) => Math.round(x * 1000) / 1000;

  /* 한 표현에서 계산하고, 결과를 원래 표현으로 되돌린 꼬리표(key)와 설명(txt)을 만든다 */
  function evalEnc(v, e) {
    if (v.kind === "cat") {
      const xs = v.data.map(e.code);
      const name = (c) => { const i = e.cs.indexOf(c); return i >= 0 ? v.names[i] : null; };
      const pos = (c) => {   /* 순서 척도: 부호를 등급 위치(1~4)로 되돌림 */
        const s = e.cs.map((x, i) => [x, i + 1]).sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < s.length - 1; i++) if (c >= s[i][0] && c <= s[i + 1][0]) return s[i][1] + (c - s[i][0]) / (s[i + 1][0] - s[i][0]) * (s[i + 1][1] - s[i][1]);
        return NaN;
      };
      const mono = v === V.grade;
      if (ok === "ratio") {
        const mx = Math.max(...xs), mn = Math.min(...xs);
        return { xs, mark: [mn, mx], val: `${mx} ÷ ${mn} = ${r2(mx / mn)}`, key: `${r2(mx / mn)}|${name(mx)}|${name(mn)}`, txt: `${r2(mx / mn)} (${name(mx)} ÷ ${name(mn)})` };
      }
      const c = ok === "mode" ? mode(xs) : ok === "median" ? median(xs) : mean(xs), nm = name(c);
      let txt, key;
      if (nm) { txt = nm; key = nm; }
      else if (mono) { const p = pos(c); key = p.toFixed(3); txt = `${GRADE[Math.floor(p) - 1]}과 ${GRADE[Math.floor(p)]} 사이 (위치 ${p.toFixed(2)})`; }
      else { key = "x" + c.toFixed(3); txt = `해당하는 범주 없음`; }
      return { xs, mark: [c], val: `${r2(c)}`, key, txt };
    }
    const xs = v.data.map(e.f);
    if (ok === "ratio") {
      const mx = Math.max(...xs), mn = Math.min(...xs), r = mx / mn;
      return { xs, mark: [mn, mx], val: `${r2(mx)} ÷ ${r2(mn)}`, key: r.toFixed(3), txt: `${r.toFixed(2)} 배` };
    }
    const c = ok === "mode" ? mode(xs) : ok === "median" ? median(xs) : mean(xs);
    if (c === null) return { xs, mark: [], val: "없음", key: "none", txt: "같은 값이 없음" };
    const back = e.inv(c);
    return { xs, mark: [c], val: `${r2(c)} ${e.u}`, key: back.toFixed(3), txt: `${back.toFixed(2)} ${v.base}` };
  }

  const view = fit($("canvas"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = V[vk], res = v.encs.map((e) => evalEnc(v, e));
    const same = res.every((r) => r.key === res[0].key);
    const rowH = (h - 10) / res.length, x0 = 12, x1 = w - 12;
    res.forEach((r, i) => {
      const e = v.encs[i], top = 6 + i * rowH, ly = top + rowH * 0.62;
      const lo = Math.min(...r.xs), hi = Math.max(...r.xs);
      const pad = (hi - lo) * 0.06 || 1, a = v.kind === "num" && e.u !== "°C" && e.u !== "°F" ? 0 : lo - pad, b = hi + pad;
      const X = (x) => x0 + (x - a) / (b - a) * (x1 - x0);
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
      ctx.fillText(e.nm, x0, top + 14);
      ctx.font = `11.5px ${F.mono}`; ctx.fillStyle = same ? C.forest : C.warn; ctx.textAlign = "right";
      ctx.fillText(`${r.val}  →  ${r.txt}`, x1, top + 14);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x1, ly); ctx.stroke();
      /* 눈금: 범주면 부호마다, 수면 양 끝과 0 */
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      const tks = v.kind === "cat" ? e.cs.map((c, j) => [c, `${c} ${v.names[j]}`]) : NMticks(a, b).map((t) => [t, String(t)]);
      tks.forEach(([t, lab]) => { const x = X(t); if (x < x0 - 1 || x > x1 + 1) return; ctx.beginPath(); ctx.moveTo(x, ly - 3); ctx.lineTo(x, ly + 3); ctx.stroke(); ctx.fillText(lab, x, ly + 15); });
      /* 자료 점 (같은 값은 위로 쌓기) */
      const cnt = new Map();
      ctx.fillStyle = C.leaf;
      r.xs.forEach((x) => { const k = x.toFixed(4), n = cnt.get(k) || 0; cnt.set(k, n + 1); ctx.beginPath(); ctx.arc(X(x), ly - 6 - n * 7, 3, 0, Math.PI * 2); ctx.fill(); });
      /* 계산 결과 표시 */
      ctx.strokeStyle = same ? C.forest : C.warn; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2;
      r.mark.forEach((m) => { const x = X(m); ctx.beginPath(); ctx.moveTo(x, ly - rowH * 0.42); ctx.lineTo(x, ly + 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 5, ly + 10); ctx.lineTo(x + 5, ly + 10); ctx.lineTo(x, ly + 4); ctx.fill(); });
    });
    const vd = $(".sc-verdict");
    const nouse = res.every((r) => r.key === "none");
    vd.className = "sc-verdict " + (nouse ? "" : same ? "ok" : "no");
    const opn = { mode: "최빈값", median: "중앙값", mean: "평균", ratio: "최댓값 ÷ 최솟값" }[ok];
    vd.innerHTML = nouse ? `<b>${v.label}</b> · ${opn}: 어느 표현에서도 같은 값이 두 번 나오지 않습니다. 결론이 바뀌지는 않지만, 연속적인 값에서는 쓸모가 없는 계산입니다.`
      : same ? `<b>${v.label}</b> · ${opn}: 표현을 바꿔도 결론이 같습니다. 이 데이터에 의미 있는 계산입니다.`
        : `<b>${v.label}</b> · ${opn}: 표현만 바꿨는데 결론이 달라집니다. 이 계산은 데이터가 아니라 우리가 고른 부호나 단위에 대해 말하고 있습니다.`;
  }
  const NMticks = (a, b) => (window.NMLab ? NMLab.ticks(a, b, 5) : (() => {
    const span = b - a, raw = span / 5, mag = 10 ** Math.floor(Math.log10(raw)), st = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw), out = [];
    for (let t = Math.ceil(a / st) * st; t <= b + 1e-9; t += st) out.push(+t.toPrecision(10));
    return out;
  })());

  const sel = (grp, attr, set) => $(grp).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); $(grp).querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  sel(".vsel", "v", (x) => { vk = x; });
  sel(".osel", "o", (x) => { ok = x; });
  draw();
})();
