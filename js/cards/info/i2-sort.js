/* 카드: 반으로 나눠 정렬하면 왜 빨라질까? — 합병 정렬·퀵 정렬의 재귀 트리와 비교 횟수 */
(() => {
  const root = document.getElementById("card-info-sort");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const MERGE = [
    "def merge_sort(a):",
    "    if len(a) <= 1:",
    "        return a",
    "    mid = len(a) // 2",
    "    left = merge_sort(a[:mid])",
    "    right = merge_sort(a[mid:])",
    "    return merge(left, right)",
    "",
    "def merge(left, right):",
    "    out, i, j = [], 0, 0",
    "    while i < len(left) and j < len(right):",
    "        if left[i] <= right[j]:",
    "            out.append(left[i])",
    "            i += 1",
    "        else:",
    "            out.append(right[j])",
    "            j += 1",
    "    return out + left[i:] + right[j:]",
  ];
  const QUICK = [
    "def quick_sort(a):",
    "    if len(a) <= 1:",
    "        return a",
    "    pivot = a[0]",
    "    less = [x for x in a[1:] if x < pivot]",
    "    more = [x for x in a[1:] if x >= pivot]",
    "    return quick_sort(less) + [pivot] + quick_sort(more)",
  ];
  const pre = $(".i2c");
  const sN = $(".n");
  let mode = "merge", input = "rand", seed = 11, data = [], ev = [], k = 0, cp = null, totalCmp = 0, maxDepth = 0;

  function makeData() {
    const n = +sN.value; $(".n-out").textContent = n;
    const rnd = I2.rng(seed);
    const pool = []; for (let v = 1; v <= 99; v++) pool.push(v);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    data = pool.slice(0, n);
    if (input === "sorted") data.sort((a, b) => a - b);
    if (input === "rev") data.sort((a, b) => b - a);
  }
  function build() {
    ev = []; totalCmp = 0; maxDepth = 0;
    const nodes = [];
    const add = (lo, vals, depth, kind, parent) => { const nd = { lo, vals: vals.slice(), n: vals.length, depth, kind, parent, st: "open" }; nodes.push(nd); maxDepth = Math.max(maxDepth, depth); return nd; };
    const snap = (cur, line, cmp, note) => ev.push({ upto: nodes.length, st: nodes.map((x) => [x.st, x.vals.slice()]), cur, line, cmp, note });
    if (mode === "merge") {
      const ms = (lo, a, depth, par) => {
        const nd = add(lo, a, depth, "seg", par);
        if (a.length <= 1) { nd.st = "done"; snap(nd, 2, totalCmp, `[${a}]는 원소가 하나뿐이라 이미 정렬됨`); return a; }
        snap(nd, 3, totalCmp, `[${a.join(", ")}]를 반으로 나눔`);
        const mid = a.length >> 1;
        const L = ms(lo, a.slice(0, mid), depth + 1, nd), R = ms(lo + mid, a.slice(mid), depth + 1, nd);
        const out = []; let i = 0, j = 0, c = 0;
        while (i < L.length && j < R.length) { c++; if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]); }
        const res = out.concat(L.slice(i), R.slice(j));
        totalCmp += c; nd.vals = res; nd.st = "done";
        snap(nd, 6, totalCmp, `[${L.join(", ")}] + [${R.join(", ")}] 합병: 비교 ${c}번`);
        return res;
      };
      ms(0, data, 0, null);
    } else {
      const qs = (lo, a, depth, par) => {
        const nd = add(lo, a, depth, "seg", par);
        if (a.length <= 1) { nd.st = "done"; snap(nd, 2, totalCmp, a.length ? `[${a}]는 이미 정렬됨` : "빈 리스트"); return a; }
        const p = a[0], less = a.slice(1).filter((x) => x < p), more = a.slice(1).filter((x) => x >= p);
        totalCmp += a.length - 1;
        const pv = add(lo + less.length, [p], depth + 1, "pivot", nd); pv.st = "pivot";
        snap(nd, 5, totalCmp, `피벗 ${p}: 작은 것 ${less.length}개, 크거나 같은 것 ${more.length}개로 나눔 (비교 ${a.length - 1}번)`);
        const L = less.length ? qs(lo, less, depth + 1, nd) : [], R = more.length ? qs(lo + less.length + 1, more, depth + 1, nd) : [];
        nd.vals = L.concat([p], R); nd.st = "done";
        snap(nd, 6, totalCmp, `[${nd.vals.join(", ")}] 완성`);
        return nd.vals;
      };
      qs(0, data, 0, null);
    }
    ev.unshift({ upto: 1, st: [["open", data.slice()]], cur: nodes[0], line: 0, cmp: 0, note: "정렬할 리스트" });
    ev.nodes = nodes;
    const code = mode === "merge" ? MERGE : QUICK;
    cp = I2.code(pre, code);
    k = 0; cp.set(0); show(); draw();
  }
  function step() {
    if (k >= ev.length - 1) return false;
    k++; cp.set(ev[k].line); show(); draw();
    return k < ev.length - 1;
  }
  function show() {
    const n = data.length, e = ev[k];
    $(".n-c").textContent = `${e.cmp} / ${totalCmp}`;
    $(".n-d").textContent = maxDepth;
    $(".n-s").textContent = `${n * (n - 1) / 2}`;
    $(".n-l").textContent = (n * Math.log2(n)).toFixed(0);
    $(".note").textContent = e.note;
  }

  const view = fit($(".cv-tree"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !ev.length) return;
    ctx.clearRect(0, 0, w, h);
    const n = data.length, e = ev[k], rows = maxDepth + 1;
    const cw = (w - 16) / n, rh = (h - 8) / rows, bh = Math.min(26, rh * 0.7);
    const fs = Math.min(12, cw * 0.42, bh * 0.6);
    const Y = (nd) => 4 + nd.depth * rh;
    const cx = (nd) => 8 + (nd.lo + nd.n / 2) * cw;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1.2;
    for (let i = 1; i < e.upto; i++) {
      const nd = ev.nodes[i];
      if (!nd.parent) continue;
      ctx.beginPath(); ctx.moveTo(cx(nd.parent), Y(nd.parent) + bh); ctx.lineTo(cx(nd), Y(nd)); ctx.stroke();
    }
    for (let i = 0; i < e.upto; i++) {
      const nd = ev.nodes[i], [st, vals] = e.st[i];
      const y = Y(nd), x0 = 8 + nd.lo * cw + 2, ww = vals.length * cw - 4;
      vals.forEach((v, j) => {
        const x = 8 + (nd.lo + j) * cw;
        ctx.fillStyle = st === "pivot" ? C.amber : st === "done" ? "#cfe3c5" : C.card;
        ctx.fillRect(x + 2, y, cw - 4, bh);
        ctx.fillStyle = C.ink; ctx.font = `${fs}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(v, x + cw / 2, y + bh / 2 + 1);
        if (j) { ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + .5, y + 3); ctx.lineTo(x + .5, y + bh - 3); ctx.stroke(); }
      });
      if (vals.length) {
        const isCur = nd === e.cur;
        ctx.strokeStyle = isCur ? C.warn : C.ink2; ctx.lineWidth = isCur ? 2.5 : 1;
        ctx.strokeRect(x0 + .5, y + .5, ww - 1, bh - 1);
      }
    }
    ctx.textBaseline = "alphabetic";
  }

  const run = I2.runner($(".run"), step, 380);
  const reset = () => { run.stop(); build(); };
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    reset();
  }));
  root.querySelectorAll("[data-in]").forEach((b) => b.addEventListener("click", () => {
    input = b.dataset.in; if (input === "rand") seed++;
    root.querySelectorAll("[data-in]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    makeData(); reset();
  }));
  sN.addEventListener("input", () => { makeData(); reset(); });
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);
  makeData(); build();
  if (NMLab.demo) { for (let i = 0; i < 14; i++) step(); }
})();
