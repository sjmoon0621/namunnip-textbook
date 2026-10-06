/* 카드: 작용기 확인 반응 — 미지 시료 6개(에탄올, 아세트산, 페놀, 프로판알, 아세톤, 아세트산 에틸)를 시험관 반응으로 가려내기 */
(() => {
  const root = document.getElementById("card-labchem-functional-tests");
  if (!root || !window.NMOrg) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, O = NMOrg;
  const $ = (s) => root.querySelector(s);
  const NAME = { et: "에탄올", ac: "아세트산", ph: "페놀", al: "프로판알", kt: "아세톤", es: "아세트산 에틸" };
  const PH = { et: 6.8, ac: 2.9, ph: 5.5, al: 6.2, kt: 6.9, es: 6.4 };   // 0.1 M 수용액 (CO₂가 녹은 물 기준, 대략값)
  const TNAME = { water: "물과 섞기", ph: "pH", hco: "NaHCO₃", na: "Na", fe: "FeCl₃", tol: "톨렌스", dnp: "2,4-DNP", eset: "+에탄올·H₂SO₄", esac: "+아세트산·H₂SO₄", hyd: "NaOH 가열" };
  const CLEAR = "#e8f0f5", YEL = "#ecd57a";
  /* 시험 결과: [표에 적을 짧은 말, 관찰 설명, 그림] */
  function result(test, c) {
    const v = (layers, o = {}) => ({ layers, o });
    switch (test) {
      case "ph":
        return ["—", "", v([{ f: 0.4, col: CLEAR }])];
      case "water":
        if (c === "es") return ["두 층", "물과 섞이지 않고 위에 층이 생깁니다. 과일 향이 납니다.", v([{ f: 0.25, col: CLEAR }, { f: 0.15, col: "#efe3b6" }])];
        if (c === "ph") return ["조금 녹음", "결정이 조금 녹고 뿌옇게 됩니다. 특유의 소독약 냄새가 납니다.", v([{ f: 0.4, col: "#eeeae0" }])];
        return ["잘 섞임", { et: "고르게 섞입니다. 술 냄새가 납니다.", ac: "고르게 섞입니다. 식초 냄새가 납니다.", al: "고르게 섞입니다. 자극적인 냄새가 납니다.", kt: "고르게 섞입니다. 매니큐어 제거제 냄새가 납니다." }[c], v([{ f: 0.4, col: CLEAR }])];
      case "hco":
        return c === "ac" ? ["기포", "기포(CO₂)가 활발히 올라옵니다.", v([{ f: 0.4, col: CLEAR }], { bubbles: 14 })] : ["없음", "기포가 생기지 않습니다.", v([{ f: 0.4, col: CLEAR }])];
      case "na":
        return ["et", "ac", "ph"].includes(c) ? ["기포", c === "ac" ? "나트륨이 빠르게 녹으며 기포(H₂)가 세차게 납니다." : "나트륨 둘레에서 기포(H₂)가 꾸준히 납니다.", v([{ f: 0.3, col: CLEAR }], { bubbles: c === "ac" ? 14 : 8, ppt: "#9a9ea3", pptH: 5 })] : ["거의 없음", "기포가 거의 생기지 않습니다.", v([{ f: 0.3, col: CLEAR }], { ppt: "#9a9ea3", pptH: 5 })];
      case "fe":
        return c === "ph" ? ["보라색", "곧바로 진한 보라색이 됩니다.", v([{ f: 0.4, col: "#6b2d8a" }])] : ["노란색 그대로", "FeCl₃의 연노란색 그대로입니다.", v([{ f: 0.4, col: YEL }])];
      case "tol":
        return c === "al" ? ["은거울", "물중탕에서 데우자 벽에 은거울이 생깁니다.", v([{ f: 0.4, col: "#c9cdd2" }], { mirror: true })] : ["없음", "투명한 그대로입니다.", v([{ f: 0.4, col: CLEAR }])];
      case "dnp":
        return c === "al" || c === "kt" ? ["주황 침전", "노란~주황색 침전이 생깁니다.", v([{ f: 0.4, col: "#f4c34a" }], { ppt: "#e8901f", pptH: 14 })] : ["없음", "노란 용액 그대로입니다.", v([{ f: 0.4, col: "#f4c34a" }])];
      case "eset":
        return c === "ac" ? ["과일 향", "데운 뒤 찬물에 부으니 위에 얇은 기름층이 뜨고 과일 향이 납니다.", v([{ f: 0.35, col: CLEAR }, { f: 0.05, col: "#efe3b6" }])] : ["변화 없음", c === "es" ? "원래 과일 향 그대로이고 새로 생긴 것은 없습니다." : "새로운 냄새가 생기지 않습니다.", v([{ f: 0.4, col: CLEAR }])];
      case "esac":
        return c === "et" ? ["과일 향", "데운 뒤 찬물에 부으니 위에 얇은 기름층이 뜨고 과일 향이 납니다.", v([{ f: 0.35, col: CLEAR }, { f: 0.05, col: "#efe3b6" }])] : ["변화 없음", c === "ph" ? "페놀은 이 조건에서 거의 에스터화되지 않습니다. 새 냄새가 없습니다." : "새로운 냄새가 생기지 않습니다.", v([{ f: 0.4, col: CLEAR }])];
      case "hyd":
        return c === "es" ? ["층·향 사라짐", "데우는 동안 위층이 줄어 한 층이 되고 과일 향이 사라집니다.", v([{ f: 0.4, col: CLEAR }])] : c === "ac" ? ["냄새 줄어듦", "중화되어 식초 냄새가 약해집니다.", v([{ f: 0.4, col: CLEAR }])] : ["뚜렷한 변화 없음", "눈에 띄는 변화가 없습니다.", v([{ f: 0.4, col: CLEAR }])];
    }
  }
  const UI = (ph) => (ph < 3.5 ? "#e0573a" : ph < 5 ? "#f08a3a" : ph < 6 ? "#f2b84a" : ph < 7.5 ? "#9fc760" : "#4f8fd0");
  const shuffle = () => { const a = ["et", "ac", "ph", "al", "kt", "es"]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let map = L.demo ? ["kt", "ac", "es", "ph", "et", "al"] : shuffle();
  let cur = 0, t = 0;
  const lastVis = Array(6).fill(null), guess = Array(6).fill(null);
  const obs = $(".ft-obs"), ver = $(".verdict");
  const tbl = L.table($(".tbl-host"), [{ key: "u", label: "시료" }, { key: "t", label: "시험" }, { key: "r", label: "결과" }, { key: "ph", label: "pH", res: 0.1 }]);

  const app = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gap = w / 6.4, top = 34, bot = h - 34, tw = Math.min(30, gap * 0.45);
    // 시험관대
    ctx.fillStyle = "#d8c7a6"; ctx.fillRect(gap * 0.4, h * 0.55, w - gap * 0.8, 8);
    for (let i = 0; i < 6; i++) {
      const cx = gap * (0.7 + i), lv = lastVis[i];
      if (i === cur) { ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(cx - gap * 0.45, 8, gap * 0.9, h - 16); }
      let layers = [{ f: 0.4, col: CLEAR }], o = { t };
      if (lv) { layers = lv.vis.layers; o = { ...lv.vis.o, t }; }
      if (lv && lv.test === "ph") layers = [{ f: 0.4, col: UI(lv.ph) }];
      O.tube(ctx, cx, top, bot, tw, layers, o);
      ctx.fillStyle = i === cur ? C.ink : C.ink2; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("ABCDEF"[i], cx, 22);
      if (lv) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(TNAME[lv.test].replace("·H₂SO₄", ""), cx, bot + 16); }
      if (guess[i]) { ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.fillText(NAME[guess[i]], cx, bot + 29); }
    }
  }
  function test(k) {
    const c = map[cur], [short, long, vis] = result(k, c);
    let ph = null;
    if (k === "ph") { ph = L.measure(PH[c], { sd: 0.15, res: 0.1 }); }
    lastVis[cur] = { test: k, vis, ph }; t = 0;
    tbl.add({ u: "ABCDEF"[cur], t: TNAME[k], r: k === "ph" ? "—" : short, ph: ph ?? "—" });
    obs.innerHTML = `<b>${"ABCDEF"[cur]} · ${TNAME[k]}</b>: ${k === "ph" ? `pH 미터 값 ${ph.toFixed(1)}` : long}`;
    draw();
  }
  const pressU = () => { root.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.u === cur))); root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.g === guess[cur]))); };
  $(".unk").addEventListener("click", (e) => { const b = e.target.closest("[data-u]"); if (!b) return; cur = +b.dataset.u; pressU(); draw(); });
  $(".ft-tests").addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b) test(b.dataset.t); });
  $(".guess").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (!b) return; guess[cur] = b.dataset.g; pressU(); draw(); });
  $(".check").addEventListener("click", () => {
    const n = guess.filter(Boolean).length, ok = guess.filter((g, i) => g === map[i]).length;
    ver.className = "verdict " + (ok === 6 ? "good" : "bad");
    ver.textContent = n < 6 ? `아직 ${6 - n}개 시료를 판정하지 않았습니다. 판정한 ${n}개 중 ${ok}개가 맞습니다.` : ok === 6 ? `여섯 개 모두 맞습니다. 시험 ${tbl.rows.length}번으로 가려냈습니다.` : `${ok}개가 맞습니다. 틀린 시료는 두 번째 시험으로 다시 확인하세요.`;
  });
  $(".reshuf").addEventListener("click", () => { map = shuffle(); lastVis.fill(null); guess.fill(null); tbl.clear(); ver.textContent = ""; ver.className = "verdict"; pressU(); draw(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); lastVis.fill(null); draw(); });
  loop($(".cv-wide"), (dt) => { t += dt; if (lastVis.some((v) => v && v.vis.o.bubbles)) draw(); });
  if (L.demo) {
    [[0, "ph"], [1, "ph"], [2, "ph"], [3, "ph"], [4, "ph"], [5, "ph"], [0, "dnp"], [5, "dnp"], [5, "tol"], [1, "hco"], [3, "fe"], [2, "water"], [4, "esac"], [1, "hco"]].forEach(([u, k]) => { cur = u; test(k); });
    ["kt", "ac", "es", "ph", "et", "al"].forEach((g, i) => { guess[i] = g; });
    cur = 1; pressU(); $(".check").click();
  }
  draw();
})();
