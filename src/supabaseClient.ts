import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://abhormvgtraoinpqjdze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaG9ybXZndHJhb2lucHFqZHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTA1NDAsImV4cCI6MjA4NjI4NjU0MH0.O_O5FDO--U72A3eBExsb_KD_8Mw37k2fIZxBXi2aIaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
