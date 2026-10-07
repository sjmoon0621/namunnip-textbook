/* 카드: 재조합 플라스미드 설계 — 점착/평활 말단의 맞물림, 방향성 클로닝, 탈인산화, 청백 선별 · 모식 */
(() => {
  const root = document.getElementById("card-adbio-cloning");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cvE = $(".cv-end"), cvD = $(".cv-dish"), sR = $(".ratio"), oR = $(".r-out"), cip = $(".cip");
  let vec = "EE", ins = "EE";

  /* 잘린 끝: L = 자른 자리의 왼쪽 조각, R = 오른쪽 조각. 아래 가닥은 3′→5′로 왼쪽부터 적는다. o = 5′ 돌출 길이 */
  const L = { E: ["…G", "…CTTAA", 4], B: ["…G", "…CCTAG", 4], S: ["…CCC", "…GGG", 0], N: ["…TAA", "…ATT", 0] };
  const R = { E: ["AATTC…", "G…", 4], B: ["GATCC…", "G…", 4], S: ["GGG…", "CCC…", 0], N: ["ATG…", "TAC…", 0] };
  const blunt = (t) => t === "S" || t === "N";
  const ok = (a, b) => (blunt(a) && blunt(b)) || a === b;
  const jf = (a) => (blunt(a) ? 0.3 : 1);
  const NAME = { E: "EcoRI", B: "BamHI", S: "SmaI", N: "평활" };

  function state() {
    const vA = vec[0], vB = vec[1];
    const iA = ins === "SS" ? "N" : ins[0], iB = ins === "SS" ? "N" : ins[1];
    const r = +sR.value, dephos = cip.checked;
    const fwdOK = ok(vA, iA) && ok(iB, vB), revOK = ok(vA, iB) && ok(iA, vB), selfOK = ok(vA, vB);
    const self = selfOK ? 4 * jf(vA) * (dephos ? 0.03 : 1) : 0;
    const bg = 0.03 + (vA !== vB ? 0.15 * (dephos ? 0.03 : 1) : 0);
    const fwd = fwdOK ? r * jf(vA) * jf(vB) : 0, rev = revOK ? r * jf(vA) * jf(vB) : 0;
    const sum = self + bg + fwd + rev, N = Math.round(400 * sum / (sum + 3));
    const blue = Math.round(N * (self + bg) / sum), fw = Math.round(N * fwd / sum), rv = N - blue - fw;
    return { vA, vB, iA, iB, fwdOK, revOK, selfOK, dephos, N, blue, fw, rv };
  }

  const gE = fit(cvE, () => drawEnds());
  function drawEnds() {
    const { ctx, size: { w, h } } = gE; if (!w) return;
    const s = state();
    ctx.clearRect(0, 0, w, h);
    const fs = Math.max(10, Math.min(16, w / 30));
    ctx.font = `${fs}px ${F.mono}`;
    const cw = ctx.measureText("G").width;
    const yT = h * 0.42, yB = yT + fs * 1.45;
    /* 위쪽 이름표와 띠 */
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = C.ink2; ctx.fillText("벡터 쪽", w * 0.13, 16); ctx.fillText("벡터 쪽", w * 0.85, 16);
    ctx.fillStyle = C.forest; ctx.fillText("GFP 유전자 (정방향으로 넣을 때)", w * 0.49, 16);
    function junction(c, lp, rp, lCol, rCol) {
      const good = ok(lp, rp), gap = good ? 0 : cw * 2.5;
      const [lt, lb, lo] = L[lp], [rt, rb, ro] = R[rp];
      ctx.font = `${fs}px ${F.mono}`;
      ctx.fillStyle = lCol; ctx.textAlign = "right";
      ctx.fillText(lt, c - gap / 2, yT); ctx.fillText(lb, c - gap / 2 + lo * cw, yB);
      ctx.fillStyle = rCol; ctx.textAlign = "left";
      ctx.fillText(rt, c + gap / 2, yT); ctx.fillText(rb, c + gap / 2 + ro * cw, yB);
      ctx.font = `700 15px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillStyle = good ? C.forest : C.warn;
      ctx.fillText(good ? "✓" : "✗", c + (lo ? cw * 2 : 0), yT - fs * 1.4);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3;
      ctx.fillText(`${NAME[lp]} 끝 + ${NAME[rp]} 끝`, c + (lo ? cw * 2 : 0), yB + fs * 1.6);
    }
    junction(w * 0.31, s.vA, s.iA, C.ink, C.forest);
    junction(w * 0.71, s.iB, s.vB, C.forest, C.ink);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("위 가닥 5′→3′", 2, yT); ctx.fillText("아래 가닥 3′→5′", 2, yB);
    /* 아래 요약 */
    const lines = [
      ["정방향 삽입", s.fwdOK ? "가능" : "불가 — 이음매가 맞지 않음", !s.fwdOK],
      ["역방향 삽입", s.revOK ? (s.fwdOK && s.vA === s.vB ? "가능 — 두 방향이 반반" : "가능") : "불가 — 이음매가 맞지 않음", s.revOK],
      ["벡터 스스로 닫힘", !s.selfOK ? "불가 — 두 끝이 서로 맞지 않음" : s.dephos ? "탈인산화로 거의 막힘" : "가능 — 빈 벡터가 생김", s.selfOK && !s.dephos],
    ];
    ctx.font = `12px ${F.sans}`;
    lines.forEach(([k, v, bad], i) => {
      const y = h - 44 + i * 17;
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(k, 8, y);
      ctx.fillStyle = bad ? C.warn : C.forest; ctx.fillText(v, 8 + Math.max(100, w * 0.26), y);
    });
  }

  /* 평판 */
  function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = rng(11), pts = [];
  while (pts.length < 400) { const x = rnd() * 2 - 1, y = rnd() * 2 - 1; if (x * x + y * y < 0.86) pts.push([x, y, 0.7 + rnd() * 0.6]); }
  const order = pts.map((_, i) => [i, rnd()]).sort((a, b) => a[1] - b[1]).map((a) => a[0]);

  const gD = fit(cvD, () => drawDish());
  function drawDish() {
    const { ctx, size: { w, h } } = gD; if (!w) return;
    const s = state();
    ctx.clearRect(0, 0, w, h);
    const R0 = h / 2 - 12, cx = R0 + 6, cy = h / 2 - 6;
    ctx.fillStyle = "#f1ead2"; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.stroke();
    const cr = Math.max(1.8, R0 * 0.026);
    for (let k = 0; k < s.N; k++) {
      const [x, y, sc] = pts[order[k]];
      const blue = k < s.blue;
      ctx.fillStyle = blue ? "#2f5d9a" : "#fdfdfb";
      ctx.strokeStyle = blue ? "#244a7c" : "#b8b8b0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx + x * R0, cy + y * R0, cr * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("Amp + X-gal + IPTG", cx, h - 1);
    /* 오른쪽: 막대와 설명 */
    const x0 = 2 * R0 + 26, bw = w - x0 - 8, by = 26, bh = 16;
    ctx.textAlign = "left"; ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText("콜로니 구성 (확인 실험 기준)", x0, 14);
    const seg = [[s.blue, "#2f5d9a"], [s.fw, C.forest], [s.rv, C.amber]];
    let x = x0;
    seg.forEach(([n, col]) => { const ww = s.N ? n / s.N * bw : 0; ctx.fillStyle = col; ctx.fillRect(x, by, ww, bh); x += ww; });
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, by + .5, bw - 1, bh - 1);
    const rows = [["#2f5d9a", `파란색 ${s.blue}개 — 빈 벡터`], [C.forest, `흰색 정방향 ${s.fw}개`], [C.amber, `흰색 역방향 ${s.rv}개`]];
    ctx.font = `11.5px ${F.sans}`;
    rows.forEach(([col, t], i) => {
      const y = by + bh + 22 + i * 19;
      ctx.fillStyle = col; ctx.fillRect(x0, y - 9, 10, 10);
      ctx.fillStyle = C.ink2; ctx.fillText(t, x0 + 16, y);
    });
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3;
    const note = ["흰 콜로니의 방향은 평판에서", "보이지 않습니다. 콜로니 PCR이나", "제한 효소 지도로 확인합니다."];
    note.forEach((t, i) => ctx.fillText(t, x0, by + bh + 92 + i * 14));
  }

  function update() {
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === vec)));
    root.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.i === ins)));
    oR.textContent = sR.value;
    const s = state(), white = s.fw + s.rv;
    $(".n-n").textContent = String(s.N);
    $(".n-w").textContent = s.N ? `${Math.round(white / s.N * 100)} %` : "—";
    $(".n-f").textContent = white ? `${Math.round(s.fw / white * 100)} %` : "—";
    drawEnds(); drawDish();
  }
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { vec = b.dataset.v; update(); }));
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { ins = b.dataset.i; update(); }));
  sR.addEventListener("input", update); cip.addEventListener("change", update);
  update();
})();
