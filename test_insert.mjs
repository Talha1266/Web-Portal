import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const p = {
      name: "Test API Insert",
      description: "Test Desc",
      location: "Test Loc",
      client: "Test Client",
      startDate: "2026-07-25",
      assignedUsers: ["admin"],
      createdBy: "admin"
    };
    
    console.log("Inserting project...");
    const res = await supabase.from('projects').insert({ 
        ...p, 
        id: Date.now().toString(), 
        progress: 0, 
        createdAt: new Date().toISOString() 
    });
    
    console.log("Result:", JSON.stringify(res, null, 2));
}

main();
