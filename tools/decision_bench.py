#!/usr/bin/env python3
"""Bounded, secret-safe OpenRouter Decisions smoke benchmark. Python stdlib only."""
import argparse
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
API = "https://openrouter.ai/api/alpha/decisions"
DEFAULT_MODELS = (
    "typesafe/jev-1.14",
    "perplexity/pplx-decider-v1.2",
    "openai/gpt-6-luna-decisions",
    "baseten/mammoth-1:free",
    "baseten/elephant-1:free",
    "nace-ai/drex-max",
)
LABELS = {
    "directly_documented": "The source directly documents this exact proposed claim, e.g. a letter directly documents that its author made an accusation.",
    "accusation_only": "The source reports an accusation that an act occurred, but does not independently establish the accused performed it.",
    "interpretation_only": "The proposed claim is a later scholarly or speculative inference, not recorded as a fact in the source.",
    "insufficient_data": "The excerpt lacks information sufficient to establish the proposed claim, and neither an allegation nor a specific interpretation establishes it.",
}

def make_payload(model, case):
    return {
        "model": model,
        "state": case["state"],
        "questions": {
            "evidence_relation": {
                "type": "choice",
                "instructions": (
                    "Classify the evidentiary relation of the supplied excerpt to proposed_claim. "
                    "Distinguish a primary source recording someone's allegation from proof that the alleged act occurred. "
                    "A theory or resemblance is not independent proof."
                ),
                "criteria": LABELS,
            },
            "directly_supported": {
                "type": "noul",
                "instructions": "Does this excerpt directly document the exact proposed_claim as stated, without needing to assume an accusation or speculation is true?",
                "criteria": {
                    "true": "The exact claim is a direct documented statement or observation in this excerpt.",
                    "false": "This excerpt offers only an allegation, inference or insufficient evidence for the proposed claim."
                },
            },
        },
    }

def validate_answer(data):
    answers = data.get("answers")
    if not isinstance(answers, dict):
        return {"valid": False, "label": None, "prob_direct": None}
    relation = answers.get("evidence_relation") or {}
    direct = answers.get("directly_supported") or {}
    label = relation.get("choice")
    prob = direct.get("noul")
    if label not in LABELS or not isinstance(prob, (int, float)) or not 0 <= prob <= 1:
        return {"valid": False, "label": label, "prob_direct": prob}
    return {"valid": True, "label": label, "prob_direct": round(float(prob), 4)}

def call_api(token, payload, timeout=35):
    blob = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    if len(blob) > 18000:
        raise ValueError("request exceeds local 18KB limit")
    req = urllib.request.Request(
        API, data=blob, method="POST",
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/conradipui-glitch/deductionwizzard",
            "X-OpenRouter-Title": "Deduction Wizard research benchmark",
        },
    )
    started = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read(65537)
            if len(raw) > 65536:
                raise ValueError("response exceeds local size limit")
        return json.loads(raw), round((time.monotonic() - started) * 1000), None
    except urllib.error.HTTPError as exc:
        return {}, round((time.monotonic() - started) * 1000), f"HTTP_{exc.code}"
    except (urllib.error.URLError, TimeoutError) as exc:
        return {}, round((time.monotonic() - started) * 1000), type(exc).__name__

def run(models, cases, key, max_calls):
    records = []
    for model in models:
        for case in cases:
            if len(records) >= max_calls:
                break
            record = {"model": model, "fixture": case["id"], "expected": case["expected"]}
            payload = make_payload(model, case)
            data, elapsed, error = call_api(key, payload)
            verdict = validate_answer(data)
            record.update({
                "latency_ms": elapsed,
                "error": error,
                "returned_model": data.get("model"),
                "usage_cost_usd": (data.get("usage") or {}).get("cost"),
                "label": verdict["label"],
                "prob_direct": verdict["prob_direct"],
                "response_valid": verdict["valid"],
                "label_match": verdict["valid"] and verdict["label"] == case["expected"],
            })
            records.append(record)
            print(
                f"{model} / {case['id']}: "
                f"{'error ' + error if error else ('PASS' if record['label_match'] else 'REVIEW')} "
                f"{record['label'] or '-'} {elapsed}ms",
                flush=True,
            )
    return {
        "method": "micro-smoke; not a model accuracy ranking",
        "source": "hand-authored public historical-literacy fixtures",
        "api": API, "model_count": len(models), "request_count": len(records),
        "records": records,
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--run", action="store_true")
    p.add_argument("--max-calls", type=int, default=24)
    p.add_argument("--out", default="benchmark/results/smoke.json")
    args = p.parse_args()
    cases = json.loads((ROOT / "benchmark/fixtures.json").read_text(encoding="utf-8"))
    if not cases or not all(isinstance(c.get("expected"), str) and c["expected"] in LABELS for c in cases):
        raise SystemExit("invalid benchmark fixtures")
    models = DEFAULT_MODELS
    if args.max_calls < 1 or args.max_calls > 24:
        raise SystemExit("max-calls must be between 1 and 24 (budget hard limit)")
    if not args.run:
        print(json.dumps({
            "mode": "dry-run", "models": list(models), "fixtures": [c["id"] for c in cases],
            "maximum_calls": args.max_calls, "api": API, "requires_secret": "DECIS_API"
        }, ensure_ascii=False, indent=2))
        return
    token = os.environ.get("DECIS_API", "").strip()
    if not token:
        raise SystemExit("DECIS_API secret unavailable: no live API calls made")
    report = run(models, cases, token, args.max_calls)
    path = ROOT / args.out
    if not path.resolve().is_relative_to(ROOT / "benchmark"):
        raise SystemExit("output path must be under benchmark/")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Results written; no API keys or full response bodies logged.")
    if not any(r["response_valid"] for r in report["records"]):
        raise SystemExit("all API calls failed validation; check workflow logs for sanitized error codes")

if __name__ == "__main__":
    main()
