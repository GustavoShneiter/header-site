import {test} from "node:test";
import assert from "node:assert/strict";
import {loadWorkspace,syncErrorMessage} from "./workspace-sync.mjs";
function fakeClient(results) {
  return {from(table) {
    const query = {
      select(){return this;}, eq(field,id){assert.equal(id,"owner");return this;},
      order(){return this;}, maybeSingle(){return this;},
      then(resolve,reject){
        const value=results[table]??{data:[],error:null};
        return (value instanceof Error?Promise.reject(value):Promise.resolve(value)).then(resolve,reject);
      }
    };
    return query;
  }};
}
test("missing calendar does not discard tasks or profile", async()=>{
  const tasks=[{id:"task-1",title:"Minha tarefa"}];
  const result=await loadWorkspace(fakeClient({
    header_tasks:{data:tasks,error:null},
    header_events:{data:null,error:{code:"PGRST205",message:"missing table"}},
    header_profiles:{data:{display_name:"Gustavo"},error:null}
  }),"owner");
  assert.deepEqual(result.find(r=>r.key==="tasks").data,tasks);
  assert.equal(result.find(r=>r.key==="profile").data.display_name,"Gustavo");
  assert.equal(result.filter(r=>r.error).length,1);
});
test("network exception in one section is isolated and surfaced",async()=>{
  const result=await loadWorkspace(fakeClient({header_habits:new Error("offline")}),"owner");
  assert.equal(result.length,5);
  assert.equal(result.find(r=>r.key==="habits").error.message,"offline");
  assert.equal(result.find(r=>r.key==="tasks").error,null);
});
test("subsequent refresh can recover a missing table",async()=>{
  const results={header_events:{data:null,error:{code:"PGRST205"}}};
  assert.ok((await loadWorkspace(fakeClient(results),"owner")).find(r=>r.key==="events").error);
  results.header_events={data:[{id:"event-1"}],error:null};
  const recovered=(await loadWorkspace(fakeClient(results),"owner")).find(r=>r.key==="events");
  assert.equal(recovered.error,null);assert.equal(recovered.data[0].id,"event-1");
});
test("schema errors explain full migration; unrelated errors retain detail",()=>{
  assert.match(syncErrorMessage({code:"PGRST204",message:"missing preferences"}),/002_workspace.sql/);
  assert.equal(syncErrorMessage({message:"Invalid JWT"}),"Invalid JWT");
});
