/* 카드: DNA 서열의 차이로 계통수를 그릴 수 있을까? — 정렬, 거리 행렬, 단계별 UPGMA, 서열 길이와 신뢰도 */
(() => {
  const root = document.getElementById("card-bio-seq-tree");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const demo = /[?&]demo\b/.test(location.search);

  /* 교육용 가상 서열: 계통수의 각 가지에 서로 다른 자리의 변이를 넣어 만들었다. [이름, 줄임, 서열] */
  const DATA = {
    dna: [
      ["사람", "사", "ATGGCTCTAGCGCAAGTTCCGGAGGCCATCCATGAACTGAAAGCTTCA"],
      ["침팬지", "침", "ATGGCTCTAGCGCAAGTTCCGGAGGCCATCTATGAACTGAAGGCTTCA"],
      ["고릴라", "고", "ATGGCTCTAGCGCAAGTTCCGGAGGCTATCCATGGACTGAAGGCTTCA"],
      ["오랑우탄", "오", "ATGGCTCTAGCGCGAGTTCCAGAAGCTATCCATGAACTGACGGCTTCA"],
      ["붉은털원숭이", "붉", "ACGGCCCTAACGCAAGATCCAGAGGCTGTCCGTGAACTAAAGGCATCA"],
      ["생쥐", "쥐", "GTGACTCAAATGCAGGTTGCAAAGGTTATGCGTAAATTGCAGACTCCC"],
    ],
    pro: [
      ["사람", "사", "GDVEKGKKIFVQKCAKCHTDEKGGKHKTGPNL"],
      ["붉은털원숭이", "붉", "GDVEKGKKIFVQKCAKCHTDEKPGKHKTGPNL"],
      ["개", "개", "GDVEKGKKRFVQKCAQCHTDEKGGKHKHGPNL"],
      ["닭", "닭", "GDVEWGKKIFVQKCAQCHTVEKGGKHKTGQNL"],
      ["효모", "효", "FDREKGNKIFKQCCHQCCTVEFGGIHNTGPNK"],
    ],
  };
  let set = "dna", len = 0, ref = 0, step = 0, run = null;
  const taxa = () => DATA[set];
  const used = () => len || taxa()[0][2].length;
  const diff = (a, b) => { let n = 0; for (let i = 0; i < used(); i++) if (a[i] !== b[i]) n++; return n; };
  const fmt = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(1));

  /* UPGMA 전체 과정을 미리 계산: states[k] = k번 묶은 뒤의 무리와 행렬, merges[k] = k+1번째 묶음 */
  function upgma() {
    const t = taxa();
    let cl = t.map((x, i) => ({ id: i, leaves: [i], name: x[1], d: 0, kids: null }));
    let D = t.map((a) => t.map((b) => diff(a[2], b[2])));
    const states = [], merges = [];
    while (cl.length > 1) {
      let best = Infinity, bi = 0, bj = 1, ties = 0;
      for (let i = 0; i < cl.length; i++) for (let j = 0; j < i; j++) {
        if (D[i][j] < best - 1e-9) { best = D[i][j]; bi = i; bj = j; ties = 1; } else if (Math.abs(D[i][j] - best) < 1e-9) ties++;
      }
      states.push({ cl, D, bi, bj, ties });
      const a = cl[bi], b = cl[bj], na = a.leaves.length, nb = b.leaves.length;
      const node = { id: t.length + merges.length, leaves: [...b.leaves, ...a.leaves], name: b.name + a.name, d: best, kids: [b, a] };
      merges.push(node);
      const keep = cl.map((_, i) => i).filter((i) => i !== bi && i !== bj);
      const nD = keep.map((i) => keep.map((j) => D[i][j]));
      const row = keep.map((k) => (na * D[bi][k] + nb * D[bj][k]) / (na + nb));
      nD.forEach((r, i) => r.push(row[i])); nD.push([...row, 0]);
      cl = [...keep.map((i) => cl[i]), node]; D = nD;
    }
    states.push({ cl, D, bi: -1, bj: -1, ties: 0 });
    const order = []; const walk = (n) => (n.kids ? n.kids.forEach(walk) : order.push(n.id)); walk(cl[0]);
    merges.forEach((m) => { m.name = m.leaves.slice().sort((x, y) => order.indexOf(x) - order.indexOf(y)).map((i) => t[i][1]).join(""); });
    return { states, merges, order, top: cl[0] };
  }

  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w || !run) return;
    ctx.clearRect(0, 0, w, h);
    const t = taxa(), n = t.length, top = 12, bot = h - 34, x0 = 18, leafX = w - 96;
    const dmax = Math.max(1, run.top.d);
    const X = (d) => leafX - (d / dmax) * (leafX - x0);
    const rowH = (bot - top) / n, Yl = {};
    run.order.forEach((id, i) => { Yl[id] = top + (i + 0.5) * rowH; });
    const ticks = []; const stepT = dmax > 12 ? 5 : dmax > 5 ? 2 : 1;
    for (let v = 0; v <= dmax + 1e-9; v += stepT) ticks.push([v, String(v)]);
    axes(ctx, { x0, y0: top, w: leafX - x0, h: bot - top, X, Y: () => 0, xt: ticks, xlabel: "← 평균 차이 수 (클수록 오래전에 갈라짐)" });
    const pos = (nd) => (nd.kids ? { x: X(nd.d), y: (pos(nd.kids[0]).y + pos(nd.kids[1]).y) / 2 } : { x: leafX, y: Yl[nd.id] });
    const fresh = step > 0 ? run.merges[step - 1] : null;
    ctx.lineCap = "round";
    const drawNode = (nd) => {
      if (!nd.kids) return;
      const p = pos(nd), hot = nd === fresh;
      ctx.strokeStyle = hot ? C.amber : C.forest; ctx.lineWidth = hot ? 3 : 2;
      nd.kids.forEach((k) => { const q = pos(k); ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, q.y); ctx.lineTo(p.x, p.y); ctx.stroke(); drawNode(k); });
    };
    const now = run.states[step].cl;
    now.forEach(drawNode);
    now.forEach((c) => { if (!c.kids) { ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(leafX - 10, Yl[c.id]); ctx.lineTo(leafX, Yl[c.id]); ctx.stroke(); } });
    if (now.length > 1) {
      const s = run.states[step], nx = [s.cl[s.bi], s.cl[s.bj]];
      ctx.fillStyle = "rgba(59,124,42,.12)";
      nx.forEach((c) => c.leaves.forEach((id) => { ctx.fillRect(leafX + 2, Yl[id] - rowH / 2 + 2, w - leafX - 4, rowH - 4); }));
    }
    for (let i = 0; i < n; i++) {
      const y = Yl[i], inFresh = fresh && fresh.leaves.includes(i);
      ctx.fillStyle = inFresh ? C.amber : C.forest; ctx.beginPath(); ctx.arc(leafX, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `${inFresh ? 700 : 500} 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t[i][0], leafX + 8, y + 4);
    }
    if (fresh) {
      const p = pos(fresh), lab = fmt(fresh.d);
      ctx.font = `600 11px ${F.mono}`; const tw = ctx.measureText(lab).width;
      const lx = p.x - tw - 6 >= 2 ? p.x - tw - 6 : p.x + 6;
      ctx.fillStyle = C.card; ctx.fillRect(lx - 2, p.y - 8, tw + 4, 14);
      ctx.fillStyle = C.amber; ctx.textAlign = "left"; ctx.fillText(lab, lx, p.y + 3);
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    if (step === 0) ctx.fillText("아직 묶인 무리가 없습니다", x0 + 4, top + 12);
  }

  function aln() {
    const t = taxa(), r = t[ref][2], u = used();
    $(".aln").innerHTML = t.map((x, i) => {
      const s = [...x[2]].map((c, j) => `<i class="${j >= u ? "x" : i !== ref && c !== r[j] ? "d" : ""}">${c}</i>`).join("");
      return `<div class="row${i === ref ? " ref" : ""}" data-r="${i}" title="${x[0]}"><span class="nm">${x[0]}(${x[1]})</span><span class="sq">${s}</span><span class="dd">${i === ref ? "기준" : diff(x[2], r)}</span></div>`;
    }).join("");
  }
  function matrix() {
    const s = run.states[step], cl = s.cl;
    if (cl.length < 2) { $(".mat").innerHTML = `<p class="mono small dim">행렬이 한 무리로 줄었습니다: ${cl[0].name}</p>`; return; }
    const best = s.D[s.bi][s.bj];
    let html = `<table><thead><tr><th></th>${cl.slice(0, -1).map((c) => `<th>${c.name}</th>`).join("")}</tr></thead><tbody>`;
    for (let i = 1; i < cl.length; i++) {
      html += `<tr><th>${cl[i].name}</th>`;
      for (let j = 0; j < cl.length - 1; j++) {
        if (j >= i) { html += "<td></td>"; continue; }
        const v = s.D[i][j], cls = i === s.bi && j === s.bj ? "min" : Math.abs(v - best) < 1e-9 ? "tie" : "";
        html += `<td class="${cls}">${fmt(v)}</td>`;
      }
      html += "</tr>";
    }
    $(".mat").innerHTML = html + "</tbody></table>";
  }
  const newick = (nd) => (nd.kids ? `(${newick(nd.kids[0])}, ${newick(nd.kids[1])})` : taxa()[nd.id][1]);
  function update(rebuild) {
    if (rebuild) { run = upgma(); step = Math.min(step, run.merges.length); }
    aln(); matrix();
    const total = run.merges.length, s = run.states[step], fresh = step ? run.merges[step - 1] : null;
    $(".n-step").textContent = `${step} / ${total}`;
    $(".n-pair").textContent = fresh ? `${fresh.kids[0].name} + ${fresh.kids[1].name}` : "—";
    $(".n-d").textContent = fresh ? fmt(fresh.d) : "—";
    $(".join").disabled = $(".all").disabled = step >= total;
    const zero = run.merges.slice(0, step).some((m) => m.d === 0);
    const v = $(".verdict"); let msg = "", cls = "";
    if (step >= total) {
      msg = `완성: ${newick(run.top)}. ` + (zero ? "차이가 0인 채로 묶인 무리가 있습니다. 이 길이로는 그 생물들을 구별할 근거가 없어 묶은 순서가 우연히 정해졌습니다. 서열을 더 길게 비교해야 합니다." : set === "dna" ? "사람과 침팬지가 가장 먼저 묶이고, 고릴라, 오랑우탄, 붉은털원숭이, 생쥐 순으로 붙습니다. 형태와 화석으로 얻은 영장류 계통과 같은 순서입니다." : "포유류끼리 먼저 묶이고 닭, 효모 순으로 붙습니다. 효모는 동물이 아닌 균류라서 가장 바깥에 놓입니다.");
      cls = zero ? "bad" : "good";
    } else if (s.ties > 1) { msg = `가장 작은 값(${fmt(s.D[s.bi][s.bj])})이 ${s.ties}칸입니다. 어느 쌍을 먼저 묶을지 자료가 정해 주지 못합니다(동점).`; cls = "bad"; }
    else if (step === 0) msg = "초록 칸이 표에서 가장 작은 거리입니다. 이 둘이 가장 최근에 갈라진 친척입니다.";
    else msg = `두 무리(${fresh.kids[0].name}, ${fresh.kids[1].name})를 묶고, 다른 무리와의 거리를 평균으로 바꾸어 표가 한 줄 줄었습니다.`;
    v.textContent = msg; v.className = "verdict small " + cls;
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.d === set)));
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.l === len)));
    draw();
  }
  root.addEventListener("click", (e) => {
    const row = e.target.closest("[data-r]");
    if (row) { ref = +row.dataset.r; aln(); return; }
    const b = e.target.closest("button"); if (!b || b.classList.contains("opt")) return;
    if (b.dataset.d) { set = b.dataset.d; ref = 0; step = 0; update(true); }
    else if (b.dataset.l) { len = +b.dataset.l; step = 0; update(true); }
    else if (b.classList.contains("join")) { if (step < run.merges.length) step++; update(); }
    else if (b.classList.contains("all")) { step = run.merges.length; update(); }
    else if (b.classList.contains("reset")) { step = 0; update(); }
  });
  run = upgma();
  if (demo) step = 3;
  update();
})();
