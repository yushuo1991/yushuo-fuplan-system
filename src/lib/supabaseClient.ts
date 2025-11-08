import { createClient } from '@supabase/supabase-js';

// 优先使用环境变量，如果没有则使用硬编码值作为后备
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wmwcnnjvdbicxiculumk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtd2Nubmp2ZGJpY3hpY3VsdW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzI4NDMsImV4cCI6MjA3MjYwODg0M30.uoQiSQbZwRdjZ3OOBysyaFeDn0qn31eR3ZM_PtmrHPg';

// 详细的环境变量调试信息
console.log('🔍 环境变量检查:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '已配置' : '未配置，使用硬编码值');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置，使用硬编码值');
console.log('最终使用的URL:', SUPABASE_URL);
console.log('🚀 Supabase Client Initialized');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


