"use client";

import {useState} from "react";
import {ArrowUpRight,ArrowRight,Flame,Check,Plus,Sun,Sunset,Moon,CalendarDays,Clock3,Leaf,Target,CheckCheck} from "lucide-react";
import {Checkbox} from "./ui/checkbox";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "./ui/select";
import {dateKey,weekDays,dayNames,habitStreak,periods} from "@/lib/planner.mjs";
import type {Task,Event,Habit,Preferences} from "@/lib/workspace-types";
import "./overview.css";

type Props={
 today:Date;tasks:Task[];events:Event[];habits:Habit[];prefs:Preferences;busy:boolean;
 onTask:(task:Task)=>void;onToggleTask:(task:Task)=>void;onNewTask:(day:number,period:string)=>void;
 onToggleHabit:(habit:Habit)=>void;onEvolution:()=>void;onWeek:()=>void;
 onCalendar:(date:string)=>void;onEvent:(event:Event)=>void;onNewEvent:()=>void;
};
export default function Overview(p:Props){
 const {today,tasks,events,habits,prefs,busy}=p;
 const key=dateKey(today),week=weekDays(today,prefs.weekStart) as Date[];
 const [selectedHabit,setSelectedHabit]=useState(""),[filter,setFilter]=useState(prefs.showCompleted?"all":"pending");
 const active=habits.filter(h=>!h.archived),scheduled=active.filter(h=>h.days.includes(today.getDay()));
 const featured=active.find(h=>h.id===selectedHabit)||active.slice().sort((a,b)=>habitStreak(b,today)-habitStreak(a,today))[0];
 const streak=featured?habitStreak(featured,today):0;
 const daily=tasks.filter(t=>t.weekday===today.getDay());
 const actionable=daily.filter(t=>t.kind==="check"&&!t.is_parent);
 const done=actionable.filter(t=>t.completed).length,remaining=actionable.length-done;
 const habitDone=scheduled.filter(h=>h.completions.includes(key)).length;
 const agenda=events.filter(e=>e.date===key).sort((a,b)=>a.time.localeCompare(b.time));
 const agendaPending=agenda.filter(e=>!e.completed);
 const visible=daily.filter(t=>{
   if(t.is_parent&&daily.some(child=>child.parent_id===t.id))return false;
   if(filter==="done")return t.completed&&t.kind==="check"&&!t.is_parent;
   if(filter==="pending")return !t.completed||t.kind!=="check"||t.is_parent;
   return true;
 }).sort((a,b)=>(a.due_time||"99:99").localeCompare(b.due_time||"99:99")||a.position-b.position);
 const icons=[Sun,Sunset,Moon];
 return <div className="overview">
   <div className="ov-week-strip" aria-label="Esta semana">
     <div className="ov-week-caption"><CalendarDays size={17}/><span>Sua semana<strong>{week[0].getDate()} — {week[6].getDate()} {week[6].toLocaleDateString("pt-BR",{month:"short"})}</strong></span></div>
     <div className="ov-week-dates">{week.map(d=><button key={dateKey(d)} className={dateKey(d)===key?"is-today":""} onClick={()=>p.onCalendar(dateKey(d))} aria-label={"Abrir calendário de "+d.toLocaleDateString("pt-BR")} aria-current={dateKey(d)===key?"date":undefined}><small>{dayNames[d.getDay()].slice(0,3)}</small><strong>{d.getDate()}</strong><i className={events.some(e=>e.date===dateKey(d))?"has-event":""}/></button>)}</div>
     <button className="ov-subtle-link" onClick={p.onWeek}>Planejar semana <ArrowUpRight size={16}/></button>
   </div>

   <section className="ov-evolution-hero" aria-labelledby="ov-evolution-title">
     <div className="ov-hero-copy"><span className="ov-kicker"><span className="ov-tiny-orbit"/> UM POUCO, TODOS OS DIAS</span><h2 id="ov-evolution-title">Um passo de cada vez.<br/><span>É assim que você evolui.</span></h2><p>Pequenas ações repetidas viram grandes mudanças.<br className="ov-desktop-break"/> Hoje é mais uma oportunidade de cuidar de você.</p><button className="ov-dark-button" onClick={p.onEvolution}>Minha evolução <ArrowUpRight size={17}/></button><div className="ov-hero-progress"><span>{habitDone} de {scheduled.length} hábitos de hoje concluídos</span><div role="progressbar" aria-label="Hábitos de hoje concluídos" aria-valuenow={habitDone} aria-valuemin={0} aria-valuemax={scheduled.length||1}><i style={{width:(scheduled.length?habitDone/scheduled.length*100:0)+"%"}}/></div></div></div>
     <div className="ov-streak-card">{featured?<><div className="ov-streak-heading"><span className="ov-streak-icon"><Flame size={24}/></span><span>CONSTÂNCIA QUE CONTA</span><Select value={featured.id} onValueChange={setSelectedHabit}><SelectTrigger aria-label="Hábito em destaque" className="ov-habit-select"><SelectValue/></SelectTrigger><SelectContent>{active.map(h=><SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>)}</SelectContent></Select></div><div className="ov-streak-number"><strong>{streak}</strong><div><b>{streak===1?"dia em sequência":"dias em sequência"}</b><span>{streak? "Continue no seu ritmo.":"Todo começo conta."}</span></div><span className="ov-streak-art" aria-hidden="true"><Flame size={66}/></span></div><div className="ov-streak-days">{week.map(d=>{const k=dateKey(d),completed=featured.completions.includes(k),planned=featured.days.includes(d.getDay());return <div key={k} className={(k===key?"current ":"")+(completed?"complete ":"")+(!planned?"rest ":"")} aria-label={dayNames[d.getDay()]+": "+(completed?"concluído":!planned?"dia de pausa":k>key?"programado":"não concluído")}><small>{dayNames[d.getDay()].slice(0,3)}</small><span>{completed?<Check size={17}/>:!planned?"–":d.getDate()}</span>{k===key?<b>Hoje</b>:<b>&nbsp;</b>}</div>;})}</div><div className="ov-streak-footer"><span>Sequência nos dias programados</span><span><i/> Concluído</span></div></>:<div className="ov-hero-empty"><span className="ov-streak-icon"><Flame size={27}/></span><h3>Sua próxima sequência<br/>começa com um hábito.</h3><p>Escolha algo pequeno que você quer repetir.<br/>Nós te ajudamos a acompanhar.</p><button className="ov-dark-button" onClick={p.onEvolution}>Começar meu primeiro hábito <Plus size={16}/></button></div>}</div>
   </section>

   <div className="ov-quick-stats">
     <button onClick={()=>{setFilter("pending");document.getElementById("ov-day")?.scrollIntoView({behavior:"smooth",block:"start"});}}><span className="ov-stat-icon violet"><Target size={19}/></span><span><strong>{remaining.toString().padStart(2,"0")}</strong><small>atividades para hoje</small></span><ArrowUpRight size={17}/></button>
     <button onClick={()=>p.onCalendar(key)}><span className="ov-stat-icon peach"><CalendarDays size={19}/></span><span><strong>{agendaPending.length.toString().padStart(2,"0")}</strong><small>momentos na agenda</small></span><ArrowUpRight size={17}/></button>
     <button onClick={()=>{setFilter("done");document.getElementById("ov-day")?.scrollIntoView({behavior:"smooth",block:"start"});}}><span className="ov-stat-icon green"><CheckCheck size={19}/></span><span><strong>{done.toString().padStart(2,"0")}</strong><small>atividades concluídas</small></span><ArrowUpRight size={17}/></button>
   </div>

   <div className="ov-content-grid"><section id="ov-day" className="ov-day-section"><div className="ov-section-heading"><div><span className="ov-kicker">UMA COISA DE CADA VEZ</span><h2>Seu dia, com clareza<span className="ov-count">{done}/{actionable.length}</span></h2></div><button className="ov-round-button" aria-label="Adicionar atividade de hoje" onClick={()=>p.onNewTask(today.getDay(),prefs.defaultPeriod)}><Plus size={19}/></button></div><div className="ov-task-toolbar"><div className="ov-filter" role="group" aria-label="Filtrar atividades">{[{id:"all",label:"Todas"},{id:"pending",label:"A fazer"},{id:"done",label:"Concluídas"}].map(f=><button key={f.id} aria-pressed={filter===f.id} className={filter===f.id?"selected":""} onClick={()=>setFilter(f.id)}>{f.label}</button>)}</div><span>{remaining===0&&actionable.length?"Tudo em dia. Respire.":remaining+" para concluir"}</span></div><div className="ov-periods">{periods.map((period,i)=>{const Icon=icons[i],rows=visible.filter(t=>t.period===period.id),total=daily.filter(t=>t.period===period.id&&t.kind==="check"&&!t.is_parent).length;return <section className={"ov-period ov-period-"+period.id} key={period.id}><header><span className="ov-period-icon"><Icon size={18}/></span><h3>{period.label}</h3><span>{total} {total===1?"atividade":"atividades"}</span><button className="icon-button" aria-label={"Adicionar atividade de "+period.label.toLowerCase()} onClick={()=>p.onNewTask(today.getDay(),period.id)}><Plus size={15}/></button></header>{rows.length?rows.map(t=><div className={"ov-task "+(t.completed?"completed":"")} key={t.id} style={{background:t.background||undefined,color:t.text_color||undefined}}>{t.kind==="check"&&!t.is_parent?<Checkbox aria-label={"Concluir "+t.title} checked={t.completed} disabled={busy} onCheckedChange={()=>p.onToggleTask(t)}/>:<span className="ov-note-dot" style={{background:t.accent}}/>}<button className="ov-task-copy" onClick={()=>p.onTask(t)}><strong>{t.title}</strong>{(t.parent_id||t.description||t.is_parent||t.kind==="note")&&<span>{t.parent_id&&<b style={{borderColor:t.accent}}>{tasks.find(x=>x.id===t.parent_id)?.title||"Subtarefa"}</b>}{t.description?<small>{t.description}</small>:t.is_parent?<small>Grupo de tarefas</small>:t.kind==="note"?<small>Anotação</small>:null}</span>}</button>{t.due_time&&<time><Clock3 size={11}/>{t.due_time}</time>}<button className="ov-task-edit" aria-label={"Editar "+t.title} onClick={()=>p.onTask(t)}><ArrowUpRight size={15}/></button></div>):<div className="ov-period-empty">{total?"Nenhuma atividade neste filtro.":<>Um espaço livre na sua {period.label.toLowerCase()}.<button onClick={()=>p.onNewTask(today.getDay(),period.id)}>Adicionar atividade <Plus size={12}/></button></>}</div>}</section>;})}</div></section>

   <aside className="ov-side"><section className="ov-agenda"><div className="ov-section-heading"><div><span className="ov-kicker">RESERVE SEU TEMPO</span><h2>Na agenda hoje</h2></div><button className="ov-round-button" aria-label="Adicionar compromisso hoje" onClick={p.onNewEvent}><Plus size={17}/></button></div>{agenda.length?<div className="ov-agenda-list">{agenda.map(e=><button className={"ov-agenda-item "+(e.completed?"completed":"")} key={e.id} onClick={()=>p.onEvent(e)}><time>{e.time||"Dia todo"}</time><span className="ov-agenda-track" style={{color:e.color}}/><span><small>{e.type}</small><strong>{e.title}</strong>{e.description&&<p>{e.description}</p>}</span>{e.completed?<Check size={15}/>:<ArrowUpRight size={14}/>}</button>)}</div>:<div className="ov-agenda-empty"><CalendarDays size={25}/><p>Um pouco de espaço no seu dia.</p><span>Seus compromissos de hoje aparecem aqui.</span></div>}<button className="ov-card-link" onClick={()=>p.onCalendar(key)}>Abrir calendário <ArrowRight size={16}/></button></section>
   <section className="ov-habit-panel"><div className="ov-section-heading"><div><span className="ov-kicker">CUIDAR DE VOCÊ TAMBÉM CONTA</span><h2>Pequenos rituais</h2></div><span className="ov-count">{habitDone}/{scheduled.length}</span></div>{scheduled.length?scheduled.map(h=><label className={"ov-habit-row "+(h.completions.includes(key)?"complete":"")} key={h.id}><Checkbox disabled={busy} aria-label={"Concluir hábito "+h.title} checked={h.completions.includes(key)} onCheckedChange={()=>p.onToggleHabit(h)}/><span><strong>{h.title}</strong><small>{h.goal||"Um pequeno passo hoje."}</small></span><b><Flame size={12}/>{habitStreak(h,today)}</b></label>):<p className="ov-soft-empty">Nenhum hábito programado para hoje. Aproveite seu ritmo.</p>}<button className="ov-card-link" onClick={p.onEvolution}>Ver todos os hábitos <ArrowRight size={16}/></button></section>
   {prefs.focus&&<div className="ov-focus"><Leaf size={19}/><div><span>LEMBRETE PARA A SEMANA</span><p>{prefs.focus}</p></div></div>}</aside></div>
 </div>;
}
