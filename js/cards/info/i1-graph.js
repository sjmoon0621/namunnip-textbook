/* 카드: 같은 그래프를 인접 행렬과 인접 리스트로 저장하면 무엇이 다를까? */
(() => {
  const root = document.getElementById("card-info-graphrep");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { arrow, paint } = I1;

  let n = 6, directed = false, E = new Set(), sel = -1;
  const k = (u, v) => u * 16 + v;
  const has = (u, v) => E.has(k(u, v));
  function toggle(u, v) {
    if (u === v) return;
    const on = !has(u, v);
    const set = (a, b) => (on ? E.add(k(a, b)) : E.delete(k(a, b)));
    set(u, v); if (!directed) set(v, u);
    upd();
  }
  const PRE = {
    sample: (m) => [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [1, 2]].filter(([a, b]) => a < m && b < m),
    cycle: (m) => Array.from({ length: m }, (_, i) => [i, (i + 1) % m]),
    full: (m) => { const r = []; for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) r.push([i, j]); return r; },
    tree: (m) => Array.from({ length: m - 1 }, (_, i) => [Math.floor(i / 2), i + 1]),
    none: () => [],
  };
  function preset(name) {
    E = new Set(); sel = -1;
    PRE[name](n).forEach(([a, b]) => { E.add(k(a, b)); if (!directed) E.add(k(b, a)); });
    upd();
  }

  const view = fit($("canvas"), () => draw());
  const pos = () => {
    const { w, h } = view.size, R = Math.min(w, h) * 0.36;
    return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [w / 2 + R * Math.cos(a), h / 2 + R * Math.sin(a)]; });
  };

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = pos(), r = Math.max(11, Math.min(16, w * 0.045));
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) {
      if (!has(u, v)) continue;
      if (!directed && v < u) continue;
      const [x0, y0] = P[u], [x1, y1] = P[v];
      const d = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / d, uy = (y1 - y0) / d;
      const hot = sel === u || (!directed && sel === v);
      const col = hot ? C.forest : C.ink2;
      if (directed) {
        const both = has(v, u), off = both ? 5 : 0, nx = -uy * off, ny = ux * off;
        arrow(ctx, x0 + ux * r + nx, y0 + uy * r + ny, x1 - ux * (r + 2) + nx, y1 - uy * (r + 2) + ny, col);
      } else {
        ctx.strokeStyle = col; ctx.lineWidth = hot ? 2.2 : 1.4;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
    }
    P.forEach(([x, y], i) => {
      ctx.fillStyle = i === sel ? "#dcebd6" : "#fff"; ctx.strokeStyle = i === sel ? C.forest : C.ink; ctx.lineWidth = i === sel ? 2.2 : 1.3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(r * 0.9)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(i), x, y + 1); ctx.textBaseline = "alphabetic";
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(sel < 0 ? "정점 두 개를 차례로 누르면 간선이 생기거나 지워집니다" : `정점 ${sel} 선택됨 — 이을 정점을 누르세요`, 6, h - 6);
  }

  function matrix() {
    let html = '<table><thead><tr><th></th>' + Array.from({ length: n }, (_, j) => `<th>${j}</th>`).join("") + "</tr></thead><tbody>";
    for (let i = 0; i < n; i++) {
      html += `<tr><th>${i}</th>`;
      for (let j = 0; j < n; j++) {
        const on = has(i, j), hl = i === sel ? " row" : "";
        html += `<td><button type="button" class="mc${on ? " on" : ""}${hl}" data-i="${i}" data-j="${j}" ${i === j ? "disabled" : ""} aria-label="${i}에서 ${j}로 간선">${on ? 1 : 0}</button></td>`;
      }
      html += "</tr>";
    }
    $(".mat").innerHTML = html + "</tbody></table>";
    $(".mat").querySelectorAll(".mc").forEach((b) => b.addEventListener("click", () => toggle(+b.dataset.i, +b.dataset.j)));
  }

  function listing() {
    const rows = [];
    rows.push(`n = ${n}`);
    rows.push("# 인접 행렬: adj[u][v] == 1 이면 u에서 v로 간선");
    for (let i = 0; i < n; i++) rows.push(`${i ? "       " : "adj = ["}[${Array.from({ length: n }, (_, j) => (has(i, j) ? 1 : 0)).join(", ")}]${i === n - 1 ? "]" : ","}`);
    rows.push("");
    rows.push("# 인접 리스트: graph[u]는 u의 이웃 목록");
    rows.push("graph = [[] for _ in range(n)]");
    rows.push(directed ? "# for u, v in edges: graph[u].append(v)" : "# for u, v in edges: graph[u].append(v); graph[v].append(u)");
    for (let i = 0; i < n; i++) {
      const nb = []; for (let j = 0; j < n; j++) if (has(i, j)) nb.push(j);
      rows.push(`${i ? "         " : "graph = ["}[${nb.join(", ")}]${i === n - 1 ? "]" : ","}${i === sel ? "   # ←" : ""}`);
    }
    $(".code").innerHTML = rows.map((l) => `<span class="ln">${paint(l) || " "}</span>`).join("");
  }

  function upd() {
    draw(); matrix(); listing();
    let m = 0; for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (has(u, v) && (directed || u < v)) m++;
    $(".r-m").textContent = m;
    $(".r-mat").textContent = n * n;
    $(".r-list").textContent = directed ? m : 2 * m;
    if (sel >= 0) {
      let deg = 0; for (let v = 0; v < n; v++) if (has(sel, v)) deg++;
      $(".r-nb").textContent = `${n}칸 / ${deg}개`;
    } else $(".r-nb").textContent = "—";
  }

  $("canvas").addEventListener("click", (e) => {
    const rc = $("canvas").getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
    const P = pos(), r = Math.max(11, Math.min(16, view.size.w * 0.045)) + 6;
    const hit = P.findIndex(([px, py]) => Math.hypot(px - x, py - y) < r);
    if (hit < 0) { sel = -1; upd(); return; }
    if (sel < 0 || sel === hit) { sel = sel === hit ? -1 : hit; upd(); return; }
    const u = sel; sel = hit; toggle(u, hit);
  });
  $(".nv").addEventListener("input", () => {
    n = +$(".nv").value; $(".nv-out").textContent = n;
    E = new Set([...E].filter((q) => Math.floor(q / 16) < n && q % 16 < n)); sel = -1; upd();
  });
  $(".dir").addEventListener("change", () => {
    directed = $(".dir").checked;
    if (!directed) [...E].forEach((q) => E.add(k(q % 16, Math.floor(q / 16))));
    upd();
  });
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => preset(b.dataset.p)));
  preset("sample");
  if (I1.demo) { sel = 3; upd(); }
})();
