/* 카드: 초파리를 교배해 세어 보면 정말 3 : 1이 나올까? — P → F1 → F2 가상 교배, 처녀 암컷, 생존율 차이, 카이제곱 검정 */
(() => {
  const root = document.getElementById("card-labbio-fly-cross");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, X = LBChi;
  const $ = (s) => root.querySelector(s);

  /* 표현형 번호: 흔적 날개면 +2, 흑색 몸이면 +1 (단성 잡종은 0·1만 씀) */
  const CROSS = {
    vg: { loci: ["vg"], names: ["야생형", "흔적 날개"], ratio: [3, 1], f2: "F₂", p: "흔적 날개 처녀 암컷 × 야생형 수컷" },
    e: { loci: ["e"], names: ["야생형", "흑색 몸"], ratio: [3, 1], f2: "F₂", p: "흑색 몸 처녀 암컷 × 야생형 수컷" },
    di: { loci: ["vg", "e"], names: ["야생형", "흑색", "흔적", "흔적+흑색"], ratio: [9, 3, 3, 1], f2: "F₂", p: "흔적 날개·흑색 몸 처녀 암컷 × 야생형 수컷" },
    tc: { loci: ["vg", "e"], names: ["야생형", "흑색", "흔적", "흔적+흑색"], ratio: [1, 1, 1, 1], f2: "검정", p: "흔적 날개·흑색 몸 처녀 암컷 × 야생형 수컷", test: true },
  };
  const VIAB = { vg: 0.85, e: 0.88 };
  let cur = "vg", stage = 0, contam = 0, vials = 0, last = null, tbl = null;

  const cr = () => CROSS[cur];
  const isVg = (k) => (cr().loci.length === 2 ? k >= 2 : cr().loci[0] === "vg" && k === 1);
  const isE = (k) => (cr().loci.length === 2 ? k % 2 === 1 : cr().loci[0] === "e" && k === 1);

  function makeTable() {
    const old = $(".tbl-host"), host = old.cloneNode(false);
    old.replaceWith(host);
    const cols = [{ key: "g", label: "세대" }].concat(cr().names.map((nm, i) => ({ key: "c" + i, label: nm, res: 1 }))).concat([{ key: "n", label: "합계", res: 1 }, { key: "x", label: "χ²", res: 0.01 }]);
    tbl = L.table(host, cols, () => { update(); draw(); });
  }

  /* 한 병의 자손 표현형 만들기. pm[i] = i번째 유전자좌에서 돌연변이 표현형이 나올 확률 */
  function vial(n, pm) {
    const k = cr().names.length, w = new Array(k).fill(0);
    for (let i = 0; i < k; i++) {
      let pr = 1;
      cr().loci.forEach((loc, j) => {
        const mut = cr().loci.length === 2 ? (j === 0 ? i >= 2 : i % 2 === 1) : i === 1;
        pr *= mut ? pm[j] : 1 - pm[j];
        if (mut && $(".viab").checked) pr *= VIAB[loc];
      });
      w[i] = pr;
    }
    const tot = w.reduce((s, x) => s + x, 0), cnt = new Array(k).fill(0), flies = [];
    for (let m = 0; m < n; m++) {
      let r = Math.random() * tot, i = 0;
      while (r > w[i] && i < k - 1) { r -= w[i]; i++; }
      cnt[i]++; flies.push(i);
    }
    return { cnt, flies };
  }
  const brood = () => Math.max(35, Math.min(110, Math.round(L.measure(72, { sd: 18 }))));

  function doP() {
    stage = 1; vials = 0;
    contam = $(".nonvirgin").checked ? 0.25 + Math.random() * 0.15 : 0;
    const k = cr().names.length;
    const v = vial(brood(), cr().loci.map(() => 0));
    /* 처녀가 아닌 암컷: 같은 돌연변이 계통 수컷과 이미 짝짓기해 일부 F1이 돌연변이 동형 접합 */
    if (contam) v.flies = v.flies.map((f) => (Math.random() < contam ? k - 1 : f));
    v.cnt = new Array(k).fill(0); v.flies.forEach((f) => v.cnt[f]++);
    contam = v.cnt[k - 1] / v.flies.length;
    last = { label: "F₁", flies: v.flies };
    const row = { g: "F₁", n: v.flies.length, x: "—" };
    v.cnt.forEach((c, i) => { row["c" + i] = c; });
    tbl.add(row);
  }
  function doF2() {
    if (stage < 1) { $(".fc-obs").innerHTML = "<b>먼저 ① P 교배</b>로 F₁을 얻어야 합니다."; return; }
    const q = 0.5 + 0.5 * contam;   // F1 집단이 만드는 생식세포 중 돌연변이 대립유전자 비율
    const pm = cr().loci.map(() => (cr().test ? q : q * q));
    const v = vial(brood(), pm);
    vials++;
    last = { label: `${cr().f2} ${vials}병`, flies: v.flies };
    const row = { g: `${cr().f2} ${vials}병`, n: v.flies.length };
    v.cnt.forEach((c, i) => { row["c" + i] = c; });
    const sum = cr().ratio.reduce((s, x) => s + x, 0);
    row.x = X.chi2(v.cnt, cr().ratio.map((r) => r / sum * v.flies.length)).x2;
    tbl.add(row);
  }

  function totals() {
    const k = cr().names.length, t = new Array(k).fill(0);
    let n = 0;
    tbl.rows.filter((r) => r.g !== "F₁").forEach((r) => { for (let i = 0; i < k; i++) t[i] += r["c" + i]; n += r.n; });
    return { t, n };
  }
  function update() {
    const { t, n } = totals(), sum = cr().ratio.reduce((s, x) => s + x, 0);
    const lbl = cr().test ? "검정 교배 자손" : "F₂";
    root.querySelector(".nums dt").textContent = `${lbl} 누적 개체 수`;
    const f1 = tbl.rows.find((r) => r.g === "F₁");
    let msg = stage ? `P: ${cr().p}.` : "교배 조합을 고르고 ① P 교배부터 시작하세요.";
    if (f1) {
      const k = cr().names.length, mut = f1.n - f1.c0;
      msg += mut ? ` <b>F₁ ${f1.n}마리 중 ${mut}마리가 돌연변이 표현형</b>입니다. 이론대로라면 F₁은 모두 야생형이어야 합니다. 어디서 잘못되었을까요?` : ` <b>F₁ ${f1.n}마리가 모두 야생형</b>입니다. 돌연변이 형질은 열성입니다.`;
    }
    $(".fc-obs").innerHTML = msg;
    if (!n) { $(".n-n").textContent = "—"; $(".n-x").textContent = "—"; $(".n-p").textContent = "—"; $(".n-p").className = "n-p"; return; }
    const r = X.chi2(t, cr().ratio.map((x) => x / sum * n));
    $(".n-n").textContent = `${n}마리 (${tbl.rows.filter((x) => x.g !== "F₁").length}병)`;
    $(".n-x").textContent = `${r.x2.toFixed(2)} (${r.df})`;
    const ok = r.p > 0.05;
    $(".n-p").textContent = `${r.p < 0.001 ? "< 0.001" : r.p.toFixed(3)} · ${ok ? "가설 유지" : "가설 기각"}`;
    $(".n-p").className = "n-p " + (ok ? "good" : "bad");
  }

  const { ctx, size } = fit($("canvas"), () => draw());
  function fly(x, y, s, vg, eb) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "rgba(170,190,205,.55)"; ctx.strokeStyle = "rgba(110,130,150,.7)"; ctx.lineWidth = 0.6;
    for (const sg of [-1, 1]) {
      ctx.beginPath();
      if (vg) { ctx.ellipse(sg * s * 0.22, s * 0.05, s * 0.12, s * 0.08, sg * 0.6, 0, Math.PI * 2); }
      else { ctx.ellipse(sg * s * 0.2, s * 0.32, s * 0.15, s * 0.42, sg * 0.32, 0, Math.PI * 2); }
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = eb ? "#3b3128" : "#c49a5c";
    ctx.beginPath(); ctx.ellipse(0, s * 0.3, s * 0.16, s * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -s * 0.05, s * 0.15, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b8302a";
    ctx.beginPath(); ctx.arc(-s * 0.11, -s * 0.24, s * 0.08, 0, Math.PI * 2); ctx.arc(s * 0.11, -s * 0.24, s * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function draw() {
    const { w, h } = size; if (!w || !tbl) return;
    ctx.clearRect(0, 0, w, h);
    const lw = w * 0.5;
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    if (!last) {
      ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`;
      ctx.fillText("① P 교배를 누르면", 10, h / 2 - 8); ctx.fillText("우화한 자손이 여기 보입니다.", 10, h / 2 + 10);
    } else {
      ctx.fillText(`${last.label} · ${last.flies.length}마리`, 8, 16);
      const cols = 10, rows = 6, cs = Math.min((lw - 16) / cols, (h - 34) / rows);
      last.flies.slice(0, cols * rows).forEach((f, i) => fly(8 + cs * (i % cols + 0.5), 28 + cs * (Math.floor(i / cols) + 0.45), cs * 0.9, isVg(f), isE(f)));
      if (last.flies.length > cols * rows) { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText(`(앞의 ${cols * rows}마리만 그림)`, 8, h - 4); }
    }
    /* 오른쪽: 누적 비율 막대 + 기대 비율 */
    const { t, n } = totals(), names = cr().names, sum = cr().ratio.reduce((s, x) => s + x, 0);
    const x0 = lw + 30, bw0 = (w - x0 - 8) / names.length, y0 = 26, bh = h - y0 - 34;
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(`${cr().test ? "검정 교배" : "F₂"} 누적 비율`, lw + 6, 16);
    const top = cr().ratio.length === 2 ? 1 : 0.7;
    ctx.strokeStyle = C.rule; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let v = 0; v <= top + 1e-9; v += top === 1 ? 0.25 : 0.1) { const y = y0 + bh - v / top * bh; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(w - 8, y); ctx.stroke(); ctx.fillText(v.toFixed(top === 1 ? 2 : 1), x0 - 4, y + 3); }
    names.forEach((nm, i) => {
      const bx = x0 + bw0 * i + bw0 * 0.18, bw = bw0 * 0.64;
      if (n) { const v = t[i] / n, bhh = Math.min(1, v / top) * bh; ctx.fillStyle = i === 0 ? C.sprout : C.amber; ctx.fillRect(bx, y0 + bh - bhh, bw, bhh); }
      const e = cr().ratio[i] / sum, ey = y0 + bh - e / top * bh;
      ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - 4, ey); ctx.lineTo(bx + bw + 4, ey); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(nm, bx + bw / 2, y0 + bh + 14);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText(n ? String(t[i]) : "", bx + bw / 2, y0 + bh + 27);
    });
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`점선 = 기대 ${cr().ratio.join(" : ")}`, w - 8, 16);
  }

  function reset() { stage = 0; vials = 0; contam = 0; last = null; makeTable(); update(); draw(); }
  $(".cross").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    cur = b.dataset.c;
    root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".f-cross").textContent = cr().test ? "② F₁ 암컷 × 흔적·흑색 수컷 → 자손 한 병 세기" : "② F₁끼리 교배 → F₂ 한 병 세기";
    reset();
  });
  $(".p-cross").addEventListener("click", () => { reset(); doP(); });
  $(".f-cross").addEventListener("click", doF2);
  $(".clear").addEventListener("click", reset);
  $(".nonvirgin").addEventListener("change", reset);
  $(".viab").addEventListener("change", reset);
  makeTable(); update(); draw();
  if (L.demo) { root.querySelector('[data-c="di"]').click(); doP(); for (let i = 0; i < 5; i++) doF2(); }
})();
