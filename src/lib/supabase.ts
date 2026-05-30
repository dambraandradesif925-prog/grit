import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vrklfliawibbzfdpbahl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya2xmbGlhd2liYnpmZHBiYWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTg1NzMsImV4cCI6MjA4OTQ5NDU3M30.7H7Ehr1cR-tpexkQlF2tCd-2pUAVU7ZvVo2N9S2do4E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
