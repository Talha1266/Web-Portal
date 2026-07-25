import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function addWorker(w) {  
  const { error } = await supabase.from('workers').insert({ 
    ...w, 
    id: w.id || Date.now().toString(), 
    createdAt: new Date().toISOString() 
  }); 
  if (error) throw new Error(error.message); 
}

async function main() {
  try {
    await addWorker({
      projectId: "123",
      name: "Test Worker",
      role: "Mason",
      dailyWage: 1000
    });
    console.log("Worker added successfully!");
  } catch (err) {
    console.error("Error adding worker:", err);
  }
}

main();
