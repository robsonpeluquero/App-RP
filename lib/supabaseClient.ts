import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxwtgqglcsiojvmmutbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d3RncWdsY3Npb2p2bW11dGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzMwMDYsImV4cCI6MjA4MTA0OTAwNn0.7uzGTMBUq3k_oiUM7Cv9nQFqPFvmbS8jdyBO1Wu7CMw';

export const supabase = createClient(supabaseUrl, supabaseKey);