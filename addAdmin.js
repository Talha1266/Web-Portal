import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oszoskbthyscxyvnjmyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zem9za2J0aHlzY3h5dm5qbXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDg0ODYsImV4cCI6MjEwMDQ4NDQ4Nn0.X2KAR8SRWkNFir68n43EwakPRpIeyPnYtnBRAAJLiTA'
);

async function addAdmin() {
  const { error } = await supabase.from('users').upsert({
    id: 'admin',
    email: 'admin@admin.com',
    password: 'admin',
    name: 'Super Admin',
    role: 'Administrator',
    permissions: {
      root: true,
      add_projects: true,
      edit_projects: true,
      delete_projects: true,
      manage_documents: true,
      view_reports: true
    },
    createdAt: new Date().toISOString()
  });

  if (error) {
    console.error("Error inserting admin:", error.message);
  } else {
    console.log("admin@admin.com injected successfully!");
  }
}

addAdmin();
