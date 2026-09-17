"use client";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from "@/components/ui/select";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { type ReactNode } from "react";
export function Choice({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string}[]}){
  return <label className="field"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger className="field-control" aria-label={label}><SelectValue/></SelectTrigger><SelectContent className="select-popup">{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></label>;
}
export function Modal({title,description,children,onClose}:{title:string;description:string;children:ReactNode;onClose:()=>void}){
  return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="planner-modal" showCloseButton><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{children}</DialogContent></Dialog>;
}
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>;}
export function Empty({children,action}:{children:ReactNode;action?:ReactNode}){return <div className="empty-state"><p>{children}</p>{action}</div>;}
