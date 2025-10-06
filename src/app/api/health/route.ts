import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Disable caching

interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error' | 'unknown';
    openai: 'ok' | 'error' | 'unknown';
  };
  uptime: number;
  environment: string;
}

const startTime = Date.now();

export async function GET() {
  const checks: HealthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      openai: 'unknown'
    }
  };

  // Check database connectivity
  try {
    await db.execute('SELECT 1');
    checks.checks.database = 'ok';
  } catch (error) {
    console.error('Health check: Database error', error);
    checks.checks.database = 'error';
    checks.status = 'degraded';
  }

  // Check OpenAI API key exists (don't make actual call - too expensive)
  if (process.env.OPENAI_API_KEY) {
    checks.checks.openai = 'ok';
  } else {
    checks.checks.openai = 'error';
    checks.status = 'degraded';
  }

  // Determine overall status
  if (checks.checks.database === 'error') {
    checks.status = 'down';
  }

  // Return appropriate status code
  const statusCode = checks.status === 'ok' ? 200 : checks.status === 'degraded' ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}

