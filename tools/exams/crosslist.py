#!/usr/bin/env python3
"""이미 분류된 Ⅱ 과목 기출을 내용이 겹치는 고급 과목 절에도 함께 싣는다(이미지·텍스트는 원래 항목 그대로, 원래 절에서는 빼지 않는다).

  python -X utf8 tools/exams/crosslist.py   # exams/sec/*.json 에서 via 표시가 붙은 항목을 지우고 다시 만든 뒤 exams/index.json 을 새로 센다

규칙 = (대상 절, 원래 절 목록, 문제 글에 있어야 할 낱말 정규식 또는 None). 띄어쓰기를 지운 글에 맞춘다.
정규식이 !로 시작하면 그 낱말이 없어야 싣는다.
한 과목 안에서는 위에 있는 규칙이 먼저 잡는다(한 문항이 같은 과목의 두 절에 겹쳐 나오지 않게).
Ⅰ 과목 문항은 고급 과목에 비해 쉬워서 넣지 않는다.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
SEC = ROOT / "exams" / "sec"

RULES = [
    # 고급 물리학
    ("adphy-1-1", ["mech-1-1", "mech-1-2"], r"포물선|수평으로던|수평방향으로던|비스듬히"),
    ("adphy-1-2", ["phy-1-3"], None),
    ("adphy-1-3", ["phy-1-1"], r"막대|돌림힘|회전|원판|무게중심|평형을유지|수평을"),
    ("adphy-1-3", ["mech-1-3"], None),
    ("adphy-1-4", ["mech-1-4", "mech-1-5"], None),
    ("adphy-1-6", ["mech-2-4", "mech-2-5"], None),
    ("adphy-1-6", ["mech-2-3"], r"열효율|열기관|카르노|엔트로피"),
    ("adphy-1-5", ["mech-2-2", "mech-2-3"], None),
    ("adphy-2-1", ["emq-1-1", "phy-2-1"], None),
    ("adphy-2-4", ["emq-1-5", "emq-1-6", "emq-2-1"], r"전자기파|안테나|송수신|라디오"),
    ("adphy-2-2", ["phy-2-3"], None),
    ("adphy-2-2", ["emq-1-2"], r"유전|축전기"),
    ("adphy-2-6", ["emq-1-6"], r"교류|공명|리액턴스|진동수"),
    ("adphy-2-2", ["emq-1-6"], r"축전기"),
    ("adphy-2-5", ["phy-2-2"], None),
    ("adphy-2-3", ["emq-1-3", "phy-2-5", "emq-1-5", "phy-2-6"], None),
    ("adphy-3-1", ["emq-2-2"], None),
    ("adphy-3-1", ["phy-3-2"], r"렌즈|거울"),
    ("adphy-3-3", ["emq-2-1"], r"회절|분해능"),
    ("adphy-3-2", ["emq-2-1", "phy-3-1"], None),
    ("adphy-3-4", ["emq-2-3"], None),
    ("adphy-4-2", ["mech-1-6"], r"블랙홀|중력렌즈|시간이느리|시간지연|빛이휘|휘어"),
    ("adphy-4-1", ["mech-1-6"], None),
    ("adphy-4-4", ["emq-3-4"], r"불확정"),
    ("adphy-4-3", ["emq-2-4", "phy-3-3", "emq-3-1"], None),
    ("adphy-4-5", ["emq-3-3"], None),
    ("adphy-4-6", ["emq-3-5"], r"핵융합|핵반응|핵분열"),
    # 고급 화학
    ("adchem-2-3", ["mateng-1-1", "mateng-1-2"], r"실제기체"),
    ("adchem-2-1", ["mateng-1-1", "mateng-1-2"], r"분자운동|평균속력|평균운동에너지|속력분포|확산|분출"),
    ("adchem-2-2", ["mateng-1-1", "mateng-1-2"], None),
    ("adchem-4-3", ["mateng-1-3"], r"상평형|삼중점|상그림|임계점"),
    ("adchem-2-4", ["mateng-1-3"], r"증기압|표면장력|모세관"),
    ("adchem-4-3", ["mateng-2-1"], r"상평형"),
    ("adchem-2-4", ["mateng-2-1"], r"표면장력|모세관|증기압"),
    ("adchem-2-5", ["mateng-1-4"], None),
    ("adchem-2-6", ["chem-4-2"], None),
    ("adchem-2-7", ["mateng-2-2", "mateng-2-3"], None),
    ("adchem-3-2", ["mateng-3-1", "mateng-3-2"], None),
    ("adchem-3-4", ["mateng-3-3"], r"자유에너지|DG|ΔG|깁스"),
    ("adchem-3-3", ["mateng-3-3"], None),
    ("adchem-3-5", ["rxn-2-1"], None),
    ("adchem-3-7", ["rxn-2-2", "rxn-2-3"], r"자유에너지|DG|ΔG"),
    ("adchem-3-6", ["rxn-2-2", "rxn-2-3"], None),
    ("adchem-3-8", ["rxn-2-4"], None),
    ("adchem-4-2", ["chem-3-4"], r"온도를(높|낮|올|내)|온도에따른|온도변화|온도가(높|낮)|흡열|발열"),
    ("adchem-4-3", ["chem-3-1"], r"상평형|용해|증기압"),
    ("adchem-4-1", ["chem-3-1", "chem-3-2", "chem-3-3"], None),
    ("adchem-4-6", ["rxn-1-3", "rxn-1-5"], None),
    ("adchem-4-5", ["rxn-1-2", "rxn-1-4"], r"pH|수소이온농도"),
    ("adchem-4-4", ["rxn-1-2"], None),
    ("adchem-4-11", ["mateng-4-4"], r"촉매"),
    ("adchem-4-7", ["mateng-4-4"], r"온도를(높|낮|올|내)|온도에따른|온도가(높|낮)|온도변화|활성화에너지"),
    ("adchem-4-9", ["mateng-4-3"], None),
    ("adchem-4-8", ["mateng-4-2"], None),
    ("adchem-4-10", ["mateng-4-1"], r"단계|메커니즘|반응중간체"),
    ("adchem-4-7", ["mateng-4-1"], None),
    # 고급 생명과학
    ("adbio-1-1", ["cell-1-1", "cell-1-2"], None),
    ("adbio-1-4", ["cell-3-6"], r"C4|CAM|광호흡"),
    ("adbio-1-3", ["cell-3-6"], r"캘빈|탄소고정|RuBP|PGA|PGAL|3PG"),
    ("adbio-1-2", ["cell-3-6", "cell-3-7"], None),
    ("adbio-1-5", ["cell-3-2"], None),
    ("adbio-1-6", ["cell-3-3"], None),
    ("adbio-3-1", ["gene-1-7"], None),
    ("adbio-3-4", ["gene-2-3"], r"오페론|대장균|원핵"),
    ("adbio-3-2", ["gene-2-3"], None),
    ("adbio-3-3", ["gene-2-2"], None),
    ("adbio-3-5", ["gene-2-4"], None),
    ("adbio-4-1", ["gene-3-1", "gene-3-2"], r"줄기세포|세포융합|핵치환|단일클론|조직배양|복제양|복제동물"),
    ("adbio-4-2", ["gene-3-1", "gene-3-2"], r"재조합|제한효소|플라스미드|PCR|중합효소연쇄|전기영동|DNA연결"),
    ("adbio-4-3", ["gene-3-1", "gene-3-2"], None),
    # 고급 지구과학
    ("adearth-1-3", ["esys-1-5"], r"지자기|지구자기|복각|편각|고지자기|자북|오로라"),
    ("adearth-1-2", ["esys-1-5"], r"중력|지오이드|지각평형|원심력|만유인력|단진자|탐사|조륙|빙하|융기|나무토막|나무도막"),
    ("adearth-1-1", ["esys-1-5"], None),
    ("adearth-1-4", ["esys-1-3"], None),
    ("adearth-1-6", ["earth-2-3", "earth-2-4"], r"편광|니콜|복굴절|다색성|소광|간섭색|광학적"),
    ("adearth-1-5", ["earth-2-3", "earth-2-4"], r"광물|쪼개짐|굳기|조흔|규산염|동질이상|고용체"),
    ("adearth-1-7", ["earth-2-3", "earth-2-4", "esys-1-4"], None),
    ("adearth-1-10", ["earth-2-1"], r"주향|경사|지질도|클리노미터"),
    ("adearth-1-8", ["earth-2-1"], None),
    ("adearth-3-2", ["earth-3-1"], r"겉보기운동|역행|순행|회합|내행성|외행성|금성|화성|목성|토성|최대이각|일식|월식"),
    ("adearth-3-1", ["earth-3-1"], r"적경|적위|천구|방위각|고도|자오선|시간권|항성시"),
    ("adearth-1-9", ["earth-2-2"], None),
    ("adearth-1-11", ["earth-2-5"], r"!생산량|매장량|수요량|수입|광물자원|자원"),
    ("adearth-2-1", ["esys-3-3"], r"구름|이슬점|포화|강수|빙정|병합"),
    ("adearth-2-2", ["esys-3-3", "esys-3-4"], None),
    ("adearth-2-4", ["esys-3-5"], None),
    ("adearth-2-5", ["esys-3-6"], None),
    ("adearth-2-6", ["earth-1-1"], None),
    ("adearth-2-7", ["esys-2-2", "esys-2-3"], None),
    ("adearth-2-8", ["esys-2-1"], None),
    ("adearth-2-9", ["earth-1-2"], None),
    ("adearth-2-10", ["esys-2-4"], None),
    ("adearth-2-11", ["earth-1-5"], None),
    ("adearth-3-2", ["space-1-3"], None),
    ("adearth-3-3", ["space-2-2"], None),
    ("adearth-3-4", ["earth-3-2"], None),
    ("adearth-3-5", ["earth-3-3"], None),
    ("adearth-3-6", ["space-2-5"], None),
    ("adearth-3-7", ["space-3-2"], None),
    ("adearth-3-8", ["space-3-1", "space-3-3"], None),
    ("adearth-3-9", ["earth-3-4"], None),
    ("adearth-3-10", ["earth-3-5", "space-3-4"], None),
    ("adearth-3-11", ["space-3-5"], None),
]


def main():
    data = {f.stem: json.loads(f.read_text(encoding="utf-8")) for f in sorted(SEC.glob("*.json"))}
    for d in data.values():   # 다시 돌려도 같은 결과가 나오게 지난번에 겹쳐 실은 것을 먼저 지운다
        d["items"] = [it for it in d["items"] if "via" not in it]
    taken, added = set(), {}
    for target, srcs, pat in RULES:
        course = target.split("-")[0]
        neg = bool(pat) and pat.startswith("!")
        rx = re.compile(pat[1:] if neg else pat) if pat else None
        for s in srcs:
            for it in data.get(s, {"items": []})["items"]:
                if "Ⅱ" not in it["subject"] or (course, it["id"]) in taken:
                    continue
                if rx and bool(rx.search(re.sub(r"\s+", "", it.get("text", "")))) == neg:
                    continue
                taken.add((course, it["id"]))
                data.setdefault(target, {"sec": target, "items": []})["items"].append({**it, "via": s})
                added[target] = added.get(target, 0) + 1
    for k, d in data.items():
        (SEC / f"{k}.json").write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    idx = {k: len(d["items"]) for k, d in sorted(data.items()) if d["items"]}
    (ROOT / "exams" / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=0), encoding="utf-8")
    for k in sorted(added, key=lambda k: [int(x) if x.isdigit() else x for x in k.split("-")]):
        print(k, added[k])
    print(f"겹쳐 실은 문항 {sum(added.values())}개, 절 {len(added)}개")


if __name__ == "__main__":
    main()
