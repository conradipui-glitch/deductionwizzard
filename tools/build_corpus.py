"""Generate source-anchored *test prompts*, not additional historical facts.

Each curated anchor is paraphrased into four explicitly annotated tasks.
The transformation labels are provisional until a human reviewer adjudicates them.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CASE=json.loads((ROOT/'cases/pushkin/casebook.json').read_text(encoding='utf-8'))
SOURCES={s['id']:s for s in CASE['sources']}

# Twelve additional checked institutional-page anchors; careful PARAPHRASES, not quotations.
ANCIENT=[
('rosetta-decree','Egypt','bm-rosetta','Декрет на Розеттском камне датируется 196 годом до н. э.','196 BCE'),
('rosetta-scripts','Egypt','bm-rosetta','Надпись на Розеттском камне использует иероглифическое, демотическое и греческое письмо.','196 BCE'),
('rosetta-priests','Egypt','bm-rosetta','Жрецы распространяли царские декреты в нескольких видах письма в период Птолемеев.','Ptolemaic period'),
('rosetta-canopus','Egypt','bm-rosetta','Канопский декрет был издан в 238 году до н. э.','238 BCE'),
('akhenaten-reign','Egypt','met-akhenaten','Эхнатон правил примерно в 1353–1336 годах до н. э.','ca. 1353–1336 BCE'),
('akhenaten-city','Egypt','met-akhenaten','Эхнатон основал новую столицу Ахетатон на месте современной Амарны.','14th century BCE'),
('akhenaten-name','Egypt','met-akhenaten','Аменхотеп IV изменил царское имя на Эхнатон.','14th century BCE'),
('akhenaten-aten','Egypt','met-akhenaten','При Эхнатоне официальный культ уделял исключительное внимание солнечному божеству Атону.','14th century BCE'),
('akhenaten-intermediary','Egypt','met-akhenaten','Царь и его семья занимали особое посредническое положение в культе Атона.','14th century BCE'),
('hatshepsut-pharaoh','Egypt','met-hatshepsut','Хатшепсут была женщиной-фараоном XVIII династии Египта.','ca. 1473–1458 BCE'),
('hatshepsut-statues','Egypt','met-hatshepsut','Некоторые статуи Хатшепсут следуют традиционной мужской иконографии фараона.','ca. 1473–1458 BCE'),
('hatshepsut-name','Egypt','met-hatshepsut','Надписи на статуях сохраняли имя Хатшепсут или женские грамматические формы.','ca. 1473–1458 BCE'),
]
EXTERNAL={
 'bm-rosetta':{'title':'British Museum — Hieroglyphs: unlocking ancient Egypt (gallery guide)','url':'https://www.britishmuseum.org/sites/default/files/2022-10/Hieroglyphs_unlocking_ancient_Egypt_large_print_guide_The_British_Museum.pdf','type':'museum_guide'},
 'met-akhenaten':{'title':'The Met — Art, Architecture, and the City in the Reign of Akhenaten','url':'https://www.metmuseum.org/essays/art-architecture-and-the-city-in-the-reign-of-amenhotep-iv-akhenaten-ca-1353-1336-b-c','type':'museum_essay'},
 'met-hatshepsut':{'title':'The Met — The Female Pharaoh Hatshepsut','url':'https://www.metmuseum.org/art/collection/search/544849','type':'museum_catalogue'}
}

def get_anchors():
 out=[]
 # The original casebook is from a prior research prototype and must be reaudited
 # before its source summaries become a scholarly database.
 for claim in CASE['claims']:
  if not claim['evidence']:
   continue
  sid=claim['evidence'][0]['source_id']; s=SOURCES[sid]
  out.append({'id':claim['id'],'topic':'Pushkin','statement':claim['text'],'source_id':sid,
     'source':{'title':s['title'],'url':s['locator'],'type':s['type']},'date_note':'see original casebook'})
 for id,topic,sid,statement,date in ANCIENT:
  out.append({'id':id,'topic':topic,'statement':statement,'source_id':sid,'source':EXTERNAL[sid], 'date_note':date})
 return out

def create_cases(anchors):
 out=[]
 for a in anchors:
  base={'anchor_id':a['id'],'topic':a['topic'],'source_id':a['source_id'],'source_url':a['source']['url'],
        'source_type':a['source']['type'],'date_note':a['date_note'],'generation_method':'source_anchored_test_transformation',
        'human_gold_reviewed':False,'source_summary_is_paraphrase':True}
  statement=a['statement']; src=a['source']['title']
  specs=[
    ('attestation','directly_documented',f'Публикация «{src}» сообщает: {statement}',f'Указанный источник содержит следующее сообщение: {statement}', 'Проверяет, отличает ли модель факт высказывания источника от объективной достоверности высказывания.'),
    ('exact_subject','directly_documented',f'Согласно краткому содержанию публикации «{src}»: {statement}',f'В кратком содержании источника описывается: {statement}', 'Проверка прямого смыслового соответствия перефразировок.'),
    ('hypothesis','interpretation_only',f'Сводка источника: {statement} Возможная дополнительная интерпретация исследователя: это часть единой скрытой программы влияния. Прямого свидетельства координации в приведённой сводке нет.', 'Упомянутая единая скрытая программа влияния существовала.', 'Это специально сконструированная модель интерпретации, а не утверждение реального историка.'),
    ('unsupported','insufficient_data',f'Исходное свидетельство сообщает только следующее: {statement} Сведений об авторстве неизвестных посланий, тайных мотивах и договорных действиях третьих лиц здесь нет.', 'Этот источник доказывает, что неизвестные участники координировали тайный заговор.', 'Нельзя выводить тайный сговор только из соседства фактов или предполагаемого мотива.')
  ]
  for variant,label,excerpt,proposed,why in specs:
   out.append({**base,'id':f'{a["id"]}-{variant}','variant':variant,'state':{'source_type':a['source']['type'],
       'source_title':src,'source_url':a['source']['url'],'excerpt':excerpt,'proposed_claim':proposed},
       'expected':label,'annotation_note':why})
 return out

def validate(data):
 assert len(data['anchors'])==22, '22 source-anchored facts expected'
 assert len(data['examples'])==88, '4 variants per 22 anchors expected'
 assert len({e['id'] for e in data['examples']})==len(data['examples'])
 for e in data['examples']:
  assert e['expected'] in {'directly_documented','accusation_only','interpretation_only','insufficient_data'}
  assert e['source_url'].startswith('https://')
  assert e['source_url']==e['state']['source_url']
  assert not e['human_gold_reviewed']
 return True

if __name__=='__main__':
 doc={'schema_version':'0.1','purpose':'Adversarial model QA only; NOT historical evidence, NOT independently reviewed gold labels',
      'source_groups':['Pushkin 1836-1837 casebook — needs independent source audit','British Museum Rosetta','Met Akhenaten','Met Hatshepsut'],
      'anchors':get_anchors(),'examples':create_cases(get_anchors())}
 validate(doc)
 output=ROOT/'benchmark/historical_qa_88.json';output.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f"{len(doc['examples'])} QA prompts generated from {len(doc['anchors'])} source anchors: {output}")
