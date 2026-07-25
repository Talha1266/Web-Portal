import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables from .env
const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) console.error("Error:", error);
    else {
        console.log("Total Projects:", data.length);
        console.log(JSON.stringify(data.slice(-2), null, 2)); // Last two projects
    }
}

main();
