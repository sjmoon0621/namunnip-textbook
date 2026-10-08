// 글자층이 없는(스캔) 시험지 쪽 이미지에서 줄 단위 글자와 위치를 읽는다 (macOS Vision, 한국어).
// 사용: swift tools/exams/ocr_lines.swift <쪽.png> [<쪽.png> ...]
// 출력(JSON 한 줄씩): {"file": ..., "w": 픽셀 폭, "h": 픽셀 높이, "lines": [{"t": 글자, "x0","y0","x1","y1": 픽셀, 위가 0}]}
import Foundation
import Vision
import AppKit

for path in CommandLine.arguments.dropFirst() {
    guard let img = NSImage(contentsOfFile: path),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        FileHandle.standardError.write("이미지를 열 수 없음: \(path)\n".data(using: .utf8)!)
        exit(1)
    }
    let w = Double(cg.width), h = Double(cg.height)
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages = ["ko-KR", "en-US"]
    req.usesLanguageCorrection = false
    try VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
    var lines: [[String: Any]] = []
    for obs in req.results ?? [] {
        guard let top = obs.topCandidates(1).first else { continue }
        let b = obs.boundingBox   // 0~1, 아래가 0
        lines.append(["t": top.string, "x0": b.minX * w, "x1": b.maxX * w, "y0": (1 - b.maxY) * h, "y1": (1 - b.minY) * h])
    }
    let out: [String: Any] = ["file": path, "w": w, "h": h, "lines": lines]
    let data = try JSONSerialization.data(withJSONObject: out)
    print(String(data: data, encoding: .utf8)!)
}
