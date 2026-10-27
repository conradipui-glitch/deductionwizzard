#!/usr/bin/env python3
"""Research assistant: bounded, auditable decision model candidate assessments.

No model output is promoted to established casebook facts. No API key logged.
"""
import argparse
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
API="https://openrouter.ai/api/alpha/decisions"
MODELS=(
    "perplexity/pplx-decider-v1.2",
    "baseten/mammoth-1:free",
    "baseten/elephant-1:free",
)
PAIRS=(
    ("h-idalia","c-1833-idalia"),
    ("h-idalia","c-1836-idalia-rumor"),
    ("h-heckern","claim-blames"),
    ("h-heckern","c-1837-reply"),
    ("h-court","c-1834-court"),
    ("h-court","c-1837-lermontov"),
)
CHOICES={
    "supports":"Excerpt independently documents an element specific to the historical hypothesis; an accusation or literary opinion alone is not proof.",
    "contradicts":"Excerpt contains a direct contradiction to a necessary historical element of the hypothesis.",
    "compatible":"Excerpt is consistent with a possible scenario but not discriminating proof; including accusations that a person acted.",
    "insufficient_data":"Excerpt is too limited or remote to infer even a meaningful relation; avoid inventing historical facts.",
}

def payload(model, hypothesis, claim, sources):
    return {
        "model":model,
        "state":{
            "hypothesis":hypothesis["statement"],
            "hypothesis_assumptions":hypothesis["assumptions"],
            "discriminating_test":hypothesis["discriminating_test"],
            "claim":claim["text"],
            "claim_kind":claim["kind"],
            "source_summaries":[{"title":s["title"],"type":s["type"],"note":s.get("note",""),"locator":s["locator"]} for s in sources],
            "caution":"These are abstracts from a curated casebook, NOT original full documents; retrospective accounts may depend on primary material."
        },
        "questions":{"relation":{
            "type":"choice",
            "instructions":"Based ONLY on supplied state, evaluate whether these source summaries support, contradict, are merely compatible with, or cannot assess the hypothesis. Do not convert a witnessed accusation into proof of the alleged act. When data insufficient choose insufficient_data.",
            "criteria":CHOICES,
        }},
    }

def testable_pairs(book):
    hs={h["id"]:h for h in book["hypotheses"]}
    cs={c["id"]:c for c in book["claims"]}
    ss={s["id"]:s for s in book["sources"]}
    for hid,cid in PAIRS:
        assert hid in hs and cid in cs
        src=[ss[e["source_id"]] for e in cs[cid]["evidence"]]
        yield hid,cid,hs[hid],cs[cid],src

def call(token, body):
    req=urllib.request.Request(API,data=json.dumps(body,ensure_ascii=False).encode("utf-8"),headers={
        "Authorization":"Bearer "+token,
        "Content-Type":"application/json",
        "HTTP-Referer":"https://github.com/conradipui-glitch/deductionwizzard",
        "X-OpenRouter-Title":"Deduction Wizard hypothesis proposal pilot",
    },method="POST")
    t=time.monotonic()
    try:
        with urllib.request.urlopen(req,timeout=30) as response:
            raw=response.read(50000)
        return json.loads(raw),round((time.monotonic()-t)*1000),None
    except urllib.error.HTTPError as error:
        return {},round((time.monotonic()-t)*1000),"HTTP_"+str(error.code)
    except (urllib.error.URLError,TimeoutError) as error:
        return {},round((time.monotonic()-t)*1000),type(error).__name__

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--run",action="store_true")
    parser.add_argument("--max-calls",type=int,default=18)
    parser.add_argument("--out",default="benchmark/results/proposed.json")
    args=parser.parse_args()
    if args.max_calls<1 or args.max_calls>18:raise SystemExit("Budget cap: 1–18 requests")
    book=json.loads((ROOT/"cases/pushkin/casebook.json").read_text(encoding="utf-8"))
    pairs=list(testable_pairs(book))
    if not args.run:
        print(json.dumps({"mode":"dry-run","models":MODELS,"pairs":[(p[0],p[1]) for p in pairs],"max_calls":args.max_calls,"secret":"DECIS_API"},ensure_ascii=False))
        return
    key=os.environ.get("DECIS_API","").strip()
    if not key:raise SystemExit("No DECIS_API secret, no calls")
    records=[]
    for hid,cid,hyp,claim,sources in pairs:
        for model in MODELS:
            if len(records)>=args.max_calls:break
            result,ms,error=call(key,payload(model,hyp,claim,sources))
            data=(result.get("answers") or {}).get("relation") or {}
            decision=data.get("choice")
            valid=decision in CHOICES
            row={"hypothesis_id":hid,"claim_id":cid,"model":model,"proposed_stance":decision if valid else None,
                "valid":valid,"error":error,"latency_ms":ms,"usage_cost":(result.get("usage") or {}).get("cost"),
                "review_status":"not_reviewed","evidence_kind":"summary_based_model_suggestion_not_source_verification"}
            records.append(row)
            print(hid,cid,model,decision if valid else error or "INVALID","ms",ms,flush=True)
        if len(records)>=args.max_calls:break
    output={"schema_version":"0.4","status":"UNREVIEWED_MODEL_SUGGESTIONS","evaluation_source":"short abstracts only, not full documents","models":list(MODELS),"request_count":len(records),"assessments":records}
    out=ROOT/args.out
    if not out.resolve().is_relative_to((ROOT/"benchmark").resolve()):raise SystemExit("Output must be in benchmark/")
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("No API keys or raw payloads logged. Suggestions are NOT casebook facts.",flush=True)
    if not any(r["valid"] for r in records):raise SystemExit("No valid responses received")

if __name__=="__main__":main()
