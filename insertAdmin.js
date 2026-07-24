import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oszoskbthyscxyvnjmyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zem9za2J0aHlzY3h5dm5qbXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDg0ODYsImV4cCI6MjEwMDQ4NDQ4Nn0.X2KAR8SRWkNFir68n43EwakPRpIeyPnYtnBRAAJLiTA'
);

async function insertAdmin() {
  const { data, error } = await supabase.from('users').insert({
    id: 'admin',
    email: 'admin@admin.com',
    password: 'admin',
    name: 'Super Admin',
    role: 'Super Admin',
    permissions: { root: true }
  });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Admin successfully injected!");
  }
}

insertAdmin();
