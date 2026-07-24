import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oszoskbthyscxyvnjmyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zem9za2J0aHlzY3h5dm5qbXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDg0ODYsImV4cCI6MjEwMDQ4NDQ4Nn0.X2KAR8SRWkNFir68n43EwakPRpIeyPnYtnBRAAJLiTA'
);

async function testAdd() {
  const { data, error } = await supabase.from('users').insert({
    id: Date.now().toString(),
    email: 'test' + Date.now() + '@test.com',
    password: 'password',
    name: 'Test User',
    role: 'Site Engineer',
    permissions: { view_reports: true },
    createdAt: new Date().toISOString()
  });

  console.log("Error:", error);
}

testAdd();
