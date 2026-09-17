"use client";
import { useState,type FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Choice,Field,Modal } from "./planner-fields";
import { dayNames,periods,canParent } from "@/lib/planner.mjs";
import type { Task,Event,Habit,Challenge } from "@/lib/workspace-types";

function errorText(error:unknown){return error instanceof Error?error.message:"Não foi possível salvar. Tente novamente.";}
export function TaskEditor({initial,tasks,onSave,onClose}:{initial:Task;tasks:Task[];onSave:(task:Task)=>Promise<void>;onClose:()=>void}){
  const [draft,setDraft]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  const existing=tasks.some(t=>t.id===initial.id);
  const patch=(part:Partial<Task>)=>setDraft(d=>({...d,...part}));
  const type=draft.is_parent&&draft.kind==="check"?"group":draft.kind;
  async function submit(e:FormEvent){e.preventDefault();if(busy)return;setError("");setBusy(true);try{
    if(!draft.title.trim())throw new Error("Dê um nome à tarefa.");
    if(!canParent(tasks,draft.id,draft.parent_id))throw new Error("Uma tarefa não pode ficar dentro de suas próprias subtarefas.");
    await onSave({...draft,title:draft.title.trim()});onClose();
  }catch(e){setError(errorText(e));}finally{setBusy(false);}}
  return <Modal title={existing?"Editar tarefa":"Nova tarefa"} description="Organize o que fazer, quando fazer e como visualizar." onClose={()=>{if(!busy)onClose();}}>
    <form className="editor-form" onSubmit={submit}><fieldset disabled={busy}>
      <Field label="Título"><input autoFocus required maxLength={240} value={draft.title} onChange={e=>patch({title:e.target.value})} placeholder="O que você quer organizar?"/></Field>
      <div className="form-grid"><Choice label="Tipo de elemento" value={type} onChange={v=>patch({kind:(v==="group"?"check":v) as Task["kind"],is_parent:v==="group"||v==="list"})} options={[{value:"check",label:"Tarefa com checkbox"},{value:"group",label:"Tarefa-mãe / grupo"},{value:"list",label:"Lista de itens"},{value:"note",label:"Anotação sem checkbox"}]}/>
      <Choice label="Dentro de" value={draft.parent_id??"none"} onChange={v=>{const parent=tasks.find(t=>t.id===v);patch({parent_id:v==="none"?null:v,...(parent?{weekday:parent.weekday,period:parent.period}:{})});}} options={[{value:"none",label:"Nenhuma tarefa-mãe"},...tasks.filter(t=>canParent(tasks,draft.id,t.id)).map(t=>({value:t.id,label:t.title}))]}/></div>
      <div className="form-grid three"><Choice label="Dia da semana" value={String(draft.weekday)} onChange={v=>patch({weekday:Number(v)})} options={dayNames.map((label,value)=>({value:String(value),label}))}/>
      <Choice label="Período" value={draft.period} onChange={v=>patch({period:v})} options={periods.map(p=>({value:p.id,label:p.label}))}/>
      <Field label="Horário (opcional)"><input type="time" value={draft.due_time} onChange={e=>patch({due_time:e.target.value})}/></Field></div>
      {draft.parent_id&&<p className="helper-text">A subtarefa acompanha o dia e período da tarefa-mãe. Se mudar para outro período, ela será independente.</p>}
      <Field label="Descrição"><textarea rows={3} value={draft.description} onChange={e=>patch({description:e.target.value})} placeholder="Detalhes, lembretes ou contexto…"/></Field>
      <div className="color-fields">
        <Field label="Cor de destaque"><input aria-label="Cor de destaque" type="color" value={draft.accent||"#8b70db"} onChange={e=>patch({accent:e.target.value})}/></Field>
        <Field label="Cor do fundo"><input aria-label="Cor do fundo" type="color" value={draft.background||"#ffffff"} onChange={e=>patch({background:e.target.value})}/></Field>
        <Field label="Cor da letra"><input aria-label="Cor da letra" type="color" value={draft.text_color||"#20271f"} onChange={e=>patch({text_color:e.target.value})}/></Field>
        <button className="text-button" type="button" onClick={()=>patch({background:"",text_color:"",accent:"#8b70db"})}>Restaurar cores</button>
      </div>
      <div className="task-preview" style={{borderLeftColor:draft.accent,background:draft.background||undefined,color:draft.text_color||undefined}}><span>{draft.kind==="note"?"✎":draft.kind==="list"?"☷":"☐"}</span>{draft.title||"Prévia da sua tarefa"}</div>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{busy?"Salvando…":existing?"Salvar alterações":"Criar tarefa"}</button></div>
    </fieldset></form>
  </Modal>;
}

