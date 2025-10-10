// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqrvarxzfapiwcwwalvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcnZhcnh6ZmFwaXdjd3dhbHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTI4NDUsImV4cCI6MjA3NTU4ODg0NX0.UQGRRo2xfG43noVgV3-grsGPYlD5i3g36eC9ugcaZUM';

export const supabase = createClient(supabaseUrl, supabaseKey);
