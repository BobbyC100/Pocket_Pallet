import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';

async function detailedTest() {
  console.log('🔍 Detailed Database Connection Test\n');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  // Parse connection string (hide password)
  const urlParts = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.*)/);
  if (urlParts) {
    console.log('📋 Connection Details:');
    console.log(`   User: ${urlParts[1]}`);
    console.log(`   Password: ${'*'.repeat(urlParts[2].length)}`);
    console.log(`   Host: ${urlParts[3]}`);
    console.log(`   Database: ${urlParts[4]}`);
    console.log('');
  }
  
  // Test 1: Basic connection
  console.log('Test 1: Basic Connection (SSL required)...');
  try {
    const sql = postgres(connectionString, {
      prepare: false,
      ssl: 'require',
      max: 1,
      connect_timeout: 10,
    });
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('   Result:', result);
    
    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 ECONNREFUSED means:');
      console.log('   1. Database is not accepting connections');
      console.log('   2. Host/port is incorrect');
      console.log('   3. Project is paused (most common on free tier)');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 ENOTFOUND means:');
      console.log('   1. Hostname is incorrect');
      console.log('   2. DNS resolution failed');
    }
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 ETIMEDOUT means:');
      console.log('   1. Firewall blocking connection');
      console.log('   2. IP restrictions enabled');
    }
  }
  
  // Test 2: Try without SSL
  console.log('\nTest 2: Connection without SSL...');
  try {
    const sql = postgres(connectionString, {
      prepare: false,
      ssl: false,
      max: 1,
      connect_timeout: 10,
    });
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connection successful (without SSL)!');
    console.log('   ⚠️  You should enable SSL for production');
    
    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed (without SSL too)');
    console.error('   Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('\n1. Go to: https://supabase.com/dashboard');
  console.log('2. Check if your project shows "Paused" status');
  console.log('3. If paused, click "Resume Project"');
  console.log('4. Wait 30 seconds for project to become active');
  console.log('5. Run this test again: npx tsx test-db-detailed.ts');
  console.log('\n💡 Free tier projects pause after 1 week of inactivity.');
  console.log('   This is normal and expected. Just resume it!');
  
  process.exit(1);
}

detailedTest();

