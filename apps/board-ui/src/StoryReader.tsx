import React,{useMemo,useState} from 'react';
import {BookOpen,ChevronLeft,ChevronRight,FileText,GitBranch,Layers3,X,CheckCircle2,Info,ExternalLink,Eye} from 'lucide-react';
import storiesJson from '../../../cases/pushkin/stories.json';
import {casebook} from './data';
import './story.css';

type Scene={id:string;event_id:string;eyebrow:string;title:string;body:string;art:string;claim_ids:string[];branches:Record<string,string>};
const scenes=storiesJson.scenes as Scene[];
type Props={onClose:()=>void;onFocus:(id:string)=>void;initialHyp:string};
function StoryArt({scene}:{scene:Scene}){
 const kind=scene.art, letter=['letter','anonymous','manuscript'].includes(kind);
 const people=['salon','ball','wedding','palace'].includes(kind);
 const duel=kind==='duel';
 return <svg viewBox="0 0 800 500" className="story-art-svg" role="img" aria-label={'Художественная реконструкция: '+scene.title}>
 <defs><linearGradient id="art-back" x1="0" y1="0" x2="1" y2="1"><stop stopColor={duel?'#243748':'#3c3029'}/><stop offset=".55" stopColor={duel?'#607080':'#98724c'}/><stop offset="1" stopColor="#191612"/></linearGradient><radialGradient id="art-lamp"><stop stopColor="#f6c881" stopOpacity=".65"/><stop offset="1" stopColor="#de9952" stopOpacity="0"/></radialGradient><linearGradient id="art-paper"><stop stopColor="#f0dfb7"/><stop offset="1" stopColor="#ab8e64"/></linearGradient></defs>
 <rect width="800" height="500" fill="url(#art-back)"/><ellipse cx="400" cy="140" rx="480" ry="360" fill="url(#art-lamp)"/>
 {people&&<g opacity=".52" stroke="#d8b98c" strokeWidth="5" fill="none"><path d="M15 390V85l95-60 100 60v305M240 390V65l160-50 150 50v325M580 390V90l99-60 101 60v300"/>{[70,315,470,690].map(x=><path key={x} d={'M'+(x-29)+' 330v-112q29-62 58 0v112'}/>) }</g>}
 {duel&&<g><circle cx="635" cy="95" r="48" fill="#ede3c8" opacity=".82"/><path d="M0 346q200-65 380 0t420-20v174H0z" fill="#c4c8be" opacity=".44"/><path d="M65 400l45-285 30 285M725 405l-35-305-30 305" stroke="#1f272e" fill="none" strokeWidth="14"/></g>}
 {letter&&<g transform="rotate(-7 400 250)"><rect x="140" y="50" width="520" height="400" rx="5" fill="url(#art-paper)" stroke="#ac8558" strokeWidth="5"/>{[135,174,211,248,286,323].map((y,i)=><path key={y} d={'M180 '+y+'h'+(i%2?385:330)} stroke="#7b654b" strokeWidth="4" opacity=".4"/>)}<path d="M185 384q110-80 200 0t140-15" stroke="#76523a" strokeWidth="5" fill="none"/><circle cx="570" cy="371" r="44" fill="#9c5142"/><circle cx="570" cy="371" r="27" stroke="#c8896c" fill="none" strokeWidth="4"/></g>}
 {people&&<g><path d="M0 452h800v48H0Z" fill="#2a201b"/><path d="M280 467q-10-152 113-170 140 8 134 170" fill="#28262c"/><ellipse cx="400" cy="233" rx="70" ry="86" fill="#ac8268"/><path d="M325 212q-13-109 77-118 92 13 69 136-30-59-56-62-44 45-90 44" fill="#29221f"/><path d="M372 258q28 14 58 0M358 306l40 86 45-86" stroke="#654132" fill="none" strokeWidth="5"/></g>}
 {duel&&[238,558].map((x,i)=><g key={x} transform={'translate('+x+',0)'}><path d="M-78 500q20-185 80-194 60 10 76 194" fill={i?'#333036':'#252e37'}/><ellipse cx="0" cy="277" rx="40" ry="48" fill="#947662"/><path d="M-50 255q10-74 60-53 30 4 40 60" fill="#292525"/><path d={i?'M-45 345l-120-42':'M45 345l120-42'} fill="none" stroke="#191918" strokeWidth="19" strokeLinecap="round"/></g>)}
 {kind==='candle'&&<g><rect x="390" y="204" width="30" height="210" fill="#ebdebb"/><path d="M405 206q-48-65 0-136 47 70 0 136" fill="#f8c671"/><ellipse cx="405" cy="280" rx="140" ry="160" fill="url(#art-lamp)"/><rect x="320" y="414" width="190" height="18" fill="#a68760"/></g>}
 <rect x="24" y="24" width="752" height="452" fill="none" stroke="#ecd3ae" strokeOpacity=".4" strokeWidth="2"/>
 <text x="45" y="462" fill="#eed3a6" fontFamily="Georgia,serif" fontSize="15" letterSpacing="2">ХУДОЖЕСТВЕННАЯ РЕКОНСТРУКЦИЯ · НЕ ФОТОГРАФИЯ</text>
 </svg>;
}
export function DossierPortrait({name}:{name:string}){
 const hash=[...name].reduce((v,ch)=>v+ch.charCodeAt(0),0);
 return <svg className="dw-mini-portrait" viewBox="0 0 100 100" role="img" aria-label={'Условный художественный силуэт персонажа: '+name}>
 <rect width="100" height="100" fill="#786049"/><path d="M6 102q7-35 30-41h30q30 15 30 41Z" fill="#2d3134"/><path d="M38 66l13 29 13-29-13-6z" fill="#b8a38a"/><ellipse cx="51" cy="40" rx="24" ry="31" fill="#a68369"/><path d="M26 40q-11-29 8-36 34-16 47 11l-4 25q-18-22-24-21-19 18-27 21" fill={hash%2?'#342b29':'#504032'}/><path d="M38 45h9m13 0h8M50 48l-4 11m-5 9q10 4 21 0" stroke="#614335" strokeWidth="2" fill="none"/><rect x="5" y="5" width="90" height="90" fill="none" stroke="#e1c59c" strokeWidth="2"/></svg>
}
type PublishedStory={id:string;title:string;filename:string;hypotheses:string[];scenes:string[];status:string};
type GeneratedDoc={title:string;intro:string;chapters:Array<{scene_id:string;documented:string;reconstruction:string}>;conclusion:string;status:string};
type WizardStage='select'|'review'|'read';
export default function StoryReader({onClose,onFocus,initialHyp}:Props){
 const [stage,setStage]=useState<WizardStage>('select');
 const [mode,setMode]=useState<'slides'|'book'>('slides');
 const [hyps,setHyps]=useState<string[]>(initialHyp?[initialHyp]:[]);
 const [sceneIds,setSceneIds]=useState<string[]>(scenes.map(s=>s.id));
 const [index,setIndex]=useState(0);
 const [customInput,setCustomInput]=useState('');
 const [customHypotheses,setCustomHypotheses]=useState<string[]>(()=>{
   try{return JSON.parse(localStorage.getItem('dw-custom-hypotheses')||'[]') as string[];}catch{return [];}
 });
 const [notes,setNotes]=useState<Record<string,string>>({});
 const [generatedList,setGeneratedList]=useState<PublishedStory[]>([]);
 const [generatedDoc,setGeneratedDoc]=useState<GeneratedDoc|null>(null);
 const [guidance,setGuidance]=useState(false);
 const currentScenes=useMemo(()=>scenes.filter(s=>sceneIds.includes(s.id)),[sceneIds]);
 const chosenNames=hyps.map(id=>casebook.hypotheses.find(h=>h.id===id)?.statement||id);
 const current=currentScenes[Math.min(index,Math.max(0,currentScenes.length-1))];
 const selectedClaims=new Set(currentScenes.flatMap(s=>s.claim_ids));
 const currentAsses=casebook.assessments.filter(a=>hyps.includes(a.hypothesis_id)&&selectedClaims.has(a.claim_id));
 const toggleHyp=(id:string)=>setHyps(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 const toggleScene=(id:string)=>{setSceneIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);setIndex(0)};
 const dateFor=(s:Scene)=>casebook.events.find(e=>e.id===s.event_id)?.time?.original||'Дата не установлена';
 const addCustom=()=>{
   const name=customInput.trim().slice(0,180);
   if(!name||customHypotheses.includes(name)||customHypotheses.length>=2)return;
   const next=[...customHypotheses,name];setCustomHypotheses(next);
   localStorage.setItem('dw-custom-hypotheses',JSON.stringify(next));setCustomInput('');
 };
 const removeCustom=(name:string)=>{
   const next=customHypotheses.filter(x=>x!==name);
   setCustomHypotheses(next);localStorage.setItem('dw-custom-hypotheses',JSON.stringify(next));
 };
 const loadGenerated=()=>{
   fetch(import.meta.env.BASE_URL+'generated/index.json',{cache:'no-store'})
    .then(res=>res.ok?res.json():[]).then(json=>setGeneratedList(Array.isArray(json)?json:[]))
    .catch(()=>setGeneratedList([]));
 };
 useEffect(loadGenerated,[]);
 const pickGenerated=(item:PublishedStory)=>{
   fetch(import.meta.env.BASE_URL+'generated/'+encodeURIComponent(item.filename),{cache:'no-store'})
    .then(res=>{if(!res.ok)throw new Error('No published story');return res.json();})
    .then(doc=>{setGeneratedDoc(doc as GeneratedDoc);setStage('read');setIndex(0);})
    .catch(()=>setGeneratedDoc(null));
 };
 const startReading=()=>{setGeneratedDoc(null);setStage('read');setIndex(0)};
 const makeIssue=()=>{
   const noteText=hyps.map(h=>notes[h]?casebook.hypotheses.find(x=>x.id===h)?.statement+': '+notes[h]:'').filter(Boolean).join(' | ');
   const customText=customHypotheses.length?customHypotheses.map(s=>'Новая версия (непроверенная): '+s).join(' | '):'';
   const note=[noteText,customText].filter(Boolean).join(' | ').slice(0,350);
   const config={hypotheses:hyps,scenes:currentScenes.map(s=>s.id),custom_hypotheses:customHypotheses,note};
   const issueTitle='[DW STORY] Новая реконструкция: '+(chosenNames[0]||customHypotheses[0]||'документальная версия').slice(0,75);
   const issueBody='Запрос из Deduction Wizard. Сюжет будет опубликован как НЕПРОВЕРЕННЫЙ ЧЕРНОВИК.\n\nDW_STORY_REQUEST: '+JSON.stringify(config)+'\n\nПодтвердите создание задачи на GitHub: автоматический генератор запустится только для владельца репозитория.';
   window.open('https://github.com/conradipui-glitch/deductionwizzard/issues/new?title='+encodeURIComponent(issueTitle)+'&body='+encodeURIComponent(issueBody),'_blank','noopener,noreferrer');
 };
 const sceneContent=(scene:Scene)=>{
  const chapter=generatedDoc?.chapters.find(ch=>ch.scene_id===scene.id);
  const claims=scene.claim_ids.map(id=>casebook.claims.find(c=>c.id===id)).filter(c=>c!==undefined);
  const sourceIds=[...new Set(claims.flatMap(c=>c!.evidence.map(e=>e.source_id)))];
  const sourceList=sourceIds.map(id=>casebook.sources.find(s=>s.id===id)).filter(s=>s!==undefined);
  return <article key={scene.id} className="story-chapter">
   <div className="story-illustration"><StoryArt scene={scene}/></div>
   <div className="story-copy">
    <div className="story-eyebrow">{dateFor(scene)}</div>
    <h2>{scene.title}</h2>
    <div className="story-fact-head"><CheckCircle2 size={15}/> Что известно по документам</div>
    <p>{chapter?.documented||scene.body}</p>
    {chapter?<div className="story-branch">
       <div className="story-branch-name"><GitBranch size={15}/> Новая условная реконструкция · DeepSeek</div>
       <p>{chapter.reconstruction}</p>
      </div>:hyps.map(id=>scene.branches[id]?<div key={id} className="story-branch">
      <div className="story-branch-name"><GitBranch size={15}/> Версия: {casebook.hypotheses.find(h=>h.id===id)?.statement}</div>
      <p>{scene.branches[id]}</p></div>:null)}
    <div className="story-sources"><div><FileText size={14}/> ИСТОЧНИКИ (не подтверждают условные сцены)</div>
      {sourceList.map(src=><a key={src!.id} href={src!.locator} target="_blank" rel="noreferrer">{src!.title}<ExternalLink size={13}/></a>)}
      <button onClick={()=>{onClose();onFocus(scene.event_id)}}><Eye size={14}/> Найти событие на доске</button>
    </div>
   </div>
  </article>;
 };
 const selectedCounts=(hid:string)=>{
   const related=currentAsses.filter(a=>a.hypothesis_id===hid);
   const direct=related.filter(a=>a.stance==='supports').length;
   const compatible=related.filter(a=>a.stance==='compatible').length;
   const against=related.filter(a=>a.stance==='contradicts').length;
   return {direct,compatible,against,unrated:selectedClaims.size-related.length};
 };
 return <div className="story-overlay" role="dialog" aria-modal="true" aria-label="Мастер исторических реконструкций">
  <div className="story-bar">
   <div className="story-brand"><BookOpen size={20}/><div><small>DEDUCTION WIZARD · ДЕЛО №001</small><b>Конструктор историй</b></div></div>
   <button className="story-config" onClick={()=>setGuidance(!guidance)}><Info size={16}/> Как это работает?</button>
   <button className="story-close" onClick={onClose} aria-label="Закрыть"><X size={20}/></button>
  </div>
  <div className="wizard-progress">
   {([['select','1','Выбрать факты и версии'],['review','2','Проверить связки'],['read','3','Читать историю']] as const).map(([key,n,label])=>
    <button key={key} className={stage===key?'active':''} onClick={()=>{if(key==='read'){if(currentScenes.length>0)startReading()}else setStage(key)}}><span>{n}</span>{label}</button>
   )}
  </div>
  {guidance&&<div className="wizard-guide"><strong>Три простых действия.</strong> Выбираешь события — это документальная основа. Выбираешь гипотезы — это возможные объяснения, которые будем проверять, а не считать истинными. На следующем шаге увидишь подтверждения и пробелы, затем сможешь читать подготовленную историю или запросить новый рассказ у ИИ.<button onClick={()=>setGuidance(false)}>Понятно</button></div>}
  {stage==='select'&&<div className="wizard-scroll">
   <div className="wizard-intro"><small>ШАГ 1 ИЗ 3</small><h2>Из чего соберём историю?</h2><p>События — то, что мы можем привязать к источникам. Гипотезы — разные объяснения этих событий. Можно выбрать несколько версий, чтобы сравнить их, а не смешать с установленными фактами.</p></div>
   <div className="wizard-columns">
    <section className="wizard-section">
     <div className="wizard-section-head"><h3>Версии произошедшего</h3><span>{hyps.length} выбрано</span></div>
     <p>Отметь предполагаемых инициаторов или механизм. Галочка добавляет версию для проверки и условных сцен.</p>
     {casebook.hypotheses.map(h=><label key={h.id} className={'wizard-choice '+(hyps.includes(h.id)?'chosen':'')}>
      <input type="checkbox" checked={hyps.includes(h.id)} onChange={()=>toggleHyp(h.id)}/>
      <span><b>{h.statement}</b><small>Проверяемая версия · не доказанный факт</small></span>
     </label>)}
     <div className="wizard-new"><h4>Собственная версия <span>черновик</span></h4><p>Например: «Идалия действовала не одна, а через знакомых Геккерна». Пока это лишь твоя гипотеза, без оценки источников.</p>
      {customHypotheses.map(h=><div className="wizard-created" key={h}>{h}<button onClick={()=>removeCustom(h)} aria-label="Удалить черновик"><X size={14}/></button></div>)}
      <div className="wizard-new-input"><input value={customInput} onChange={e=>setCustomInput(e.target.value)} maxLength={180} placeholder="Запиши новую гипотезу..." onKeyDown={e=>{if(e.key==='Enter')addCustom()}}/><button onClick={addCustom} disabled={!customInput.trim()||customHypotheses.length>=2}>Добавить</button></div>
     </div>
    </section>
    <section className="wizard-section">
     <div className="wizard-section-head"><h3>Какие события включить?</h3><span>{sceneIds.length} из {scenes.length}</span></div>
     <p>Не знаешь, что выбирать? Оставь все 14: это даст полную хронологию. Снимай галочки только если хочешь изучить отдельный период.</p>
     <div className="wizard-event-options">{scenes.map(s=><label key={s.id} className={'wizard-event '+(sceneIds.includes(s.id)?'chosen':'')}><input type="checkbox" checked={sceneIds.includes(s.id)} onChange={()=>toggleScene(s.id)}/><span><b>{s.title}</b><small>{s.eyebrow}</small></span></label>)}</div>
     <button className="wizard-quiet" onClick={()=>{setSceneIds(scenes.map(s=>s.id));setIndex(0)}}>Выбрать все события</button>
    </section>
   </div>
   <div className="wizard-bottom"><span>Выбрано: {hyps.length+customHypotheses.length} версий · {currentScenes.length} событий</span><button className="wizard-primary" disabled={currentScenes.length<2} onClick={()=>setStage('review')}>Проверить сочетание <ChevronRight size={18}/></button></div>
  </div>}
  {stage==='review'&&<div className="wizard-scroll">
   <div className="wizard-intro"><small>ШАГ 2 ИЗ 3</small><h2>Что сходится, а что вызывает вопросы?</h2><p>Сравниваем только выбранные эпизоды. «Совместимо» не значит «подтверждено». Если источник не проверялся по отношению к версии, мы честно показываем пробел.</p></div>
   <div className="wizard-stats"><div><b>{currentScenes.length}</b><small>исторических эпизодов</small></div><div><b>{selectedClaims.size}</b><small>утверждений в эпизодах</small></div><div><b>{hyps.length+customHypotheses.length}</b><small>проверяемых версий</small></div></div>
   <div className="wizard-review-grid">{hyps.map(hid=>{const h=casebook.hypotheses.find(x=>x.id===hid),n=selectedCounts(hid);return <article className="wizard-review-card" key={hid}><div className="wizard-review-title"><GitBranch size={16}/><h3>{h?.statement}</h3></div><div className="wizard-evidence-bands"><span>Прямая поддержка: <b>{n.direct}</b></span><span>Совместимо: <b>{n.compatible}</b></span><span>Противоречит: <b>{n.against}</b></span><span>Не оценено: <b>{n.unrated}</b></span></div><p>{n.against?'Есть отмеченные противоречия — изучи соответствующие свидетельства.':'Отсутствие отмеченных противоречий не означает, что версия доказана.'} {n.unrated?'Часть утверждений ещё не проверена относительно этой версии.':''}</p><label className="wizard-note-label">Комментарий к связке<textarea rows={2} maxLength={160} value={notes[hid]||''} onChange={e=>setNotes(v=>({...v,[hid]:e.target.value}))} placeholder="Что здесь смущает? Что проверить?"/></label></article>})}
   {customHypotheses.map((h,i)=><article className="wizard-review-card wizard-draft" key={h}><div className="wizard-review-title"><GitBranch size={16}/><h3>{h}</h3></div><p>Новая гипотеза пока не сопоставлена со свидетельствами. Она будет включена в запрос как рабочее предположение, а не факт.</p><span className="wizard-pending">Не проверено · версия №{i+1}</span></article>)}
   {hyps.length+customHypotheses.length===0&&<article className="wizard-review-card"><h3>Только документы</h3><p>История будет построена по известным событиям без добавления объясняющих гипотез.</p></article>}</div>
   <div className="wizard-gaps"><Info size={18}/><div><b>Что ещё не установлено?</b><p>Не найден документ, который сам по себе устанавливал бы авторство анонимного пасквиля. Совпадение интересов участников не доказывает сговор. Эти пробелы должны оставаться видимыми и в новой истории.</p></div></div>
   <div className="wizard-bottom"><button className="wizard-quiet" onClick={()=>setStage('select')}><ChevronLeft size={16}/> Изменить выбор</button><div className="wizard-actions"><button className="wizard-primary subtle" onClick={startReading}>Читать подготовленную версию</button><button className="wizard-primary" disabled={currentScenes.length<2} onClick={makeIssue}>Запросить новую историю у DeepSeek <ExternalLink size={15}/></button></div></div>
   <p className="wizard-explain">Запрос через GitHub: сначала откроется заполненная задача, её нужно отправить. Генератор работает серверно с ключом репозитория. Когда история появится на сайте, она будет помечена как непроверенный ИИ-черновик.</p>
   <div className="wizard-published"><div><h3>Сгенерированные версии</h3><button className="wizard-quiet" onClick={loadGenerated}>Обновить список</button></div>{generatedList.length?generatedList.map(item=><button className="wizard-published-item" key={item.id} onClick={()=>pickGenerated(item)}>{item.title}<small>ИИ-черновик · прочитать <ChevronRight size={12}/></small></button>):<p>Пока ещё нет опубликованных ИИ-версий. Можно читать подготовленный рассказ или запросить новую.</p>}</div>
  </div>}
  {stage==='read'&&<><div className="wizard-readerbar"><button className="wizard-quiet" onClick={()=>{setStage('review');setGeneratedDoc(null)}}><ChevronLeft size={15}/> К проверке версии</button><div><strong>{generatedDoc?generatedDoc.title:'Подготовленная документальная история'}</strong><small>{generatedDoc?'Генерация DeepSeek · не проверена':'Редакторская версия · условные объяснения выделены'}</small></div><div className="story-switch"><button className={mode==='slides'?'active':''} onClick={()=>setMode('slides')}>Слайды</button><button className={mode==='book'?'active':''} onClick={()=>setMode('book')}>Полный текст</button></div></div>
   <div className="story-disclaimer"><Info size={14}/> Архивные сведения и реконструкция показаны отдельно. Не путай гипотезу и документ.</div>
   <div className={'story-content '+(mode==='book'?'story-book':'story-slides')}>
    {!currentScenes.length?<div className="story-empty">Сначала выбери эпизоды.</div>:mode==='slides'?current&&<div className="story-one" key={current.id}>{sceneContent(current)}</div>:<div className="story-full">{currentScenes.map(sceneContent)}</div>}
    {mode==='book'&&generatedDoc&&<div className="wizard-conclusion"><h3>Вывод и открытые вопросы</h3><p>{generatedDoc.conclusion}</p></div>}
   </div>
   {mode==='slides'&&<div className="story-bottom"><button onClick={()=>setIndex(i=>Math.max(0,i-1))} disabled={index===0}><ChevronLeft size={18}/> Назад</button><div className="story-progress"><span>{index+1} / {currentScenes.length}</span><div className="story-track"><div style={{width:((index+1)*100/Math.max(1,currentScenes.length))+'%'}}/></div></div><button onClick={()=>setIndex(i=>Math.min(currentScenes.length-1,i+1))} disabled={index>=currentScenes.length-1}>Далее <ChevronRight size={18}/></button></div>}
  </>}
 </div>;
}
