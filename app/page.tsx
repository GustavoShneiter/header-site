"use client";
import {useEffect,useState} from "react";
import type {User} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase";
import AuthScreen from "@/components/auth-screen";
import Workspace from "@/components/workspace";
export default function Page(){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(!supabase),[recovery,setRecovery]=useState(false);
 useEffect(()=>{if(!supabase)return;let active=true;supabase.auth.getSession().then(({data})=>{if(active){setUser(data.session?.user??null);setReady(true);}});const {data}=supabase.auth.onAuthStateChange((event,session)=>{setUser(session?.user??null);setReady(true);if(event==="PASSWORD_RECOVERY")setRecovery(true);});return()=>{active=false;data.subscription.unsubscribe();};},[]);
 if(!ready)return <div className="loading-screen">Abrindo seu Header…</div>;
 if(!user||recovery)return <AuthScreen recovery={recovery} onRecovered={()=>setRecovery(false)}/>;
 return <Workspace key={user.id} user={user}/>;
}
