/* 카드: 유전 암호의 실험적 해독 — 단일 중합체, 무작위·반복 공중합체, 삼중자 결합 실험.
   실험 결과는 실제 보고된 결과(니런버그–마테이 1961, 코라나 1963~66, 니런버그–레더 1964)를 표준 유전 암호로 재현한다. */
(() => {
  const root = document.getElementById("card-adbio-codebreak");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const B = "UCAG";
  const AA1 = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const N3 = { F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", C: "Cys", W: "Trp", P: "Pro", H: "His", Q: "Gln", R: "Arg", I: "Ile", M: "Met", T: "Thr", N: "Asn", K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly", "*": "종결" };
  const CODE = {}, ALL = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) {
    const c = B[i] + B[j] + B[k]; CODE[c] = N3[AA1[i * 16 + j * 4 + k]]; ALL.push(c);
  }
  const EXP = {
    U: { name: "poly(U)", who: "니런버그·마테이 (1961)", rep: "U", res: "페닐알라닌만으로 된 사슬 (폴리Phe)" },
    C: { name: "poly(C)", who: "니런버그·마테이 (1961)", rep: "C", res: "프롤린만으로 된 사슬 (폴리Pro)" },
    A: { name: "poly(A)", who: "니런버그·마테이 (1961)", rep: "A", res: "라이신만으로 된 사슬 (폴리Lys)" },
    UC: { name: "(UC)ₙ", who: "코라나", rep: "UC", res: "Ser–Leu가 번갈아 이어진 사슬" },
    AG: { name: "(AG)ₙ", who: "코라나", rep: "AG", res: "Arg–Glu가 번갈아 이어진 사슬" },
    UUC: { name: "(UUC)ₙ", who: "코라나", rep: "UUC", res: "폴리Phe, 폴리Ser, 폴리Leu 세 가지" },
    AAG: { name: "(AAG)ₙ", who: "코라나", rep: "AAG", res: "폴리Lys, 폴리Arg, 폴리Glu 세 가지" },
    UAUC: { name: "(UAUC)ₙ", who: "코라나", rep: "UAUC", res: "(Tyr–Leu–Ser–Ile)이 되풀이된 사슬" },
    GUAA: { name: "(GUAA)ₙ", who: "코라나", rep: "GUAA", res: "긴 사슬은 생기지 않고 짧은 펩타이드만 생김" },
  };
  const S = { cur: null, sets: [], done: new Set(), bind: "UCU", pu: 0.75 };
  /* 실험 하나가 주는 정보: 코돈 묶음 ↔ 아미노산 묶음 */
  function info(key) {
    if (key === "BIND") return { codons: [S.bind], aas: [CODE[S.bind]] };
    const e = EXP[key]; if (!e || key === "GUAA") return null;
    const r = e.rep, L = r.length, cods = new Set();
    for (let f = 0; f < 3; f++) for (let i = 0; i < L; i++) { const st = f + 3 * i; cods.add([0, 1, 2].map((d) => r[(st + d) % L]).join("")); }
    const codons = [...cods];
    return { codons, aas: [...new Set(codons.map((c) => CODE[c]))] };
  }
  function solve() {
    const cand = {};
    S.sets.forEach(({ codons, aas }) => codons.forEach((c) => {
      cand[c] = cand[c] ? new Set([...cand[c]].filter((a) => aas.includes(a))) : new Set(aas);
    }));
    let ch = true, guard = 0;
    while (ch && guard++ < 50) {
      ch = false;
      S.sets.forEach(({ codons, aas }) => {
        if (codons.length !== aas.length) return;
        codons.forEach((c) => {
          if (cand[c].size !== 1) return;
          const a = [...cand[c]][0];
          codons.forEach((d) => { if (d !== c && cand[d].size > 1 && cand[d].has(a)) { cand[d].delete(a); ch = true; } });
        });
        aas.forEach((a) => {
          const hold = codons.filter((c) => cand[c].has(a));
          if (hold.length === 1 && cand[hold[0]].size > 1) { cand[hold[0]] = new Set([a]); ch = true; }
        });
      });
    }
    return cand;
  }
  function addExp(key) {
    const id = key === "BIND" ? "B" + S.bind : key;
    S.cur = key;
    if (S.done.has(id)) return;
    S.done.add(id);
    const i = info(key); if (i) S.sets.push(i);
  }
  const { ctx, size } = fit(cv, () => draw());
  function box(x, y, s, ch, fill, col) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, s - 1, s - 1);
    ctx.fillStyle = col || C.ink; ctx.font = `${Math.round(s * 0.6)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x + s / 2, y + s / 2 + 1); ctx.textBaseline = "alphabetic";
  }
  const BC = { U: "#f3e3c0", C: "#d8e6f3", A: "#dcefd6", G: "#efd9e6" };
  function head(t1, t2) {
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t1, 14, 20);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(t2, size.w - 14, 20);
  }
  function result(lines, y) {
    const { w } = size;
    ctx.fillStyle = "#f1f2ec"; ctx.fillRect(10, y, w - 20, lines.length * 18 + 10);
    lines.forEach(([t, col, bold], i) => {
      ctx.fillStyle = col || C.ink; ctx.font = `${bold ? "600 " : ""}12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t, 18, y + 19 + i * 18);
    });
  }
  function drawRepeat(w, h, key) {
    const e = EXP[key], r = e.rep, x0 = 52, s = Math.min(19, Math.floor((w - x0 - 14) / 24)), n = Math.floor((w - x0 - 14) / s);
    head(`${e.name} 넣기`, e.who);
    const seq = Array.from({ length: n }, (_, i) => r[i % r.length]).join("");
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("5′ mRNA", x0 - 4, 48);
    [...seq].forEach((b, i) => box(x0 + i * s, 35, s, b, BC[b]));
    const fy = [72, 100, 128];
    for (let f = 0; f < 3; f++) {
      const y = fy[f];
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`틀 ${f + 1}`, x0 - 4, y + 15);
      for (let i = f; i + 3 <= n; i += 3) {
        const c = seq.slice(i, i + 3), x = x0 + i * s;
        ctx.fillStyle = "#eef3ea"; ctx.fillRect(x + 1, y + 1, 3 * s - 3, 20);
        ctx.strokeStyle = C.leaf; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, 3 * s - 4, 19);
        ctx.fillStyle = C.ink2; ctx.font = `${s > 16 ? 11 : 9.5}px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(c, x + 1.5 * s, y + 15);
      }
    }
    const inf = info(key), lines = [["관찰 결과 (실제 실험)", C.forest, true], [e.res, C.ink]];
    if (inf) lines.push([`→ 코돈 {${inf.codons.join(", ")}} ↔ {${inf.aas.join(", ")}}`, "#7a5208"]);
    if (inf && inf.codons.length > 1) lines.push(["리보솜이 아무 데서나 읽기 시작하므로 어느 코돈이 어느 아미노산인지는 아직 모릅니다.", C.ink3]);
    if (key === "GUAA") lines.push(["→ 어느 틀로 읽어도 GUA, AGU, AAG, UAA가 모두 나오고, 그중 하나가 사슬을 끊습니다.", "#7a5208"], ["   네 코돈을 하나씩 시험하면 종결 코돈을 찾을 수 있습니다.", C.ink3]);
    result(lines, 162);
  }
  function drawRandom(w, h) {
    const p = S.pu, q = 1 - p;
    head(`무작위 U·C 공중합체 (U ${Math.round(p * 100)}%)`, "니런버그·오초아 연구실 (1961~62)");
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const x0 = 52, s = Math.min(19, Math.floor((w - x0 - 14) / 24)), n = Math.floor((w - x0 - 14) / s);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("5′ mRNA", x0 - 4, 48);
    for (let i = 0; i < n; i++) { const b = rnd() < p ? "U" : "C"; box(x0 + i * s, 35, s, b, BC[b]); }
    const fr = { Phe: 0, Ser: 0, Leu: 0, Pro: 0 };
    ALL.filter((c) => !/[AG]/.test(c)).forEach((c) => { let pr = 1; for (const b of c) pr *= b === "U" ? p : q; fr[CODE[c]] += pr; });
    const keys = Object.keys(fr), gx0 = 60, gx1 = w - 60, gy = 84, bh = 18;
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("사슬에 들어가는 아미노산 비율 (실제 암호표로 계산한 기댓값)", gx0, gy - 6);
    keys.forEach((k, i) => {
      const y = gy + i * (bh + 6);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(k, gx0 - 6, y + 13);
      ctx.fillStyle = "#e9ebe4"; ctx.fillRect(gx0, y, gx1 - gx0, bh);
      ctx.fillStyle = C.leaf; ctx.fillRect(gx0, y, (gx1 - gx0) * fr[k], bh);
      ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(`${(fr[k] * 100).toFixed(1)}%`, gx0 + (gx1 - gx0) * fr[k] + 5, y + 13);
    });
    const r = (a, b) => (a / b).toFixed(2);
    result([
      ["무엇을 알 수 있나", C.forest, true],
      [`U 2개 + C 1개 삼중자의 확률 p²q = ${(p * p * q).toFixed(3)} 이 3가지, UUU는 p³ = ${(p ** 3).toFixed(3)}`, C.ink],
      [`Ser·Leu 유입이 p²q 쪽 크기를 따르면 그 코돈에는 U가 2개 들어 있다고 추론합니다. (Pro/Phe = ${r(fr.Pro, fr.Phe)})`, C.ink2],
      ["조성(U 몇 개, C 몇 개)만 알려 주고 순서는 알려 주지 않으므로 표에는 기록하지 않습니다.", C.ink3],
    ], 84 + 4 * 24 + 4);
  }
  function drawBind(w, h) {
    const c = S.bind, a = CODE[c], stop = a === "종결";
    head(`삼중자 ${c} 결합 실험`, "니런버그·레더 (1964)");
    const cx = w * 0.32, cy = h * 0.42;
    ctx.fillStyle = "rgba(93,93,97,.08)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy - 22, 92, 40, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy + 46, 110, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("리보솜", cx + 76, cy + 72);
    const s = 22, bx = cx - 1.5 * s, by = cy + 22;
    [...c].forEach((b, i) => box(bx + i * s, by, s, b, BC[b]));
    if (!stop) {
      const anti = [...c].reverse().map((b) => ({ U: "A", A: "U", G: "C", C: "G" })[b]).join("");
      ctx.strokeStyle = "#7a5aa6"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, by - 26); ctx.lineTo(cx, cy - 60); ctx.stroke();
      [...anti].reverse().forEach((b, i) => box(bx + i * s, by - 24, s, b, "#ece5f5", "#7a5aa6"));
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(cx, cy - 70, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.mono}`; ctx.fillText(a, cx, cy - 66);
    } else {
      ctx.fillStyle = C.warn; ctx.font = `12px ${F.sans}`; ctx.fillText("붙는 아미노아실-tRNA 없음", cx, cy - 30);
    }
    const tx = w * 0.62;
    ctx.fillStyle = C.ink2; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "left";
    ["1. 삼중자 + 리보솜 + 방사성 표지", "   아미노아실-tRNA 20종 섞기", "2. 니트로셀룰로스 필터로 거르기", "3. 리보솜에 붙은 tRNA만 남음", "4. 필터에 남은 방사능의 종류 확인"].forEach((t, i) => ctx.fillText(t, tx, 56 + i * 18));
    result([
      ["관찰 결과", C.forest, true],
      [stop ? `필터에 남는 아미노산이 없음 → ${c}는 종결 코돈 후보` : `필터에 ${a}-tRNA가 남음 → ${c} = ${a}`, stop ? C.warn : C.ink],
    ], h - 62);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = S.cur;
    if (!k) {
      ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("아래에서 실험을 골라 인공 mRNA를 세포 밖 번역계에 넣어 보세요.", w / 2, h / 2 - 8);
      ctx.fillText("결과가 쌓이면 아래 암호표가 채워집니다.", w / 2, h / 2 + 14);
      return;
    }
    if (k === "RUC") drawRandom(w, h); else if (k === "BIND") drawBind(w, h); else drawRepeat(w, h, k);
  }
  function table() {
    const cand = solve(); let nk = 0, nc = 0, html = "";
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      html += "<div>";
      for (let k = 0; k < 4; k++) {
        const c = B[i] + B[j] + B[k], s = cand[c];
        let t = `${c} ·`, cls = "";
        if (s && s.size === 1) { const a = [...s][0]; t = `${c} ${a}`; cls = a === "종결" ? "s" : "k"; nk++; }
        else if (s && s.size > 1) { t = `${c} ${[...s].join("/")}?`; cls = "c"; nc++; }
        html += `<span class="${cls}">${t}</span>`;
      }
      html += "</div>";
    }
    $(".cb-tbl").innerHTML = html; $(".n-k").textContent = nk; $(".n-c").textContent = nc;
  }
  function update() {
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.x === S.cur)));
    $(".cb-rand").hidden = S.cur !== "RUC"; $(".cb-bind").hidden = S.cur !== "BIND";
    $(".pu-out").textContent = S.pu.toFixed(2);
    table(); draw();
  }
  $(".cod").innerHTML = ALL.map((c) => `<option value="${c}"${c === S.bind ? " selected" : ""}>${c}</option>`).join("");
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { addExp(b.dataset.x); update(); }));
  $(".cod").addEventListener("change", (e) => { S.bind = e.target.value; addExp("BIND"); update(); });
  $(".pu").addEventListener("input", (e) => { S.pu = +e.target.value; update(); });
  $(".cb-clear").addEventListener("click", () => { S.sets = []; S.done.clear(); S.cur = null; update(); });
  if (/[?&]demo/.test(location.search)) { ["U", "UC", "UUC", "UAUC"].forEach(addExp); S.bind = "UCU"; $(".cod").value = "UCU"; addExp("BIND"); S.cur = "UUC"; }
  update();
})();
