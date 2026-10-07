/* 카드: 이 자료는 얼마나 믿을 만할까? — 가상 자료 여섯 개의 출처 확인과 신뢰도 매기기 */
(() => {
  const root = document.getElementById("card-resr-source");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);

  const CK = [["who", "누가 썼나"], ["evi", "근거는 무엇인가"], ["rev", "어떤 검증을 거쳤나"], ["when", "언제 나왔나"], ["why", "왜 썼나"], ["cross", "다른 출처와 맞나"]];
  /* 가상의 자료. 각 확인 항목: [설명, +1 좋음 / 0 보통 / −1 나쁨] */
  const S = [
    { k: "A", type: "동영상", head: "클래식 음악 들려준 상추, 2주 만에 2배로 자랐다!", year: 2024, views: 1240000, score: 1,
      c: { who: ["원예 채널 운영자. 과학 연구 경력은 밝히지 않음", -1], evi: ["화분 두 개(음악 1개, 음악 없음 1개)를 한 번 비교. 놓인 자리와 물 준 양은 나오지 않음", -1], rev: ["검증 과정 없음", -1], when: ["2024년. 최신이지만 최신이라고 정확한 것은 아님", 0], why: ["설명란에 '식물용 스피커' 구매 링크가 있음", -1], cross: ["비슷한 영상이 많지만 대부분 이 영상을 다시 올린 것", -1] },
      note: "표본이 두 개뿐이고 통제가 드러나지 않으며, 판매 목적이 있습니다. 조회수는 신뢰도와 관계가 없습니다." },
    { k: "B", type: "학술지 논문", head: "소리 진동 처리가 애기장대의 생장과 유전자 발현에 미치는 영향", year: 2018, views: 3100, score: 4,
      c: { who: ["대학 식물생리학 연구팀", 1], evi: ["처리군·대조군 각 30개체, 3회 반복, 같은 생장 상자에서 소리만 다르게 함. 원자료 공개", 1], rev: ["동료 평가를 거쳐 학술지에 실림", 1], when: ["2018년. 이후 이 논문을 인용한 연구 40여 편", 1], why: ["공공 연구비 지원, 이해 충돌 없음을 밝힘", 1], cross: ["'음악'이 아니라 단일 주파수 진동을 썼고, 다른 연구팀의 결과는 엇갈림", 0] },
      note: "방법과 검증이 가장 탄탄합니다. 다만 단일 주파수 진동을 다뤄 '음악'이라는 질문과 정확히 같지는 않으므로, 관련성을 따져 인용해야 합니다." },
    { k: "C", type: "신문 기사", head: "음악이 식물 키운다… 과학으로 증명", year: 2019, views: 85000, score: 2,
      c: { who: ["과학 담당 기자", 0], evi: ["B 논문을 인용하고 링크를 달았지만, '일부 유전자 발현 변화'를 '더 잘 자란다'로 바꿔 씀", -1], rev: ["언론사의 편집 과정은 있지만 과학적 동료 평가는 아님", 0], when: ["2019년", 0], why: ["눈길을 끄는 제목", -1], cross: ["원 논문과 대조하면 결론이 과장됨", -1] },
      note: "원 논문을 찾게 해 주는 길잡이로는 쓸모 있지만, 근거로는 원 논문을 직접 인용해야 합니다. '증명'이라는 말부터 의심하세요." },
    { k: "D", type: "위키백과 문서", head: "식물과 소리", year: 2025, views: 12000, score: 3,
      c: { who: ["여러 익명 편집자", -1], evi: ["각주 18개, 학술 논문 여러 편에 연결", 1], rev: ["편집자들끼리 검토하지만 학술적 검증은 아님", 0], when: ["2025년에 마지막으로 수정", 1], why: ["정보 제공", 1], cross: ["연구 결과가 엇갈린다고 정리함", 1] },
      note: "배경과 주요 문헌을 찾는 출발점으로 좋습니다. 보고서에는 각주의 원 논문을 읽고 그것을 인용합니다." },
    { k: "E", type: "학생 탐구 보고서", head: "음악의 종류에 따른 강낭콩의 생장 비교", year: 2015, views: 900, score: 2,
      c: { who: ["고등학생 모둠과 지도 교사", 0], evi: ["화분 10개(음악 5개, 대조 5개). 방법을 자세히 적었고, '창가 쪽 화분에 음악을 틀었다'는 한계를 스스로 밝힘", 0], rev: ["탐구 대회 심사만 거침", -1], when: ["2015년", 0], why: ["탐구 대회 출품", 1], cross: ["결과를 다시 확인한 다른 연구가 없음", -1] },
      note: "정직하게 한계를 적어 실험 설계 아이디어를 얻기에 좋습니다. 그러나 빛 조건이 섞여 있어 결론의 근거로 쓰기는 어렵습니다." },
    { k: "F", type: "프리프린트", head: "음악 노출이 토마토 모종의 생장에 미치는 영향: 무작위 눈가림 실험", year: 2023, views: 2300, score: 3,
      c: { who: ["두 대학의 공동 연구팀", 1], evi: ["모종 120개체를 무작위로 나누고, 처리 여부를 모르는 사람이 측정. 원자료와 분석 코드 공개", 1], rev: ["아직 동료 평가 전", -1], when: ["2023년", 1], why: ["연구비 출처와 이해 충돌 없음을 밝힘", 1], cross: ["'두 집단의 키 차이 없음'. 여러 연구와 비슷한 결과", 1] },
      note: "설계는 튼튼하지만 동료 평가 전입니다. 인용할 때 프리프린트임을 밝히고, 학술지에 실렸는지 나중에 다시 확인합니다." },
  ];
  const st = S.map(() => ({ open: {}, rate: null, shown: false }));
  let cur = 0;

  const host = $(".r1r-src"), card = $(".r1r-card");
  host.innerHTML = S.map((s, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 0}">${s.k}. ${s.type}</button>`).join("");
  const fmtV = (v) => (v >= 10000 ? (v / 10000).toFixed(v >= 100000 ? 0 : 1) + "만" : v.toLocaleString("ko-KR"));

  function show() {
    const s = S[cur], t = st[cur];
    card.innerHTML = `<div class="r1r-head">${s.head}</div>
      <div class="r1r-meta">${s.type} · ${s.year} · 조회수 ${fmtV(s.views)}</div>
      <div class="r1r-checks">${CK.map(([k, lab]) => {
        const o = t.open[k], v = s.c[k];
        return `<button type="button" class="r1r-ck ${o ? (v[1] > 0 ? "r1r-plus" : v[1] < 0 ? "r1r-minus" : "") : ""}" data-k="${k}"><b>${lab}${o ? (v[1] > 0 ? " · 좋음" : v[1] < 0 ? " · 문제" : " · 보통") : " · 눌러 확인"}</b>${o ? v[0] : ""}</button>`;
      }).join("")}</div>
      <div class="r1r-rate"><span class="mono small">내 판단</span><input type="range" min="1" max="5" step="1" value="${t.rate || 3}" aria-label="신뢰도 1~5"><output class="mono">${t.rate ? t.rate + "점" : "—"}</output><button type="button" class="chip go r1r-judge">판정 보기</button></div>
      <p class="r1r-verdict">${t.shown ? `<b>확인 항목으로 본 신뢰도 ${s.score}점.</b> ${s.note}` : ""}</p>`;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    cur = +b.dataset.i;
    host.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show();
  });
  card.addEventListener("click", (e) => {
    const ck = e.target.closest(".r1r-ck");
    if (ck) { st[cur].open[ck.dataset.k] = true; show(); return; }
    if (e.target.closest(".r1r-judge")) {
      st[cur].rate = +card.querySelector("input").value; st[cur].shown = true; show(); draw();
    }
  });
  card.addEventListener("input", (e) => {
    if (e.target.matches("input")) card.querySelector("output").textContent = e.target.value + "점";
  });

  /* 순위 상관 (스피어만) */
  function rho(a, b) {
    const rank = (x) => { const o = x.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(x.length); let i = 0;
      while (i < o.length) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2; i = j + 1; } return r; };
    const ra = rank(a), rb = rank(b), n = a.length, ma = ra.reduce((s, v) => s + v, 0) / n, mb = rb.reduce((s, v) => s + v, 0) / n;
    let sab = 0, saa = 0, sbb = 0;
    for (let i = 0; i < n; i++) { sab += (ra[i] - ma) * (rb[i] - mb); saa += (ra[i] - ma) ** 2; sbb += (rb[i] - mb) ** 2; }
    return saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
  }

  const cv = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 60, bw = w - x0 - 44, bh = h - y0 - 52;
    const Y = (v) => y0 + bh - (v - 0.5) / 5 * bh;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X: (v) => v, Y, yt: [1, 2, 3, 4, 5].map((v) => [v, v + "점"]), ylabel: "신뢰도" });
    const gw = bw / S.length, vmax = Math.log10(2e6);
    S.forEach((s, i) => {
      const cx = x0 + gw * (i + 0.5);
      const vh = Math.log10(s.views) / vmax * bh * 0.92;
      ctx.fillStyle = "rgba(141,141,146,.18)"; ctx.fillRect(cx - gw * 0.3, y0 + bh - vh, gw * 0.6, vh);
      ctx.textAlign = "center";
      const t = st[i];
      if (t.shown) {
        ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, Y(s.score), 8, 0, Math.PI * 2); ctx.stroke();
      }
      if (t.rate) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, Y(t.rate), 4.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = i === cur ? C.ink : C.ink2; ctx.font = `${i === cur ? "600 " : ""}12px ${F.sans}`;
      ctx.fillText(s.k, cx, y0 + bh + 16);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3;
      ctx.fillText(gw > 62 ? `${s.type}` : fmtV(s.views), cx, y0 + bh + 30);
      if (gw > 62) { ctx.font = `10px ${F.mono}`; ctx.fillText("조회 " + fmtV(s.views), cx, y0 + bh + 43); }
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    let lx = x0;
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(lx + 5, 14, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText("내 판단", lx + 14, 18); lx += 70;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx + 6, 14, 6, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = C.ink2; ctx.fillText("확인 항목으로 본 판정", lx + 16, 18); lx += 140;
    ctx.fillStyle = "rgba(141,141,146,.3)"; ctx.fillRect(lx, 9, 12, 10); ctx.fillStyle = C.ink2; ctx.fillText("조회수 (로그)", lx + 16, 18);
    const done = st.map((t, i) => [t.rate, i]).filter(([r]) => r != null);
    if (done.length >= 4) {
      const mine = done.map(([r]) => r), sc = done.map(([, i]) => S[i].score), vw = done.map(([, i]) => S[i].views);
      const rS = rho(mine, sc), rV = rho(mine, vw);
      ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`; ctx.fillStyle = rS > rV ? C.forest : C.warn;
      ctx.fillText(`내 점수와의 순위 상관: 판정 ${rS.toFixed(2)} · 조회수 ${rV.toFixed(2)}`, x0, 36);
    }
  }
  show();
  if (/[?&]demo\b/.test(location.search)) {
    [3, 4, 2, 3, 2, 3].forEach((r, i) => { st[i].rate = r; st[i].shown = true; });
    cur = 1; CK.forEach(([k]) => { st[1].open[k] = true; });
    host.querySelectorAll("[data-i]").forEach((x, i) => x.setAttribute("aria-pressed", String(i === 1)));
    show(); draw();
  }
})();
