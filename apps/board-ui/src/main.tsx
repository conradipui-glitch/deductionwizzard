import React, {useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BookOpen, GitBranch, LampDesk, ChevronDown, ArrowUpRight, Search, Filter, CalendarDays, Focus, Plus, Minus, RotateCcw, X, Layers3, Eye, Pin, FileText, ShieldCheck, HelpCircle, ZoomIn, Network, ScrollText, Clock, Fingerprint, ChevronRight, Sparkles, Archive, ExternalLink, Menu, Map as MapIcon, Grip, ListFilter} from 'lucide-react';
import {casebook,boardNodes,boardEdges,chronological} from './data';
import type {BoardNode,CaseClaim} from './types';
import './style.css';

type FilterName='all'|'person'|'event'|'source'|'hypothesis';
type Theme='cork'|'chalk';
const labels:Record<FilterName,string>={all:'Всё',person:'Люди',event:'События',source:'Документы',hypothesis:'Версии'};
const accents:Record<string,string>={person:'#c9a575',event:'#a5a9b5',source:'#b3aa91',hypothesis:'#a86c57'};
const initials=(s:string)=>s.split(' ').map(x=>x[0]).filter(Boolean).slice(0,2).join('');
const idsToClaims=(ids:string[])=>ids.map(id=>casebook.claims.find(c=>c.id===id)).filter((x):x is CaseClaim=>Boolean(x));
const prettyDate=(d:{year:number;month?:number;day?:number})=>`${String(d.day||1).padStart(2,'0')}.${String(d.month||1).padStart(2,'0')}.${d.year}`;
function App(){
 const [theme,setTheme]=useState<Theme>('cork');
 const [filter,setFilter]=useState<FilterName>('all');
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<string|null>('event-pasquille');
 const [activeHyp,setActiveHyp]=useState('h-heckern');
 const [timeLimit,setTimeLimit]=useState(chronological.length);
 const [view,setView]=useState({x:-120,y:-180,s:.74});
 const [positions,setPositions]=useState<Record<string,{x:number;y:number}>>({});
 const [light,setLight]=useState(true);
 const [asideOpen,setAsideOpen]=useState(true);
 const [detailsOpen,setDetailsOpen]=useState(true);
 const [showLinks,setShowLinks]=useState(true);
 const [heatOpen,setHeatOpen]=useState(false);
 const [showAllClaims,setShowAllClaims]=useState(false);
 const drag=useRef<{kind:'pan'|'card';id?:string;px:number;py:number;ox:number;oy:number}|null>(null);
 const viewport=useRef<HTMLDivElement>(null);
 const nodeById=useMemo(()=>new Map(boardNodes.map(n=>[n.id,n])),[]);
 const revealed=new Set(chronological.slice(0,timeLimit).map(x=>x.id));
 const visible=boardNodes.filter(n=>(filter==='all'||n.type===filter)&& (n.type!=='event'||revealed.has(n.id)) && (!query||`${n.title} ${n.subtitle}`.toLowerCase().includes(query.toLowerCase())));
 const visibleIds=new Set(visible.map(n=>n.id));
 const highlighted=new Set<string>(selected?[selected]:[]);
 if(selected){boardEdges.filter(e=>e.from===selected||e.to===selected).forEach(e=>{highlighted.add(e.from);highlighted.add(e.to);});}
 const edges=boardEdges.filter(e=>visibleIds.has(e.from)&&visibleIds.has(e.to)&& (showLinks||(selected&&(e.from===selected||e.to===selected))));
 const selectedNode=selected?nodeById.get(selected):null;
 const selectedClaims=selectedNode?idsToClaims(selectedNode.claimIds):[];
 const selectedEvent=casebook.events.find(e=>e.id===selected);
 const selectedHyp=casebook.hypotheses.find(h=>h.id===selected);
 const selectedPerson=casebook.entities.find(e=>e.id===selected);
 const selectedSource=casebook.sources.find(e=>e.id===selected);
 const currentHyp=casebook.hypotheses.find(h=>h.id===activeHyp)||casebook.hypotheses[0];
 const activeAssessments=casebook.assessments.filter(a=>a.hypothesis_id===activeHyp);
 const assessedIds=new Set(casebook.assessments.map(a=>a.claim_id));
 const matrixClaims=casebook.claims.filter(c=>showAllClaims||assessedIds.has(c.id));
 const heatAssessment=(hid:string,cid:string)=>casebook.assessments.find(a=>a.hypothesis_id===hid&&a.claim_id===cid);
 const heatLabels:Record<string,string>={supports:'Поддерживает',contradicts:'Противоречит',compatible:'Совместимо',unknown:'Не определяет'};
 const heatCounts=(hid:string)=>casebook.assessments.filter(a=>a.hypothesis_id===hid).reduce((acc,a)=>({...acc,[a.stance]:(acc[a.stance]||0)+1}),{} as Record<string,number>);
 const inspectClaim=(claim:CaseClaim)=>{
   const event=casebook.events.find(e=>e.claim_ids.includes(claim.id));
   const entity=casebook.entities.find(e=>claim.about.includes(e.id));
   if(event||entity)focusNode((event||entity)!.id);
   setHeatOpen(false);
 };
 const pos=(id:string)=>{const n=nodeById.get(id);return positions[id]||{x:n?.x||0,y:n?.y||0};};
 const panStart=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.button!==0)return;drag.current={kind:'pan',px:e.clientX,py:e.clientY,ox:view.x,oy:view.y};e.currentTarget.setPointerCapture(e.pointerId);};
 const panMove=(e:React.PointerEvent<HTMLDivElement>)=>{if(drag.current?.kind!=='pan')return;setView(v=>({...v,x:drag.current!.ox+e.clientX-drag.current!.px,y:drag.current!.oy+e.clientY-drag.current!.py}));};
 const endDrag=()=>{drag.current=null;};
 const startCard=(e:React.PointerEvent<HTMLButtonElement>,n:BoardNode)=>{if(e.button!==0)return;e.stopPropagation();const p=pos(n.id);drag.current={kind:'card',id:n.id,px:e.clientX,py:e.clientY,ox:p.x,oy:p.y};e.currentTarget.setPointerCapture(e.pointerId);setSelected(n.id);setDetailsOpen(true);};
 const moveCard=(e:React.PointerEvent<HTMLButtonElement>)=>{if(drag.current?.kind!=='card')return;const d=drag.current;setPositions(p=>({...p,[d.id!]:{x:d.ox+(e.clientX-d.px)/view.s,y:d.oy+(e.clientY-d.py)/view.s}}));};
 const zoom=(next:number)=>setView(v=>{const s=Math.min(1.48,Math.max(.35,next));const el=viewport.current;const w=el?.clientWidth||1050,h=el?.clientHeight||720;return {x:w/2-(w/2-v.x)*s/v.s,y:h/2-(h/2-v.y)*s/v.s,s};});
 const reset=()=>{setView({x:-120,y:-180,s:.74});setPositions({});};
 const onWheel=(e:React.WheelEvent<HTMLDivElement>)=>{if(e.ctrlKey||e.metaKey){zoom(view.s*(e.deltaY>0?.9:1.1));}else{setView(v=>({...v,x:v.x-e.deltaX,y:v.y-e.deltaY}));}};
 const focusNode=(id:string)=>{const p=pos(id),w=viewport.current?.clientWidth||900,h=viewport.current?.clientHeight||650;setView(v=>({...v,x:w/2-(p.x+116)*v.s,y:h/2-(p.y+60)*v.s}));setSelected(id);setDetailsOpen(true);};
 const evidenceFor=(c:CaseClaim)=>c.evidence.map(e=>casebook.sources.find(s=>s.id===e.source_id)).filter(x=>x!==undefined);
 return <div className={`app theme-${theme} ${light?'lamp-on':''}`}>
  <header className="app-header">
   <div className="brand-mark"><Fingerprint size={22} strokeWidth={1.3}/></div>
   <div className="brand-copy"><div className="brand-title">DEDUCTION <span>WIZARD</span></div><div className="brand-kicker">ИСТОРИЯ НЕ ТЕРПИТ ДОГАДОК БЕЗ УЛИК</div></div>
   <div className="header-divider"/>
   <button className="case-picker" onClick={()=>setAsideOpen(!asideOpen)} aria-label="Показать дела"><span className="case-number">ДЕЛО № 001</span><span className="case-name">Последняя дуэль Пушкина</span><ChevronDown size={15}/></button>
   <div className="header-spacer"/>
   <div className="header-status"><span className="status-dot"/> ИССЛЕДОВАНИЕ ОТКРЫТО</div>
   <button className="icon-btn header-action" title="Переключить свет" onClick={()=>setLight(!light)}><LampDesk size={19}/></button>
   <button className="icon-btn header-action" title="Показать карточку дела" onClick={()=>setDetailsOpen(!detailsOpen)}><Layers3 size={19}/></button>
  </header>
  <div className="app-shell">
   <aside className={`left-pane ${asideOpen?'is-open':''}`}>
    <div className="pane-top"><div className="micro">АРХИВ ИССЛЕДОВАНИЙ</div><button className="icon-btn compact only-mobile" onClick={()=>setAsideOpen(false)}><X size={16}/></button></div>
    <div className="case-list-item active"><div className="case-number-badge">01</div><div><b>Последняя дуэль</b><small>Пушкин · 1833–1837</small></div><ChevronRight size={16}/></div>
    <div className="other-case"><Archive size={16}/><span>Другие дела появятся здесь</span></div>
    <div className="pane-rule"/>
    <div className="list-title"><span>КАТЕГОРИИ</span><span className="list-count">{boardNodes.length}</span></div>
    <div className="filter-list">{(['all','person','event','source','hypothesis'] as FilterName[]).map(type=><button key={type} className={`filter-item ${filter===type?'active':''}`} onClick={()=>{setFilter(type);setAsideOpen(false);}}><span className={`filter-symbol type-${type}`}>{type==='person'?<Eye size={15}/>:type==='event'?<CalendarDays size={15}/>:type==='source'?<FileText size={15}/>:type==='hypothesis'?<GitBranch size={15}/>:<Layers3 size={15}/>}</span><span>{labels[type]}</span><span className="count">{type==='all'?boardNodes.length:boardNodes.filter(n=>n.type===type).length}</span></button>)}</div>
    <div className="pane-rule"/>
    <div className="list-title"><span>ВЕРСИИ СОБЫТИЙ</span><span className="list-count">{casebook.hypotheses.length.toString().padStart(2,'0')}</span></div>
    <div className="hyp-list">{casebook.hypotheses.map((h,i)=><button key={h.id} className={`hyp-item ${activeHyp===h.id?'current':''}`} onClick={()=>{setActiveHyp(h.id);focusNode(h.id);setAsideOpen(false);}}><span className="hyp-index">0{i+1}</span><span>{h.statement}</span></button>)}</div>
    <div className="sidebar-bottom"><div className="protocol-note"><ShieldCheck size={16}/><div><b>Протокол источников активен</b><p>Гипотеза не равна факту. Каждое утверждение должно иметь след.</p></div></div><a href="https://github.com/conradipui-glitch/deductionwizzard" rel="noreferrer" target="_blank" className="repository-link">ИССЛЕДОВАТЕЛЬСКИЙ РЕПОЗИТОРИЙ <ArrowUpRight size={14}/></a></div>
   </aside>
   <main className="stage">
    <div className="stage-heading"><div><div className="eyebrow"><span className="small-line"/> КАРТА РАССЛЕДОВАНИЯ / ЧАСТЬ I</div><h1>Тени на Чёрной речке</h1><p>Петербург, 1833–1837. Документы, люди, события и конкурирующие объяснения.</p></div><div className="stage-actions"><button className="utility" onClick={()=>setTheme(theme==='cork'?'chalk':'cork')}><span className="small-circle"/>{theme==='cork'?'Меловая доска':'Пробковая доска'}</button><button className={`utility ${heatOpen?'toggled':''}`} onClick={()=>setHeatOpen(!heatOpen)} aria-pressed={heatOpen}><ListFilter size={15}/> Матрица гипотез</button><button className={`utility ${showLinks?'toggled':''}`} onClick={()=>setShowLinks(!showLinks)}><Network size={15}/> Связи</button></div></div>
    <div className="board-window" ref={viewport} onWheel={onWheel} onPointerDown={panStart} onPointerMove={panMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
     <div className="lamp-pool"/>
     <div className="board-world" style={{transform:`translate(${view.x}px, ${view.y}px) scale(${view.s})`}}>
      <div className="world-caption cap-one">АРХИВ / 1836</div><div className="world-caption cap-two">НЕОКОНЧЕННОЕ ДЕЛО</div><div className="world-caption cap-three">АРХИВ / 1833—1837 · НОВЫЕ СВИДЕТЕЛЬСТВА</div>
      <svg className="strings" width="3050" height="2180" viewBox="0 0 3050 2180" aria-hidden="true">
       <defs><filter id="cord-shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity=".5"/></filter></defs>
       {edges.map(e=>{const a=pos(e.from),b=pos(e.to);const x1=a.x+115,y1=a.y+61,x2=b.x+115,y2=b.y+61;const lit=selected&&(selected===e.from||selected===e.to);return <g key={e.id} className={`connection edge-${e.type} ${lit?'highlight':''} ${selected&&!lit?'muted':''}`}><path d={`M ${x1} ${y1} Q ${(x1+x2)/2+16} ${(y1+y2)/2+26} ${x2} ${y2}`}/>{lit&&<circle cx={x2} cy={y2} r="5"/>}</g>})}
      </svg>
      {visible.map((n,i)=>{const p=pos(n.id),lit=highlighted.has(n.id);return <button className={`pin-card card-${n.type} ${selected===n.id?'selected':''} ${selected&&!lit?'slightly-dim':''}`} key={n.id} style={{left:p.x,top:p.y,'--turn':`${(i%5-2)*.65}deg`,'--card-accent':accents[n.type]} as React.CSSProperties} onPointerDown={e=>startCard(e,n)} onPointerMove={moveCard} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={()=>{setSelected(n.id);setDetailsOpen(true);}} title={`${n.title} · перетащите карточку`}><span className="pushpin"/><span className="card-category">{n.type==='person'?'ДЕЙСТВУЮЩЕЕ ЛИЦО':n.type==='event'?'СОБЫТИЕ':n.type==='source'?'ИСТОЧНИК':'ГИПОТЕЗА'}</span>{n.type==='person'?<div className="portrait"><span>{initials(n.title)}</span><i/></div>:n.type==='event'?<div className="event-figure"><CalendarDays size={24} strokeWidth={1.25}/></div>:n.type==='source'?<div className="event-figure"><ScrollText size={27} strokeWidth={1.2}/></div>:<div className="event-figure"><HelpCircle size={27} strokeWidth={1.3}/></div>}<strong>{n.title}</strong><span className="card-subtitle">{n.subtitle}</span>{n.type==='hypothesis'&&<span className="hypothetical">ТРЕБУЕТ ПРОВЕРКИ</span>}</button>})}
     </div>
     <div className="board-top-meta"><span className="live-mark"/> СЛОЙ СВИДЕТЕЛЬСТВ <span>•</span> СТАРЫЙ СТИЛЬ В ДАТАХ</div>
     {heatOpen&&<section className="heat-panel" aria-label="Матрица свидетельств и гипотез" onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>
  <div className="heat-top"><div><span className="micro">СРАВНЕНИЕ ВЕРСИЙ · EVIDENCE MATRIX</span><h2>Тепловая карта свидетельств</h2><p>Цвет показывает <strong>тип отношения</strong> документа к гипотезе, не вероятность виновности.</p></div><button onClick={()=>setHeatOpen(false)} className="heat-close" aria-label="Закрыть матрицу"><X size={18}/></button></div>
  <div className="heat-legend"><span><i className="heat-box supports"/>Поддерживает</span><span><i className="heat-box contradicts"/>Противоречит</span><span><i className="heat-box compatible"/>Совместимо</span><span><i className="heat-box unknown"/>Не определяет</span><span><i className="heat-box not-assessed"/>Не проверено</span></div>
  <div className="heat-scroll"><table className="heat-table"><thead><tr><th>Утверждение / источник</th>{casebook.hypotheses.map((h,i)=><th key={h.id}><button className={activeHyp===h.id?'heat-active':''} onClick={()=>setActiveHyp(h.id)}>ВЕРСИЯ {i+1}<small>{h.statement}</small></button></th>)}</tr></thead><tbody>{matrixClaims.map(c=><tr key={c.id}><td><button className="heat-claim" onClick={()=>inspectClaim(c)}>{c.text}<small>{c.evidence.map(e=>casebook.sources.find(s=>s.id===e.source_id)?.title).filter(Boolean).join(' · ')||'Источник не указан'}</small></button></td>{casebook.hypotheses.map(h=>{const a=heatAssessment(h.id,c.id);return <td key={h.id}><button title={a?.rationale||'Оценка ещё не проведена'} aria-label={`${h.statement}: ${a?heatLabels[a.stance]:'не проверено'}`} className={`heat-cell ${a?.stance||'not-assessed'}`} onClick={()=>{setActiveHyp(h.id);setSelected(h.id);setDetailsOpen(true);}}>{a?heatLabels[a.stance]:'—'}</button></td>})}</tr>)}</tbody></table></div>
  <div className="heat-bottom"><label><input type="checkbox" checked={showAllClaims} onChange={e=>setShowAllClaims(e.target.checked)}/> Показать также неоценённые утверждения ({casebook.claims.length})</label><div>Оценено: {casebook.assessments.length} связей · пустая ячейка означает отсутствие оценки · <b>нет автоматического победителя</b></div></div>
  <div className="heat-summary">{casebook.hypotheses.map(h=>{const n=heatCounts(h.id);return <button key={h.id} className={activeHyp===h.id?'heat-summary-active':''} onClick={()=>setActiveHyp(h.id)}><b>{h.statement}</b><small>Поддержка: {n.supports||0} · Против: {n.contradicts||0} · Совместимо: {n.compatible||0} · Неясно: {n.unknown||0}</small></button>})}</div>
 </section>}
 <div className="board-help"><Grip size={15}/> Тяните доску для перемещения · колесо — панорама · Ctrl+колесо — масштаб</div>
     <div className="zoom-controls"><button onClick={()=>zoom(view.s*1.14)} title="Приблизить"><Plus size={17}/></button><span>{Math.round(view.s*100)}%</span><button onClick={()=>zoom(view.s/1.14)} title="Отдалить"><Minus size={17}/></button><button onClick={reset} title="Сбросить расположение"><RotateCcw size={17}/></button></div>
    </div>
    <div className="timeline-strip"><div className="timeline-label"><Clock size={15}/><span>ЛЕНТА ВРЕМЕНИ</span></div><input aria-label="Показать события до выбранного момента" type="range" min="0" max={chronological.length} value={timeLimit} onChange={e=>setTimeLimit(Number(e.target.value))}/><div className="timeline-date">{timeLimit===chronological.length?'ВСЕ СОБЫТИЯ':timeLimit===0?'ДО НАЧАЛА ДЕЛА':chronological[timeLimit-1]?.time?.original||'БЕЗ ДАТЫ'}</div><button className="timeline-all" onClick={()=>setTimeLimit(chronological.length)}>Все</button></div>
    <div className="stage-footer"><span>{casebook.entities.length} ЛИЦ · {casebook.events.length} СОБЫТИЙ · {casebook.sources.length} ИСТОЧНИКА · {casebook.hypotheses.length} ГИПОТЕЗЫ</span><span>ОЦЕНКИ ПОКАЗЫВАЮТ КАЧЕСТВО СВИДЕТЕЛЬСТВ, НЕ ВЕРОЯТНОСТЬ ВИНЫ</span></div>
   </main>
   <aside className={`inspector ${detailsOpen?'is-open':''}`}><div className="inspect-head"><div><span className="micro">КАРТОЧКА ДОСЬЕ</span><h2>{selectedNode?'Детали материала':'Выберите материал'}</h2></div><button className="icon-btn compact" onClick={()=>setDetailsOpen(false)}><X size={18}/></button></div>
    {selectedNode?<div className="inspector-scroll"><div className="file-stamp"><span>DW / {selectedNode.id.toUpperCase()}</span><span className="file-type">{labels[selectedNode.type]}</span></div><h3>{selectedNode.title}</h3><div className="inspector-legend"><span className="status-ring"/> {selectedNode.type==='hypothesis'?'Не подтверждено':selectedNode.type==='person'?'Профиль участника':'Проверяется по источникам'}</div>
       {selectedEvent&&<div className="date-panel"><CalendarDays size={18}/><div><span>ДАТА СОБЫТИЯ</span><b>{selectedEvent.time?.original||'Не установлена'}</b><small>{selectedEvent.time?.earliest?`Нормализовано: ${prettyDate(selectedEvent.time.earliest)} по григорианскому календарю`:''}</small></div></div>}
       {selectedPerson&&<div className="side-profile"><span className="big-profile">{initials(selectedPerson.name)}</span><p>В материалах дела упоминается в {selectedClaims.length} утверждениях. Связи не означают участия в преступлении.</p></div>}
       {selectedHyp&&<div className="hyp-callout"><div className="micro">КРИТИЧЕСКАЯ ПРОВЕРКА</div><p>{selectedHyp.discriminating_test}</p></div>}
       {selectedSource&&<a href={selectedSource.locator} target="_blank" rel="noreferrer" className="source-visit">Открыть архивный источник <ExternalLink size={14}/></a>}
       <div className="inspect-section-title"><span>УТВЕРЖДЕНИЯ И СВИДЕТЕЛЬСТВА</span><span>{selectedClaims.length}</span></div>
       {selectedClaims.length?selectedClaims.map(c=><article key={c.id} className="claim-card"><div className="claim-type"><span className={`claim-dot ${c.status}`}/>{c.status==='attested'?'Зафиксировано в источнике':c.status==='contested'?'Оспаривается':'Не установлено'}</div><p>{c.text}</p>{evidenceFor(c).length>0&&<div className="claim-sources">{evidenceFor(c).map(s=><a key={s.id} href={s.locator} rel="noreferrer" target="_blank"><BookOpen size={13}/> {s.title}<ArrowUpRight size={12}/></a>)}</div>}</article>):<p className="empty-note">Прямых утверждений в текущем корпусе нет. Это не доказательство отсутствия участия.</p>}
       {selectedHyp&&<div className="assumptions"><div className="inspect-section-title">НЕПРОВЕРЕННЫЕ ПРЕДПОСЫЛКИ</div>{selectedHyp.assumptions.map((a,i)=><p key={i}>— {a}</p>)}</div>}
       <div className="fine-print"><ShieldCheck size={16}/> Эта карточка отражает лишь сведения текущего корпуса и может измениться при новых источниках.</div>
      </div>:<div className="empty-inspector"><Focus size={40}/><p>Выберите заметку, документ или персонажа на доске.</p></div>}
    <div className="inspect-bottom"><div className="inspect-section-title">АКТИВНАЯ ВЕРСИЯ</div><button className="bottom-hyp" onClick={()=>focusNode(currentHyp?.id||'h-heckern')}><GitBranch size={17}/><span>{currentHyp?.statement}</span><ChevronRight size={17}/></button><div className="assessment-line">{activeAssessments.length} связей с утверждениями · вывод не вынесен</div></div>
   </aside>
  </div>
  <div className="mobile-controls"><button onClick={()=>setAsideOpen(!asideOpen)}><Menu size={18}/> Архив</button><button onClick={()=>setDetailsOpen(!detailsOpen)}><BookOpen size={18}/> Досье</button><button onClick={()=>reset()}><MapIcon size={18}/> Обзор</button></div>
 </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
