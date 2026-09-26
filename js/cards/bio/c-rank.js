/* 카드: 고래는 왜 물고기가 아닐까? — 두 생물의 분류 단계 비교 */
(() => {
  const root = document.getElementById("card-bio-rank");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const selA = $(".org-a"), selB = $(".org-b");
  const nLow = $(".n-low"), nCnt = $(".n-cnt"), nSci = $(".n-sci");

  const RANK = ["역", "계", "문", "강", "목", "과", "속", "종"];
  const ANI = ["진핵생물역", "동물계", "척삭동물문"];
  const MAM = [...ANI, "포유강"];
  // 속·종 칸: [한글, 학명]
  const ORG = {
    human: { name: "사람", r: [...MAM, "영장목", "사람과", ["사람속", "Homo"], ["사람", "Homo sapiens"]] },
    chimp: { name: "침팬지", r: [...MAM, "영장목", "사람과", ["침팬지속", "Pan"], ["침팬지", "Pan troglodytes"]] },
    cat: { name: "고양이", r: [...MAM, "식육목", "고양이과", ["고양이속", "Felis"], ["고양이", "Felis catus"]] },
    tiger: { name: "호랑이", r: [...MAM, "식육목", "고양이과", ["표범속", "Panthera"], ["호랑이", "Panthera tigris"]] },
    lion: { name: "사자", r: [...MAM, "식육목", "고양이과", ["표범속", "Panthera"], ["사자", "Panthera leo"]] },
    wolf: { name: "늑대", r: [...MAM, "식육목", "개과", ["개속", "Canis"], ["늑대", "Canis lupus"]] },
    whale: { name: "대왕고래", r: [...MAM, "고래목", "긴수염고래과", ["긴수염고래속", "Balaenoptera"], ["대왕고래", "Balaenoptera musculus"]] },
    shark: { name: "백상아리", r: [...ANI, "연골어강", "악상어목", "악상어과", ["백상아리속", "Carcharodon"], ["백상아리", "Carcharodon carcharias"]] },
    rice: { name: "벼", r: ["진핵생물역", "식물계", null, null, null, null, ["벼속", "Oryza"], ["벼", "Oryza sativa"]] },
    ecoli: { name: "대장균", r: ["세균역", "진정세균계", null, null, null, null, ["대장균속", "Escherichia"], ["대장균", "Escherichia coli"]] },
  };
  const key = (c) => c == null ? null : Array.isArray(c) ? c[1] : c;

  const { ctx, size } = fit(cv, () => draw());

  function shared(a, b) {
    let k = 0;
    while (k < 8 && key(a.r[k]) !== null && key(a.r[k]) === key(b.r[k])) k++;
    return k; // 앞에서부터 k개 단계가 같다
  }

  function cellText(c, italicOk) {
    if (c == null) return [["(생략)", false]];
    if (Array.isArray(c)) return [[c[0], false], [c[1], italicOk]];
    return [[c, false]];
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const A = ORG[selA.value], B = ORG[selB.value], k = shared(A, B);
    const lx = 34, top = 26, rowH = (h - top - 6) / 8, colW = (w - lx - 10) / 2;
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(A.name, lx + colW / 2, 16); ctx.fillText(B.name, lx + colW * 1.5, 16);
    for (let i = 0; i < 8; i++) {
      const y = top + i * rowH;
      ctx.font = `500 12px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText(RANK[i], 6, y + rowH / 2 + 4);
      const boxes = i < k ? [[lx, colW * 2, A.r[i], true]] : [[lx, colW, A.r[i], false], [lx + colW, colW, B.r[i], false]];
      for (const [x, bw, c, same] of boxes) {
        const pad = 3;
        ctx.fillStyle = same ? "#e3efdd" : c == null ? "transparent" : C.card;
        ctx.strokeStyle = same ? C.forest : C.rule; ctx.lineWidth = same ? 1.4 : 1;
        ctx.beginPath(); ctx.rect(x + pad, y + pad, bw - pad * 2, rowH - pad * 2); ctx.fill(); ctx.stroke();
        const parts = cellText(c, true);
        const cx = x + bw / 2, cy = y + rowH / 2 + 4;
        const fs = Math.min(14, rowH * .46);
        let total = 0;
        const fonts = parts.map(([t, it]) => { const f = it ? `italic ${fs}px ${F.serif}` : `${fs}px ${F.sans}`; ctx.font = f; const m = ctx.measureText(t).width; total += m; return [t, f, m]; });
        total += (parts.length - 1) * 6;
        let xx = cx - total / 2; ctx.textAlign = "left";
        if (total > bw - 10 && parts.length > 1) { // 좁으면 학명만
          const [t, f] = fonts[1]; ctx.font = f; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(t, cx, cy); continue;
        }
        for (const [t, f, m] of fonts) { ctx.font = f; ctx.fillStyle = c == null ? C.ink3 : same ? C.forest : C.ink; ctx.fillText(t, xx, cy); xx += m + 6; }
      }
      if (i === k - 1) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(lx, y + rowH); ctx.lineTo(lx + colW * 2, y + rowH); ctx.stroke(); ctx.setLineDash([]);
      }
    }
  }

  function update() {
    const A = ORG[selA.value], B = ORG[selB.value], k = shared(A, B);
    nLow.textContent = selA.value === selB.value ? "같은 생물" : k ? RANK[k - 1] : "없음";
    nCnt.textContent = `${k} / 8`;
    nSci.textContent = k >= 7 ? "같은 속" : k === 0 ? "역부터 다름" : `${RANK[k]}에서 갈림`;
    draw();
  }
  [selA, selB].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-pair]").forEach((b) => b.addEventListener("click", () => {
    const [a, c] = b.dataset.pair.split(","); selA.value = a; selB.value = c; update();
  }));
  update();
})();
