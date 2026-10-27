"""Evidence-bound generator. Only repository owner issue requests may reach this script."""
import hashlib,json,os,re,sys,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MODEL="deepseek/deepseek-v4.1-flash-1017"
book=json.loads((ROOT/"cases/pushkin/casebook.json").read_text())
story=json.loads((ROOT/"cases/pushkin/stories.json").read_text())
hyps={x["id"]:x for x in book["hypotheses"]}
scenes={x["id"]:x for x in story["scenes"]}
claims={x["id"]:x for x in book["claims"]}
sources={x["id"]:x for x in book["sources"]}
def config_from_issue(body):
    m=re.search(r"DW_STORY_REQUEST: (\{[^\n]{1,4000}\})",body)
    if not m:raise ValueError("Missing validated request marker")
    raw=json.loads(m.group(1))
    hs=raw.get("hypotheses",[])
    ss=raw.get("scenes",[])
    note=raw.get("note","")
    own=raw.get("custom_hypotheses",[])
    if not isinstance(hs,list) or len(hs)>3 or any(x not in hyps for x in hs):raise ValueError("Invalid hypotheses")
    if not isinstance(ss,list) or not 2<=len(ss)<=14 or len(set(ss))!=len(ss) or any(x not in scenes for x in ss):raise ValueError("Invalid scenes")
    if not isinstance(note,str) or len(note)>350:raise ValueError("Invalid note")
    if not isinstance(own,list) or len(own)>2 or any(not isinstance(x,str) or not 10<=len(x.strip())<=180 for x in own):raise ValueError("Invalid custom hypotheses")
    return {"hypotheses":sorted(set(hs)),"custom_hypotheses":list(dict.fromkeys(x.strip() for x in own)),"scenes":[s["id"] for s in story["scenes"] if s["id"] in ss],"note":note.strip()}
def evidence_for(cfg):
    evidence=[]
    for sid in cfg["scenes"]:
        s=scenes[sid]
        refs=[]
        for cid in s["claim_ids"]:
            for ev in claims[cid]["evidence"]:
                source=sources[ev["source_id"]]
                if source["id"] not in [x["id"] for x in refs]:
                    refs.append({"id":source["id"],"title":source["title"],"kind":source["type"]})
        evidence.append({"scene_id":sid,"title":s["title"],"date":s["eyebrow"],"documented_outline":s["body"],"sources":refs,"hypothetical_branches":{k:v for k,v in s["branches"].items() if k in cfg["hypotheses"]}})
    return {"hypotheses":[{"id":k,"title":hyps[k]["statement"]} for k in cfg["hypotheses"]],"new_unreviewed_hypotheses":cfg["custom_hypotheses"],"scenes":evidence,"investigator_note":cfg["note"]}
def generate(cfg,key):
    instruction=("Ты исторический редактор. Напиши НОВУЮ связную, выразительную версию истории на русском, "
      "используя только предоставленные выдержки. Не склеивай дословно готовые эпизоды. "
      "У каждой главы два абзаца: documented — только подтверждаемое документом, reconstruction — "
      "условная реконструкция, ясно помеченная словами возможно или если допустить. "
      "Не выдумывай цитаты, даты, очевидцев, архивы, близкие связи или доказательства. "
      "Если гипотезы противоречат друг другу, укажи это. Заметка пользователя не исторический источник. "
      "Верни ТОЛЬКО JSON с title, intro, chapters, conclusion. "
      "Каждая глава имеет scene_id, documented, reconstruction. Порядок глав совпадает со сценами.")
    payload={"model":MODEL,"messages":[{"role":"system","content":instruction},{"role":"user","content":json.dumps(evidence_for(cfg),ensure_ascii=False)}],"temperature":0.55,"max_tokens":6500,"response_format":{"type":"json_object"}}
    req=urllib.request.Request("https://openrouter.ai/api/v1/chat/completions",data=json.dumps(payload,ensure_ascii=False).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json","HTTP-Referer":"https://github.com/conradipui-glitch/deductionwizzard"},method="POST")
    try:
        with urllib.request.urlopen(req,timeout=110) as response:result=json.loads(response.read(180000))
    except urllib.error.HTTPError as e:
        raise ValueError("OpenRouter error "+str(e.code)) from None
    raw=result["choices"][0]["message"]["content"].strip()
    if not raw.startswith("{"):raw=raw[raw.index("{"):raw.rindex("}")+1]
    doc=json.loads(raw)
    if not all(isinstance(doc.get(k),str) and 10<len(doc[k])<2000 for k in ("title","intro","conclusion")):raise ValueError("Bad model output")
    chapters=doc.get("chapters",[])
    if [ch.get("scene_id") for ch in chapters]!=cfg["scenes"]:raise ValueError("Missing or extra chapters")
    for c in chapters:
        if not all(isinstance(c.get(k),str) and 15<len(c[k])<2200 for k in ("documented","reconstruction")):raise ValueError("Invalid chapter")
    return doc,result.get("usage",{})
def save(cfg,doc,usage):
    key=hashlib.sha256(json.dumps(cfg,sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:12]
    ident="pushkin-"+key
    directory=ROOT/"apps/board-ui/public/generated"
    directory.mkdir(parents=True,exist_ok=True)
    data={"id":ident,"schema_version":"0.4.1","status":"AI_DRAFT_UNREVIEWED","model":MODEL,"input":cfg,"title":doc["title"],"intro":doc["intro"],"chapters":doc["chapters"],"conclusion":doc["conclusion"],"warning":"Это сгенерированная реконструкция, не историческое свидетельство.","usage":{"prompt_tokens":usage.get("prompt_tokens"),"completion_tokens":usage.get("completion_tokens"),"cost":usage.get("cost")}}
    (directory/(ident+".json")).write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    index=directory/"index.json"
    entries=json.loads(index.read_text()) if index.exists() else []
    entries=[x for x in entries if x.get("id")!=ident]
    entries.insert(0,{"id":ident,"filename":ident+".json","title":doc["title"],"hypotheses":cfg["hypotheses"],"scenes":cfg["scenes"],"status":"AI_DRAFT_UNREVIEWED"})
    index.write_text(json.dumps(entries[:30],ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"file":ident+".json","chapters":len(doc["chapters"]),"usage":data["usage"]}))
if __name__=="__main__":
    cfg=config_from_issue(os.environ.get("STORY_REQUEST_BODY",""))
    if "--dry-run" in sys.argv:print(json.dumps(cfg,ensure_ascii=False));sys.exit(0)
    token=os.environ.get("DECIS_API","")
    if not token:raise SystemExit("Missing repository secret")
    doc,usage=generate(cfg,token)
    save(cfg,doc,usage)
