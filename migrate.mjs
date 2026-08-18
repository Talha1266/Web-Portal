import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateAttendance() {
  console.log("Fetching all attendance records...");
  const { data: attendance, error } = await supabase.from('attendance').select('*');
  if (error) {
    console.error("Error fetching attendance:", error);
    return;
  }

  console.log(`Found ${attendance.length} records.`);

  // Group by unique combination
  const groups = {};
  attendance.forEach(record => {
    const key = `${record.projectId}_${record.workerId}_${record.date}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  });

  const recordsToDelete = [];
  const recordsToReinsert = [];

  for (const key in groups) {
    const group = groups[key];
    
    // Sort by createdAt descending (newest first)
    group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // The first one is the one we want to keep
    const keeper = group[0];
    
    // All others are duplicates to be deleted
    for (let i = 1; i < group.length; i++) {
      recordsToDelete.push(group[i].id);
    }
    
    // For the keeper, we check if it already has the deterministic ID
    const deterministicId = `att_${keeper.projectId}_${keeper.workerId}_${keeper.date}`;
    
    if (keeper.id !== deterministicId) {
      // We need to delete the old one and insert the new one
      recordsToDelete.push(keeper.id);
      
      const newRecord = { ...keeper, id: deterministicId };
      recordsToReinsert.push(newRecord);
    }
  }

  console.log(`Found ${recordsToDelete.length} records to delete (duplicates + old formats).`);
  console.log(`Found ${recordsToReinsert.length} records to reinsert (with deterministic IDs).`);

  if (recordsToDelete.length > 0) {
    console.log("Deleting old records...");
    // Supabase JS allows max 1000 items in IN filter, but we do it in batches of 100
    for (let i = 0; i < recordsToDelete.length; i += 100) {
      const batch = recordsToDelete.slice(i, i + 100);
      const { error: delError } = await supabase.from('attendance').delete().in('id', batch);
      if (delError) {
        console.error("Error deleting batch:", delError);
      }
    }
    console.log("Deletion complete.");
  }

  if (recordsToReinsert.length > 0) {
    console.log("Inserting new records with deterministic IDs...");
    for (let i = 0; i < recordsToReinsert.length; i += 100) {
      const batch = recordsToReinsert.slice(i, i + 100);
      const { error: insError } = await supabase.from('attendance').insert(batch);
      if (insError) {
        console.error("Error inserting batch:", insError);
      }
    }
    console.log("Insertion complete.");
  }

  console.log("Migration finished successfully!");
}

migrateAttendance();
