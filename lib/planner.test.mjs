import {test} from "node:test";
import assert from "node:assert/strict";
import {subtree,canParent,movedTasks,duplicatedTasks,weekDays,calendarDays,dateKey,parseDate,habitStreak} from "./planner.mjs";
const tasks=[
 {id:"a",parent_id:null,title:"Orion",weekday:1,period:"morning",position:0,completed:false},
 {id:"b",parent_id:"a",title:"Criar",weekday:1,period:"morning",position:0,completed:true},
 {id:"c",parent_id:"b",title:"Revisar",weekday:1,period:"morning",position:0,completed:false},
 {id:"d",parent_id:null,title:"Casa",weekday:2,period:"afternoon",position:0,completed:false},
];
test("move carries all descendants and orders before target without mutating source",()=>{
 const before=structuredClone(tasks),rows=movedTasks(tasks,"a",2,"afternoon","d");
 assert.deepEqual(tasks,before);assert.equal(rows.find(t=>t.id==="a").position,0);assert.equal(rows.find(t=>t.id==="d").position,1);
 for(const id of ["a","b","c"]){assert.equal(rows.find(t=>t.id===id).weekday,2);assert.equal(rows.find(t=>t.id===id).period,"afternoon");}
 assert.equal(rows.find(t=>t.id==="c").parent_id,"b");
});
test("moving a nested task to another day promotes only its branch root",()=>{
 const rows=movedTasks(tasks,"b",3,"evening");
 assert.equal(rows.find(t=>t.id==="b").parent_id,null);assert.equal(rows.find(t=>t.id==="c").parent_id,"b");assert.ok(!rows.some(t=>t.id==="a"));
});
test("copies reset completion and reference new parent IDs",()=>{
 let i=0;const rows=duplicatedTasks(tasks,"a",()=>String(++i));
 assert.equal(rows.length,3);assert.equal(rows[1].parent_id,rows[0].id);assert.equal(rows[2].parent_id,rows[1].id);
 assert.ok(rows.every(t=>!t.completed));assert.equal(rows[0].title,"Orion (cópia)");
});
test("cycles cannot be selected as parents, traversal terminates on malformed cycles",()=>{
 assert.equal(canParent(tasks,"a","c"),false);assert.equal(canParent(tasks,"a","a"),false);assert.equal(canParent(tasks,"b","d"),true);
 assert.equal(subtree([{id:"a",parent_id:"b"},{id:"b",parent_id:"a"}],"a").size,2);
});
test("copy long title respects database limit",()=>assert.equal(duplicatedTasks([{...tasks[0],title:"a".repeat(240)}],"a",()=>"x")[0].title.length,240));
test("weeks cross year boundaries and support Monday start",()=>{
 assert.equal(dateKey(weekDays(parseDate("2027-01-01"),0)[0]),"2026-12-27");
 assert.equal(dateKey(weekDays(parseDate("2027-01-01"),1)[0]),"2026-12-28");
});
test("month includes all days exactly once in 42 calendar cells",()=>{
 const days=calendarDays(parseDate("2026-09-17"),1);assert.equal(days.length,42);assert.equal(new Set(days.map(dateKey)).size,42);
 assert.equal(days.filter(d=>d.getMonth()===8).length,30);assert.equal(days[0].getDay(),1);
});
test("habit streak skips unscheduled days and allows incomplete today",()=>{
 const h={days:[1,3,5],completions:["2026-09-11","2026-09-14"],created_at:"2026-09-01"};
 assert.equal(habitStreak(h,parseDate("2026-09-16")),2);
 assert.equal(habitStreak(h,parseDate("2026-09-18")),0);
 assert.equal(habitStreak({...h,completions:[...h.completions,"2026-09-16"]},parseDate("2026-09-17")),3);
});
