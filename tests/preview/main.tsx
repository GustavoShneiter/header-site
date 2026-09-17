// Isolated UI harness: all records and writes are only in this tab's memory.
import {createRoot} from "react-dom/client";
import type {User} from "@supabase/supabase-js";
import Workspace from "../../components/workspace";
import "../../app/globals.css";
const user={id:"qa-user",aud:"authenticated",email:"teste@example.test",created_at:"2026-01-01T00:00:00Z",user_metadata:{full_name:"Conta de teste"},app_metadata:{provider:"email"}} as User;
createRoot(document.getElementById("root")!).render(<Workspace user={user}/>);
