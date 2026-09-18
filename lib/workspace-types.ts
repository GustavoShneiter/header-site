export type Task = {id:string;owner_id:string;parent_id:string|null;is_parent:boolean;title:string;weekday:number;period:string;completed:boolean;position:number;description:string;due_time:string;kind:"check"|"list"|"note";background:string;text_color:string;accent:string;updated_at?:string};
export type Event = {id:string;owner_id:string;title:string;date:string;time:string;type:string;description:string;color:string;completed:boolean};
export type Habit = {id:string;owner_id:string;title:string;goal:string;days:number[];completions:string[];color:string;archived:boolean;created_at?:string};
export type Challenge = {id:string;owner_id:string;title:string;situation:string;desired:string;strategy:string;checks:{date:string;score:number;note:string}[];archived:boolean};
export type FinanceItem = {id:string;owner_id:string;kind:"income"|"bill"|"planned";title:string;category:string;amount:number;description:string;product_url:string;photo_url:string;created_at?:string};
export type Preferences = {theme:"light"|"dark"|"system";weekStart:number;showCompleted:boolean;compact:boolean;focus:string;defaultPeriod:string};
export const defaults:Preferences = {theme:"light",weekStart:0,showCompleted:true,compact:false,focus:"Usar o tempo com intenção, uma tarefa de cada vez.",defaultPeriod:"morning"};
