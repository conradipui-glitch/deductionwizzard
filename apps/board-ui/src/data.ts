import raw from '../../../cases/pushkin/casebook.json';
import type {BoardNode,Casebook,CaseEvent} from './types';
export const casebook = raw as Casebook;
export const chronological=[...casebook.events].sort((a,b)=>dateValue(a)-dateValue(b));
function dateValue(e:CaseEvent){const d=e.time?.earliest;return d?d.year*10000+(d.month||1)*100+(d.day||1):Number.MAX_SAFE_INTEGER;}
const pos:Record<string,[number,number]>={
  pushkin:[610,270],natalia:[870,215],dantes:[1230,350],ekaterina:[1260,135],heckern:[1505,440],
  nicholas1:[300,335],idalia:[1080,625],lermontov:[395,805],dolgorukov:[155,625],
  uvarov:[150,910],benckendorff:[390,555],sollogub:[1330,870],
  'event-pasquille':[720,540],'event-challenge1':[970,455],'event-audience':[470,450],
  'event-marriage':[1130,145],'event-ultimatum':[1080,740],'event-duel':[850,875],'event-death':[685,1060],
  'src-letter-1836':[720,690],'src-letter-1837':[1260,690],
  'h-idalia':[1465,645],'h-heckern':[1520,760],'h-court':[295,735]
};
const defaultPosition=(i:number):[number,number]=>[100+(i%6)*245,130+Math.floor(i/6)*190];
const primary=['pushkin','natalia','dantes','ekaterina','heckern','nicholas1','idalia'];
export const boardNodes:BoardNode[]=[
 ...casebook.entities.map((e,i)=>({id:e.id,type:'person' as const,title:e.name,subtitle: primary.includes(e.id)?'Участник дела':'Связанное лицо',x:(pos[e.id]||defaultPosition(i))[0],y:(pos[e.id]||defaultPosition(i))[1],claimIds:casebook.claims.filter(c=>c.about.includes(e.id)).map(c=>c.id)})),
 ...chronological.map((e,i)=>({id:e.id,type:'event' as const,title:e.title,subtitle:e.time?.original||'Дата неизвестна',x:(pos[e.id]||defaultPosition(i+12))[0],y:(pos[e.id]||defaultPosition(i+12))[1],claimIds:e.claim_ids})),
 ...casebook.sources.slice(0,2).map((s,i)=>({id:s.id,type:'source' as const,title:s.title.split(',')[0],subtitle:s.type==='primary'?'Первичный документ':'Исследование',x:(pos[s.id]||defaultPosition(i+19))[0],y:(pos[s.id]||defaultPosition(i+19))[1],claimIds:casebook.claims.filter(c=>c.evidence.some(v=>v.source_id===s.id)).map(c=>c.id)})),
 ...casebook.hypotheses.map((h,i)=>({id:h.id,type:'hypothesis' as const,title:h.statement,subtitle:'Рабочая гипотеза',x:(pos[h.id]||defaultPosition(i+21))[0],y:(pos[h.id]||defaultPosition(i+21))[1],claimIds:casebook.assessments.filter(a=>a.hypothesis_id===h.id).map(a=>a.claim_id)}))
];
export type BoardEdge={id:string;from:string;to:string;type:'event'|'family'|'evidence'|'hypothesis'};
const edges:BoardEdge[]=[
 ...casebook.relations.map(r=>({id:r.id,from:r.from_id,to:r.to_id,type:'family' as const})),
 ...casebook.events.flatMap(e=>e.actors.map(a=>({id:`${e.id}-${a}`,from:e.id,to:a,type:'event' as const}))),
 ...casebook.hypotheses.flatMap(h=>casebook.assessments.filter(a=>a.hypothesis_id===h.id).flatMap(a=>casebook.events.filter(e=>e.claim_ids.includes(a.claim_id)).map(e=>({id:`${h.id}-${e.id}`,from:h.id,to:e.id,type:'hypothesis' as const}))))
];
export const boardEdges=edges;
