/* 절 페이지의 학습 도구: 블록별 메모, 형광펜, 확인 문제 기록(오답노트), 방문 기록.
   모든 기록은 js/store.js(NMStore)에 블록 id 기준으로 저장한다. core.js와 store.js 다음에 불러온다. */
(() => {
  "use strict";
  const S = window.NMStore;
  if (!S || !document.body.dataset.sec) return;
  const blocks = [...document.querySelectorAll("main article.card[id], main section.video-block[id]")];
  const blockOf = (node) => {
    const el = node && (node.nodeType === 1 ? node : node.parentElement);
    const b = el && el.closest("article.card[id], section.video-block[id]");
    return b && blocks.includes(b) ? b : null;
  };
  const notesUrl = "../../notes.html";

  /* ───── 메모 ───── */
  blocks.filter((b) => b.matches("article.card")).forEach((b) => {
    const head = b.querySelector(".card-head");
    if (!head) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "nb-memo"; btn.textContent = "메모";
    btn.setAttribute("aria-expanded", "false");
    head.appendChild(btn);
    const panel = document.createElement("div");
    panel.className = "nb-panel"; panel.hidden = true;
    panel.innerHTML = `<label class="mono" for="nb-${b.id}">내 메모</label>
      <textarea id="nb-${b.id}" rows="3" placeholder="이해한 것, 헷갈리는 것, 다시 볼 것을 적어 두세요. 이 브라우저에 자동으로 저장됩니다."></textarea>
      <p class="nb-state mono"></p>`;
    const quiz = b.querySelector(":scope > .quiz");
    quiz ? b.insertBefore(panel, quiz) : b.appendChild(panel);
    const ta = panel.querySelector("textarea"), state = panel.querySelector(".nb-state");
    const rec = S.get(b.id);
    if (rec && rec.note) { ta.value = rec.note; open(true); }
    btn.classList.toggle("has", !!(rec && rec.note));
    state.innerHTML = `<a href="${notesUrl}">내 노트에서 모아 보기</a>`;
    function open(v) { panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); }
    btn.addEventListener("click", () => { open(panel.hidden); if (!panel.hidden) ta.focus(); });
    let t;
    ta.addEventListener("input", () => {
      clearTimeout(t);
      state.textContent = "저장 중…";
      t = setTimeout(() => {
        S.setNote(b.id, ta.value);
        btn.classList.toggle("has", !!ta.value.trim());
        state.innerHTML = S.available ? `저장됨 · <a href="${notesUrl}">내 노트에서 모아 보기</a>` : "이 브라우저에서는 저장할 수 없습니다 (사생활 보호 모드 등)";
      }, 400);
    });
  });

  /* ───── 형광펜 ─────
     블록 안의 글자(그림·조작 도구·버튼 제외)를 이어 붙인 문자열을 기준으로 위치를 찾는다.
     저장은 {t: 칠한 글자, pre/suf: 앞뒤 24자}로 해서, 글이 조금 바뀌어도 다시 찾을 수 있게 한다. */
  const SKIP = "canvas, svg, button, textarea, input, select, output, script, style, .ctl, .nb-panel, .nb-prev, .no, .phone, .reel-time";
  function model(b) {
    const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = []; let text = "";
    for (let n = w.nextNode(); n; n = w.nextNode()) { nodes.push({ n, start: text.length }); text += n.data; }
    return { nodes, text };
  }
  function pointIndex(m, container, offset) {
    if (container.nodeType === 3) {
      const e = m.nodes.find((x) => x.n === container);
      if (e) return e.start + offset;
    }
    const r = document.createRange(); r.setStart(container, offset);
    const e = m.nodes.find((x) => r.comparePoint(x.n, 0) >= 0);
    return e ? e.start : m.text.length;
  }
  function locate(text, h) {
    const whole = text.indexOf(h.pre + h.t + h.suf);
    if (whole >= 0) return whole + h.pre.length;
    let best = -1, i = text.indexOf(h.t);
    while (i >= 0) {
      if (best < 0) best = i;
      if (h.pre && text.slice(Math.max(0, i - h.pre.length), i) === h.pre) return i;
      i = text.indexOf(h.t, i + 1);
    }
    return best;
  }
  function wrap(m, s, e, k) {
    m.nodes.forEach(({ n, start }) => {
      const a = Math.max(s, start) - start, z = Math.min(e, start + n.data.length) - start;
      if (a >= z || !n.data.slice(a, z).trim()) return;
      if (z < n.data.length) n.splitText(z);
      const target = a > 0 ? n.splitText(a) : n;
      const mark = document.createElement("mark");
      mark.className = "hl"; mark.dataset.hi = k;
      target.parentNode.insertBefore(mark, target); mark.appendChild(target);
    });
  }
  function paint(b) {
    b.querySelectorAll("mark.hl").forEach((mk) => { const p = mk.parentNode; while (mk.firstChild) p.insertBefore(mk.firstChild, mk); p.removeChild(mk); p.normalize(); });
    const rec = S.get(b.id);
    (rec && rec.hl || []).forEach((h, k) => {
      const m = model(b), s = locate(m.text, h);
      if (s >= 0) wrap(m, s, s + h.t.length, k);
    });
  }
  blocks.forEach(paint);

  // 떠 있는 버튼 하나를 칠하기·지우기에 같이 쓴다
  const fab = document.createElement("button");
  fab.type = "button"; fab.className = "nb-fab"; fab.hidden = true;
  document.body.appendChild(fab);
  let pending = null;   // { b, h } 또는 { b, k, remove: true }
  const place = (rect) => {
    fab.hidden = false;
    const x = Math.min(innerWidth - fab.offsetWidth - 8, Math.max(8, rect.left + rect.width / 2 - fab.offsetWidth / 2));
    const y = rect.top > 52 ? rect.top - fab.offsetHeight - 8 : rect.bottom + 8;
    fab.style.left = `${x}px`; fab.style.top = `${y}px`;
  };
  const hide = () => { fab.hidden = true; pending = null; };

  function checkSelection() {
    const sel = getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { if (pending && !pending.remove) hide(); return; }
    const r = sel.getRangeAt(0), b = blockOf(r.startContainer);
    if (!b || blockOf(r.endContainer) !== b) { hide(); return; }
    const m = model(b);
    const s = pointIndex(m, r.startContainer, r.startOffset), e = pointIndex(m, r.endContainer, r.endOffset);
    const t = m.text.slice(s, e);
    if (e - s < 2 || !t.trim()) { hide(); return; }
    pending = { b, h: { t, pre: m.text.slice(Math.max(0, s - 24), s), suf: m.text.slice(e, e + 24) } };
    fab.textContent = "형광펜"; fab.classList.remove("rm");
    place(r.getBoundingClientRect());
  }
  let st;
  document.addEventListener("selectionchange", () => { clearTimeout(st); st = setTimeout(checkSelection, 250); });
  document.addEventListener("click", (ev) => {
    const mk = ev.target.closest && ev.target.closest("mark.hl");
    if (mk && getSelection().isCollapsed) {
      pending = { b: blockOf(mk), k: +mk.dataset.hi, remove: true };
      fab.textContent = "형광펜 지우기"; fab.classList.add("rm");
      place(mk.getBoundingClientRect());
    } else if (ev.target !== fab && pending && pending.remove) hide();
  });
  fab.addEventListener("mousedown", (ev) => ev.preventDefault());   // 선택이 풀리지 않게
  fab.addEventListener("click", () => {
    if (!pending) return;
    if (pending.remove) S.removeHighlight(pending.b.id, pending.k);
    else S.addHighlight(pending.b.id, pending.h);
    paint(pending.b);
    getSelection().removeAllRanges();
    hide();
  });
  addEventListener("scroll", () => { if (!fab.hidden && pending && pending.remove) hide(); }, { passive: true });

  /* ───── 확인 문제 기록 ───── */
  const optText = (btn) => {
    const span = btn.querySelector(":scope > span:last-child").cloneNode(true);
    span.querySelectorAll(".why").forEach((w) => w.remove());
    return span.textContent.trim();
  };
  const whyText = (btn) => (btn.querySelector(".why") || { textContent: "" }).textContent.trim();
  document.addEventListener("answered", (ev) => {
    const q = ev.target, b = blockOf(q), btn = ev.detail && ev.detail.button;
    if (!b || !btn) return;
    const qi = [...b.querySelectorAll(".quiz")].indexOf(q);
    const right = q.querySelector('button.opt[data-ok="1"]');
    S.recordAnswer(b.id, qi, {
      ok: ev.detail.ok, q: (q.querySelector(".q") || { textContent: "" }).textContent.trim(),
      answer: right ? optText(right) : "", why: right ? whyText(right) : "",
      chosen: optText(btn), chosenWhy: whyText(btn),
    });
    S.markSeen(b.id);
  });
  // 지난 기록 표시
  blocks.forEach((b) => {
    const rec = S.get(b.id);
    b.querySelectorAll(".quiz").forEach((q, qi) => {
      const r = rec && rec.quiz && rec.quiz[qi];
      const h3 = q.querySelector("h3");
      if (!r || !h3) return;
      const tag = document.createElement("a");
      tag.className = "nb-prev mono"; tag.href = `${notesUrl}#wrong`;
      tag.textContent = r.firstOk ? "지난번에 맞힌 문제" : r.resolved ? "오답노트에서 해결함" : "오답노트에 있는 문제";
      if (!r.firstOk && !r.resolved) tag.classList.add("bad");
      h3.appendChild(tag);
    });
  });

  /* ───── 방문 기록: 블록이 화면에 1.5초 이상 보이면 본 것으로 친다 ───── */
  const timers = new Map();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) timers.set(e.target, setTimeout(() => { S.markSeen(e.target.id); tocMark(); }, 1500));
    else clearTimeout(timers.get(e.target));
  }), { threshold: 0.35 });
  blocks.forEach((b) => { if (!(S.get(b.id) || {}).seen) io.observe(b); });

  // 옆 목차에 본 블록 표시
  function tocMark() {
    document.querySelectorAll(".toc a[href^='#']").forEach((a) => {
      const r = S.get(a.getAttribute("href").slice(1));
      a.classList.toggle("seen", !!(r && r.seen));
      a.classList.toggle("noted", !!(r && (r.note || (r.hl && r.hl.length))));
    });
  }
  tocMark();
  S.onChange(tocMark);
})();