export function EventEditor({initial,onSave,onClose}:{initial:Event;onSave:(e:Event)=>Promise<void>;onClose:()=>void}){
  const [draft,setDraft]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  const patch=(v:Partial<Event>)=>setDraft(d=>({...d,...v}));
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{await onSave({...draft,title:draft.title.trim()});onClose();}catch(e){setError(errorText(e));}finally{setBusy(false);}}
  return <Modal title="Compromisso no calendário" description="Reserve espaço para seus compromissos e lembretes." onClose={()=>{if(!busy)onClose();}}><form onSubmit={submit} className="editor-form"><fieldset disabled={busy}>
    <Field label="Título"><input required autoFocus maxLength={240} value={draft.title} onChange={e=>patch({title:e.target.value})}/></Field>
    <div className="form-grid"><Field label="Data"><input type="date" required value={draft.date} onChange={e=>patch({date:e.target.value})}/></Field><Field label="Horário"><input type="time" value={draft.time} onChange={e=>patch({time:e.target.value})}/></Field></div>
    <div className="form-grid"><Choice label="Tipo" value={draft.type} onChange={type=>patch({type})} options={["Compromisso","Evento","Lembrete","Anotação"].map(v=>({value:v,label:v}))}/><Field label="Cor"><input type="color" value={draft.color} onChange={e=>patch({color:e.target.value})}/></Field></div>
    <Field label="Descrição"><textarea rows={3} value={draft.description} onChange={e=>patch({description:e.target.value})}/></Field>
    {error&&<p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{busy?"Salvando…":"Salvar compromisso"}</button></div>
  </fieldset></form></Modal>;
}

export function HabitEditor({initial,onSave,onClose}:{initial:Habit;onSave:(h:Habit)=>Promise<void>;onClose:()=>void}){
  const [draft,setDraft]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();if(!draft.days.length){setError("Escolha pelo menos um dia.");return;}setBusy(true);setError("");try{await onSave({...draft,title:draft.title.trim()});onClose();}catch(e){setError(errorText(e));}finally{setBusy(false);}}
  return <Modal title="Seu hábito" description="Pequenas ações que merecem espaço na sua rotina." onClose={()=>{if(!busy)onClose();}}><form onSubmit={submit} className="editor-form"><fieldset disabled={busy}>
    <Field label="Nome do hábito"><input required autoFocus maxLength={240} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></Field>
    <Field label="Meta"><input value={draft.goal} onChange={e=>setDraft({...draft,goal:e.target.value})} placeholder="Por exemplo: ler 20 minutos"/></Field>
    <p className="field-label">Dias da semana</p><div className="day-checks">{dayNames.map((d,i)=><label key={d}><Checkbox checked={draft.days.includes(i)} onCheckedChange={on=>setDraft({...draft,days:on?[...draft.days,i]:draft.days.filter(n=>n!==i)})} aria-label={d}/>{d.slice(0,3)}</label>)}</div>
    <Field label="Cor"><input type="color" value={draft.color} onChange={e=>setDraft({...draft,color:e.target.value})}/></Field>
    {error&&<p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{busy?"Salvando…":"Salvar hábito"}</button></div>
  </fieldset></form></Modal>;
}

export function ChallengeEditor({initial,onSave,onClose}:{initial:Challenge;onSave:(c:Challenge)=>Promise<void>;onClose:()=>void}){
  const [draft,setDraft]=useState(initial);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);try{await onSave({...draft,title:draft.title.trim()});onClose();}catch(e){setError(errorText(e));}finally{setBusy(false);}}
  return <Modal title="Desafio 1% melhor" description="Escolha uma situação e um pequeno passo para evoluir." onClose={()=>{if(!busy)onClose();}}><form onSubmit={submit} className="editor-form"><fieldset disabled={busy}>
    <Field label="Nome do desafio"><input autoFocus required maxLength={240} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></Field>
    {([["situation","Situação que quero melhorar"],["desired","Onde quero chegar"],["strategy","Minha estratégia"]] as const).map(([key,label])=><Field label={label} key={key}><textarea rows={2} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></Field>)}
    {error&&<p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{busy?"Salvando…":"Salvar desafio"}</button></div>
  </fieldset></form></Modal>;
}

export function CheckInEditor({challenge,date,onSave,onClose}:{challenge:Challenge;date:string;onSave:(c:Challenge)=>Promise<void>;onClose:()=>void}){
  const current=challenge.checks.find(c=>c.date===date);const [note,setNote]=useState(current?.note??"");const [score,setScore]=useState(String(current?.score??3));const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  return <Modal title="Como foi hoje?" description={challenge.title} onClose={()=>{if(!busy)onClose();}}><form className="editor-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onSave({...challenge,checks:[...challenge.checks.filter(c=>c.date!==date),{date,score:Number(score),note}]});onClose();}catch(e){setError(errorText(e));}finally{setBusy(false);}}}><fieldset disabled={busy}>
    <Choice label="Seu progresso hoje" value={score} onChange={setScore} options={[{value:"1",label:"1 — Foi difícil"},{value:"2",label:"2 — Dei um pequeno passo"},{value:"3",label:"3 — Estou progredindo"},{value:"4",label:"4 — Foi um bom dia"},{value:"5",label:"5 — Consegui o que queria"}]}/>
    <Field label="O que você aprendeu?"><textarea rows={4} value={note} onChange={e=>setNote(e.target.value)}/></Field>{error&&<p role="alert" className="form-error">{error}</p>}
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{busy?"Salvando…":"Salvar check-in"}</button></div>
  </fieldset></form></Modal>;
}
