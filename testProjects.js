import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oszoskbthyscxyvnjmyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zem9za2J0aHlzY3h5dm5qbXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDg0ODYsImV4cCI6MjEwMDQ4NDQ4Nn0.X2KAR8SRWkNFir68n43EwakPRpIeyPnYtnBRAAJLiTA'
);

async function test() {
  console.log("Fetching projects...");
  const { data: p1, error: e1 } = await supabase.from('projects').select('*');
  console.log("Initial projects count:", p1?.length, "Error:", e1);

  console.log("Inserting test project...");
  const { error: e2 } = await supabase.from('projects').insert({
    id: Date.now().toString(),
    name: 'Test Project',
    description: 'Test',
    location: 'Test',
    client: 'Test',
    startDate: '2026-07-25',
    assignedUsers: ['admin'],
    progress: 0,
    createdAt: new Date().toISOString()
  });
  console.log("Insert Error:", e2);

  const { data: p2, error: e3 } = await supabase.from('projects').select('*');
  console.log("Final projects count:", p2?.length, "Error:", e3);
}

test();
