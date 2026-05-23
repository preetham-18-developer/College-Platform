import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nerlegxpftirhhgjrtrp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8Rv47c4Iyz1syms34UgXLg_jr7SSvDl';

export const supabase = createClient(supabaseUrl, supabaseKey);
