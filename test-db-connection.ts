import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './src/lib/db';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...\n');
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database Connected Successfully!');
    console.log('   Result:', result);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database Connection Failed');
    console.error('   Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env.local');
    console.error('   2. Ensure using direct connection (not pooler for development)');
    console.error('   3. For Supabase: Use Session mode or Transaction mode connection string');
    process.exit(1);
  }
}

testConnection();

