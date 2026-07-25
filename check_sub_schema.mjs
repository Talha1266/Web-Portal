import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { error } = await supabase.from('subcontractors').insert({ 
    id: "test", projectId: "123", name: "test", trade: "test", finalValue: null 
  });
  console.log("Insert Error:", error?.message || "Success");
}

main();
