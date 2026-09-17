import {dateKey,weekDays} from "../../lib/planner.mjs";
const today=new Date(),day=today.getDay(),key=dateKey(today);
const task=(id:string,title:string,parent_id:string|null=null)=>({id,title,parent_id,owner_id:"qa-user",is_parent:!parent_id,weekday:day,period:"morning",completed:false,position:0,description:"",due_time:"",kind:"check",accent:"#8b70db",text_color:"",background:""});
const tables:Record<string,Record<string,unknown>[]>={
 header_profiles:[{id:"qa-user",display_name:"Gustavo (teste)",preferences:{}}],
 header_tasks:[task("orion","Orion"),{...task("plan","Planejar campanha","orion"),completed:true},{...task("art","Criar as artes","orion"),position:1},{...task("hode","Hode"),period:"afternoon",accent:"#d09357"},{...task("proposal","Revisar proposta","hode"),period:"afternoon",accent:"#d09357"},{...task("house","Organizar a casa"),is_parent:false,weekday:(day+1)%7,position:2}],
 header_events:[{id:"event",owner_id:"qa-user",title:"Reunião de planejamento",date:key,time:"14:00",type:"Compromisso",description:"Alinhar os próximos passos.",color:"#8b70db",completed:false}],
 header_habits:[{id:"habit",owner_id:"qa-user",title:"Ler por 20 minutos",goal:"Cultivar o hábito de aprender.",days:[0,1,2,3,4,5,6],completions:weekDays(today).filter((d:Date)=>dateKey(d)<key).map(dateKey),color:"#8b70db",archived:false,created_at:"2026-01-01"}],
 header_challenges:[{id:"challenge",owner_id:"qa-user",title:"Mais presença, menos tela",situation:"Quero usar melhor meu tempo.",desired:"Ter tempo para o que importa.",strategy:"Reservar uma hora sem notificações.",checks:[],archived:false}]
};
class Query implements PromiseLike<{data:any;error:null}>{
 private filters:[string,unknown][]=[];private operation="read";private rows:Record<string,unknown>[]=[];private single=false;
 constructor(private table:string){}
 select(){return this;}order(){return this;}eq(field:string,value:unknown){this.filters.push([field,value]);return this;}maybeSingle(){this.single=true;return this;}
 upsert(rows:Record<string,unknown>[]|Record<string,unknown>){this.operation="write";this.rows=Array.isArray(rows)?rows:[rows];return this;}delete(){this.operation="delete";return this;}
 then<TResult1={data:any;error:null},TResult2=never>(resolve?:((value:{data:any;error:null})=>TResult1|PromiseLike<TResult1>)|null,reject?:((reason:any)=>TResult2|PromiseLike<TResult2>)|null):PromiseLike<TResult1|TResult2>{
  let data=tables[this.table]??=[];const matches=(row:Record<string,unknown>)=>this.filters.every(([f,v])=>row[f]===v);
  if(this.operation==="write")for(const row of this.rows){const at=data.findIndex(r=>r.id===row.id);if(at>=0)data[at]={...data[at],...row};else data.push({...row});}
  if(this.operation==="delete"){const deleted=new Set(data.filter(matches).map(r=>r.id));if(this.table==="header_tasks"){let changed=true;while(changed){changed=false;for(const row of data)if(deleted.has(row.parent_id)&&!deleted.has(row.id)){deleted.add(row.id);changed=true;}}}tables[this.table]=data=data.filter(r=>!deleted.has(r.id));}
  const filtered=data.filter(matches);return Promise.resolve({data:structuredClone(this.single?filtered[0]??null:filtered),error:null as null}).then(resolve,reject);
 }
}
export const supabase={from:(name:string)=>new Query(name),auth:{signOut:async()=>({error:null})}};
