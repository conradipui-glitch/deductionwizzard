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
 {people&&<g opacity=".52" stroke="#d8b98c" strokeWidth="5" fill="none"><path d="M15 390V85l95-60 100 60v305M240 390V65l160-50 150 50v325M580 390V90l99-60 101 60v300"/>{[70,315,470,690].map(x=><path key={x} d={'M'+(x-29)+' 330v-112q29-62 58 0v112'})}</g>}
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
export default function StoryReader({onClose,onFocus,initialHyp}:Props){
 const [mode,setMode]=useState<'slides'|'book'>('slides');
 const [hyps,setHyps]=useState<string[]>(initialHyp?[initialHyp]:[]);
 const [sceneIds,setSceneIds]=useState<string[]>(scenes.map(s=>s.id));
 const [index,setIndex]=useState(0);
 const [composer,setComposer]=useState(false);
 const currentScenes=useMemo(()=>scenes.filter(s=>sceneIds.includes(s.id)),[sceneIds]);
 const current=currentScenes[Math.min(index,currentScenes.length-1)];
 const toggleHyp=(id:string)=>setHyps(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 const toggleScene=(id:string)=>{setSceneIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);setIndex(0)};
 const dateFor=(s:Scene)=>casebook.events.find(e=>e.id===s.event_id)?.time?.original||'Дата неизвестна';
 const renderScene=(scene:Scene)=>{
  const claims=scene.claim_ids.map(id=>casebook.claims.find(c=>c.id===id)).filter(c=>c!==undefined);
  const sourceIds=[...new Set(claims.flatMap(c=>c!.evidence.map(e=>e.source_id)))];
  const sources=sourceIds.map(id=>casebook.sources.find(s=>s.id===id)).filter(s=>s!==undefined);
  return <article key={scene.id} className="story-chapter">
   <div className="story-illustration"><StoryArt scene={scene}/></div>
   <div className="story-copy"><div className="story-eyebrow">{scene.eyebrow} · {dateFor(scene)}</div><h2>{scene.title}</h2>
    <div className="story-fact-head"><CheckCircle2 size={15}/> Документальный слой</div><p>{scene.body}</p>
    {hyps.map(id=>scene.branches[id]?<div key={id} className="story-branch"><div className="story-branch-name"><GitBranch size={15}/> Условная версия: {casebook.hypotheses.find(h=>h.id===id)?.statement}</div><p>{scene.branches[id]}</p></div>:null)}
    <div className="story-sources"><div><FileText size={14}/> ДОКУМЕНТЫ И ПРИМЕЧАНИЯ</div>{sources.map(s=><a href={s!.locator} target="_blank" rel="noreferrer" key={s!.id}>{s!.title}<ExternalLink size={13}/></a>)}
    <button onClick={()=>{onClose();onFocus(scene.event_id)}}><Eye size={14}/> На доску к событию</button></div>
   </div>
  </article>
 };
 return <div className="story-overlay" role="dialog" aria-modal="true" aria-label="Режим чтения исторических версий">
  <div className="story-bar"><div className="story-brand"><BookOpen size={20}/><div><small>DEDUCTION WIZARD · ДЕЛО №001</small><b>Прочитать историю</b></div></div>
   <div className="story-switch"><button className={mode==='slides'?'active':''} onClick={()=>setMode('slides')}>Слайды</button><button className={mode==='book'?'active':''} onClick={()=>setMode('book')}>Полный текст</button></div>
   <button className={composer?'story-config active':'story-config'} onClick={()=>setComposer(!composer)}><Layers3 size={16}/> Состав истории</button><button className="story-close" onClick={onClose} aria-label="Закрыть историю"><X size={20}/></button>
  </div>
  <div className="story-disclaimer"><Info size={14}/> Документы и возможные объяснения выделены отдельно. Совмещение гипотез не делает их доказанными.</div>
  {composer&&<div className="story-composer">
    <div><h3>Собрать собственную версию</h3><p>Выбери гипотезы и исторические эпизоды. Ненайденные свидетельства не будут придуманы.</p></div>
    <div className="story-composer-columns"><section><h4>Гипотезы</h4>{casebook.hypotheses.map(h=><label key={h.id}><input type="checkbox" checked={hyps.includes(h.id)} onChange={()=>toggleHyp(h.id)}/>{h.statement}</label>)}<button onClick={()=>setHyps([])}>Только документы</button></section>
     <section><h4>Эпизоды · {sceneIds.length} / {scenes.length}</h4><div className="story-event-picks">{scenes.map(s=><label key={s.id}><input type="checkbox" checked={sceneIds.includes(s.id)} onChange={()=>toggleScene(s.id)}/>{s.title}</label>)}</div><button onClick={()=>{setSceneIds(scenes.map(s=>s.id));setIndex(0)}}>Выбрать все</button></section></div>
    <button className="story-apply" onClick={()=>{setComposer(false);setIndex(0)}}>Применить <ChevronRight size={16}/></button>
   </div>}
  <div className={'story-content '+(mode==='book'?'story-book':'story-slides')}>
   {currentScenes.length===0?<div className="story-empty">Выбери хотя бы одно событие.</div>:mode==='slides'?current&&<div className="story-one" key={current.id}>{renderScene(current)}</div>:<div className="story-full">{currentScenes.map(renderScene)}</div>}
  </div>
  {mode==='slides'&&<div className="story-bottom"><button disabled={index<=0} onClick={()=>setIndex(i=>Math.max(i-1,0))}><ChevronLeft size={18}/> Назад</button><div className="story-progress"><span>{currentScenes.length?String(index+1)+' / '+currentScenes.length:'0 / 0'}</span><div className="story-track"><div style={{width:currentScenes.length?((index+1)*100/currentScenes.length)+'%':'0%'}}/></div></div><button disabled={index>=currentScenes.length-1} onClick={()=>setIndex(i=>Math.min(i+1,currentScenes.length-1))}>Далее <ChevronRight size={18}/></button></div>}
 </div>;
}
