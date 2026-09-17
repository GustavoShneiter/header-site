export const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const periods = [{id:"morning",label:"Manhã"},{id:"afternoon",label:"Tarde"},{id:"evening",label:"Noite"}];
export function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}
export function parseDate(value) { const [y,m,d]=value.split("-").map(Number);return new Date(y,m-1,d,12); }
export function weekDays(today = new Date(), start = 0) {
  const first = new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
  first.setDate(first.getDate() - (first.getDay()-start+7)%7);
  return Array.from({length:7},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i,12));
}
export function calendarDays(month,start=0) {
  const first=weekDays(new Date(month.getFullYear(),month.getMonth(),1,12),start)[0];
  return Array.from({length:42},(_,i)=>new Date(first.getFullYear(),first.getMonth(),first.getDate()+i,12));
}
export function subtree(tasks,id) {
  const ids=new Set([id]);let changed=true;
  while(changed){changed=false;for(const task of tasks)if(task.parent_id&&ids.has(task.parent_id)&&!ids.has(task.id)){ids.add(task.id);changed=true;}}
  return ids;
}
export function canParent(tasks,id,parentId) { return !parentId || !subtree(tasks,id).has(parentId); }
/** @param {any[]} tasks @param {string} id @param {number} weekday @param {string} period @param {string|null} beforeId */
export function movedTasks(tasks,id,weekday,period,beforeId=null) {
  const branch=subtree(tasks,id);const source=tasks.find(t=>t.id===id);
  if(!source)throw new Error("Tarefa não encontrada.");
  const siblings=tasks.filter(t=>!branch.has(t.id)&&!t.parent_id&&t.weekday===weekday&&t.period===period).sort((a,b)=>a.position-b.position);
  const at=beforeId?siblings.findIndex(t=>t.id===beforeId):-1;
  siblings.splice(at<0?siblings.length:at,0,source);
  const positions=new Map(siblings.map((t,i)=>[t.id,i]));
  return tasks.filter(t=>branch.has(t.id)||positions.has(t.id)).map(t=>({
    ...t,...(branch.has(t.id)?{weekday,period}:{}),
    ...(t.id===id?{parent_id:null}:{}),
    position:positions.get(t.id)??t.position,
  }));
}
export function duplicatedTasks(tasks,id,newId) {
  const ids=subtree(tasks,id);const branch=tasks.filter(t=>ids.has(t.id));
  const mapping=new Map(branch.map(t=>[t.id,newId()]));
  return branch.map(t=>({...t,id:mapping.get(t.id),parent_id:t.id===id?t.parent_id:mapping.get(t.parent_id)??null,title:t.id===id?t.title.slice(0,232)+" (cópia)":t.title,completed:false,position:t.position+1}));
}
export function normalizeTask(row) { return {description:"",due_time:"",kind:"check",background:"",text_color:"",accent:"#8b70db",...row}; }
export function habitStreak(habit,today=new Date()) {
  const done=new Set(habit.completions);let count=0;const cursor=new Date(today);
  for(let i=0;i<3660;i++){const key=dateKey(cursor);if(habit.created_at&&key<habit.created_at.slice(0,10))break;
    if(habit.days.includes(cursor.getDay())){if(done.has(key))count++;else if(i!==0)break;}
    cursor.setDate(cursor.getDate()-1);
  }return count;
}
