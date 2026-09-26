/* 학습 기록 저장소 — 메모, 형광펜, 확인 문제 기록, 방문 기록을 이 브라우저(localStorage)에 블록 id 기준으로 저장한다.
   블록 id로 저장하므로 교육과정 개편으로 블록이 다른 절로 옮겨 가도 기록이 따라간다.
   구조: { v: 1, blocks: { <블록 id>: { note, noteAt, hl: [{ t, pre, suf, at }], seen, quiz: [{ q, answer, why, tries, firstOk, ok, wrong: [{ t, why }], resolved, at }] } } } */
window.NMStore = (() => {
  "use strict";
  const KEY = "namunnip-textbook-v1";
  let data = { v: 1, blocks: {} };
  let ok = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.blocks) data = d; }
  } catch (e) { ok = false; }

  const listeners = new Set();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); ok = true; } catch (e) { ok = false; }
    listeners.forEach((f) => f());
  };
  const block = (id) => (data.blocks[id] ||= {});
  const prune = (id) => {
    const b = data.blocks[id];
    if (b && !b.note && !(b.hl && b.hl.length) && !b.seen && !(b.quiz && b.quiz.length)) delete data.blocks[id];
  };

  // 다른 탭에서 바뀌면 다시 읽는다
  addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try { data = JSON.parse(e.newValue) || { v: 1, blocks: {} }; } catch (err) { /* 무시 */ }
    listeners.forEach((f) => f());
  });

  return {
    get available() { return ok; },
    all: () => data,
    get: (id) => data.blocks[id],
    setNote(id, text) {
      const b = block(id);
      b.note = text.trim() ? text : undefined; b.noteAt = Date.now();
      if (!b.note) delete b.note, delete b.noteAt;
      prune(id); save();
    },
    addHighlight(id, h) { (block(id).hl ||= []).push({ ...h, at: Date.now() }); save(); },
    removeHighlight(id, idx) {
      const b = data.blocks[id]; if (!b || !b.hl) return;
      b.hl.splice(idx, 1); if (!b.hl.length) delete b.hl; prune(id); save();
    },
    markSeen(id) { const b = block(id); if (!b.seen) { b.seen = Date.now(); save(); } },
    recordAnswer(id, qi, info) {
      const b = block(id); b.quiz ||= [];
      const r = (b.quiz[qi] ||= { tries: 0, wrong: [] });
      r.q = info.q; r.answer = info.answer; r.why = info.why; r.at = Date.now();
      if (r.tries === 0) r.firstOk = info.ok;
      r.tries++;
      if (info.ok) r.ok = true;
      else if (!r.wrong.some((w) => w.t === info.chosen)) r.wrong.push({ t: info.chosen, why: info.chosenWhy });
      save();
    },
    setResolved(id, qi, v) { const r = data.blocks[id]?.quiz?.[qi]; if (r) { r.resolved = v || undefined; save(); } },
    clearQuiz(id, qi) { const b = data.blocks[id]; if (b?.quiz?.[qi]) { b.quiz[qi] = null; if (!b.quiz.some(Boolean)) delete b.quiz; prune(id); save(); } },
    exportJSON: () => JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 1),
    importJSON(text) {
      const d = JSON.parse(text);
      if (!d || typeof d.blocks !== "object") throw new Error("나뭇잎 교과서 백업 파일이 아닙니다.");
      // 합치기: 메모는 최근 것, 형광펜은 합집합, 퀴즈·방문은 있는 쪽
      for (const [id, nb] of Object.entries(d.blocks)) {
        const b = block(id);
        if (nb.note && (!b.note || (nb.noteAt || 0) > (b.noteAt || 0))) { b.note = nb.note; b.noteAt = nb.noteAt; }
        for (const h of nb.hl || []) if (!(b.hl ||= []).some((x) => x.t === h.t && x.pre === h.pre)) b.hl.push(h);
        if (b.hl && !b.hl.length) delete b.hl;
        if (nb.seen && !b.seen) b.seen = nb.seen;
        (nb.quiz || []).forEach((q, i) => { if (q && !(b.quiz ||= [])[i]) b.quiz[i] = q; });
      }
      save();
    },
    clearAll() { data = { v: 1, blocks: {} }; save(); },
    onChange: (f) => listeners.add(f),
  };
})();
