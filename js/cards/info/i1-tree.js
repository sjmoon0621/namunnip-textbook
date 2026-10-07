/* 카드: 이진 트리를 리스트 하나에 담을 수 있을까? — 배열(인덱스) 표현과 자식 목록(인접 리스트) 표현 */
(() => {
  const root = document.getElementById("card-info-treerep");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { paint, fitText } = I1;
  const MAXI = 30;

  let T = new Map(), sel = -1, nextL = 0;
  const LET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const PRE = {
    full: () => ["A", "B", "C", "D", "E", "F", "G"].map((v, i) => [i, v]),
    skew: () => [[0, "A"], [2, "B"], [6, "C"], [14, "D"], [30, "E"]],
    expr: () => [[0, "*"], [1, "+"], [2, "2"], [3, "3"], [4, "4"]],
    some: () => [[0, "A"], [1, "B"], [2, "C"], [4, "D"], [5, "E"], [9, "F"]],
  };
  function preset(p) { T = new Map(PRE[p]()); sel = -1; nextL = 0; upd(); }
  const label = () => { while ([...T.values()].includes(LET[nextL % 26])) nextL++; return LET[nextL++ % 26]; };

  const lev = (i) => Math.floor(Math.log2(i + 1));
  const tv = fit($(".cv-tree"), () => drawTree());
  const av = fit($(".cv-arr"), () => drawArr());
  let geo = null;

  function xy(i, w, top, dy) {
    const L = lev(i), p = i - (2 ** L - 1);
    return [(p + 0.5) / 2 ** L * w, top + L * dy];
  }
  function drawTree() {
    const { ctx } = tv, { w, h } = tv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const dy = (h - 36) / 4.3, top = 22, r = Math.max(8, Math.min(13, w / 40));
    geo = { w, top, dy, r };
    /* 간선 */
    T.forEach((_, i) => {
      if (!i) return;
      const p = Math.floor((i - 1) / 2);
      const [x0, y0] = xy(p, w, top, dy), [x1, y1] = xy(i, w, top, dy);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    });
    /* 빈 자식 자리(점선) */
    T.forEach((_, i) => [2 * i + 1, 2 * i + 2].forEach((c) => {
      if (c > MAXI || T.has(c)) return;
      const [x0, y0] = xy(i, w, top, dy), [x1, y1] = xy(c, w, top, dy);
      ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.beginPath(); ctx.arc(x1, y1, r * 0.75, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `${Math.round(r * 0.9)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+", x1, y1 + 1); ctx.textBaseline = "alphabetic";
    }));
    const fam = sel >= 0 ? new Set([Math.floor((sel - 1) / 2), 2 * sel + 1, 2 * sel + 2]) : new Set();
    T.forEach((v, i) => {
      const [x, y] = xy(i, w, top, dy);
      ctx.fillStyle = i === sel ? "#dcebd6" : fam.has(i) && sel > -1 ? "#fdf3dc" : "#fff";
      ctx.strokeStyle = i === sel ? C.forest : C.ink; ctx.lineWidth = i === sel ? 2.2 : 1.3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(r * 0.95)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(v, x, y + 1); ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.fillText(String(i), x + r + 5, y - r + 2);
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("+ 자리를 누르면 노드 추가, 노드를 누르면 선택 (작은 수 = 배열 인덱스)", 6, h - 6);
  }

  function drawArr() {
    const { ctx } = av, { w, h } = av.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const last = T.size ? Math.max(...T.keys()) : -1, len = last + 1;
    const per = 16, cw = Math.min(32, (w - 16) / per);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`배열 표현: 길이 ${len}, 빈 칸(None) ${len - T.size}개`, 8, 13);
    const fam = sel >= 0 ? { p: Math.floor((sel - 1) / 2), l: 2 * sel + 1, r: 2 * sel + 2 } : null;
    for (let i = 0; i < len; i++) {
      const x = 8 + (i % per) * cw, y = 22 + Math.floor(i / per) * (cw + 16);
      const v = T.get(i);
      let fill = v ? "#fff" : C.paper;
      if (i === sel) fill = "#dcebd6"; else if (fam && sel > 0 && i === fam.p) fill = "#fdf3dc"; else if (fam && (i === fam.l || i === fam.r)) fill = "#fdf3dc";
      ctx.fillStyle = fill; ctx.fillRect(x, y, cw - 2, cw - 2);
      ctx.strokeStyle = v ? C.ink2 : C.rule; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, cw - 3, cw - 3);
      ctx.textAlign = "center";
      if (v) { ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(cw * 0.42)}px ${F.mono}`; ctx.fillText(v, x + cw / 2 - 1, y + cw * 0.62); }
      else { ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x + 3, y + cw - 5); ctx.lineTo(x + cw - 5, y + 3); ctx.stroke(); }
      ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.fillText(String(i), x + cw / 2 - 1, y + cw + 9);
    }
  }

  function listing() {
    const last = T.size ? Math.max(...T.keys()) : -1;
    const q = (v) => (v === undefined ? "None" : `'${v}'`);
    const arr = Array.from({ length: last + 1 }, (_, i) => q(T.get(i)));
    const lines = ["# 배열 표현: i번 노드의 자식은 2*i+1, 2*i+2, 부모는 (i-1)//2"];
    let line = "tree = [";
    arr.forEach((s, i) => { const add = s + (i < arr.length - 1 ? ", " : "]"); if ((line + add).length > 58) { lines.push(line); line = "        "; } line += add; });
    if (!arr.length) line += "]";
    lines.push(line, "", "# 자식 목록 표현 (인접 리스트): 노드 → [왼쪽 자식, 오른쪽 자식]");
    const keys = [...T.keys()].sort((a, b) => a - b);
    keys.forEach((i, k) => {
      const v = T.get(i);
      lines.push(`${k ? "            " : "children = {"}'${v}': [${q(T.get(2 * i + 1))}, ${q(T.get(2 * i + 2))}]${k === keys.length - 1 ? "}" : ","}`);
    });
    if (!keys.length) lines.push("children = {}");
    $(".code").innerHTML = lines.map((l) => `<span class="ln">${paint(l) || " "}</span>`).join("");
  }

  function height() { let hmax = -1; T.forEach((_, i) => { hmax = Math.max(hmax, lev(i)); }); return hmax; }
  function upd() {
    drawTree(); drawArr(); listing();
    const last = T.size ? Math.max(...T.keys()) : -1;
    $(".r-n").textContent = T.size;
    $(".r-h").textContent = height() < 0 ? "—" : height();
    $(".r-len").textContent = last + 1;
    $(".r-use").textContent = last < 0 ? "—" : `${Math.round(100 * T.size / (last + 1))} %`;
    if (sel >= 0) {
      const p = sel ? Math.floor((sel - 1) / 2) : null;
      $(".sel-info").textContent = `선택: '${T.get(sel)}' (인덱스 ${sel}) · 부모 ${p === null ? "없음(루트)" : `(${sel}−1)//2 = ${p}`} · 왼쪽 자식 2·${sel}+1 = ${2 * sel + 1} · 오른쪽 자식 2·${sel}+2 = ${2 * sel + 2}`;
    } else $(".sel-info").textContent = "노드를 누르면 부모·자식의 인덱스 계산을 보여 줍니다.";
    $(".del").disabled = sel < 0;
  }

  $(".cv-tree").addEventListener("click", (e) => {
    if (!geo) return;
    const rc = $(".cv-tree").getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
    const near = (i) => { const [px, py] = xy(i, geo.w, geo.top, geo.dy); return Math.hypot(px - x, py - y) < geo.r + 5; };
    for (const i of T.keys()) if (near(i)) { sel = sel === i ? -1 : i; upd(); return; }
    for (const i of [...T.keys()]) for (const c of [2 * i + 1, 2 * i + 2]) {
      if (c <= MAXI && !T.has(c) && near(c)) { T.set(c, label()); sel = c; upd(); return; }
    }
    sel = -1; upd();
  });
  $(".del").addEventListener("click", () => {
    if (sel < 0) return;
    if (sel === 0) { T = new Map([[0, "A"]]); nextL = 1; sel = -1; upd(); return; }
    const stack = [sel];
    while (stack.length) { const i = stack.pop(); if (T.delete(i)) stack.push(2 * i + 1, 2 * i + 2); }
    sel = -1; upd();
  });
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => preset(b.dataset.p)));
  preset("some");
  if (I1.demo) { sel = 4; upd(); }
})();
