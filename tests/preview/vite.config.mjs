import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/postcss";
import {fileURLToPath} from "node:url";
const path=(v)=>fileURLToPath(new URL(v,import.meta.url));
export default defineConfig({root:path("./"),plugins:[react()],resolve:{alias:[{find:"@/lib/supabase",replacement:path("./mock-db.ts")},{find:"next/link",replacement:path("./link.tsx")},{find:"@",replacement:path("../../")}]},css:{postcss:{plugins:[tailwind()]}},server:{host:"127.0.0.1",port:5174,strictPort:true,fs:{allow:[path("../../")]}}});
