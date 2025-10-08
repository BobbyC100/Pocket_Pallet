# Banyan API Integration Example

This document shows how to integrate the Google Docs Add-on with your existing Banyan backend.

## Overview

The add-on needs to communicate with your Banyan backend to generate content. This requires:

1. An API endpoint that accepts generation requests
2. A structured response format the add-on can parse
3. Authentication (optional, but recommended)

## Option 1: Create a New API Endpoint

### Backend Code (Next.js API Route)

Create `/src/app/api/docs-addon/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/lib/ai/document-generator';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Optional: Authenticate the request
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, audience, tone, context } = body;

    // Validate input
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate document using your existing Banyan logic
    const document = await generateDocument({
      title,
      audience: audience || 'general',
      tone: tone || 'professional',
      context: context || '',
      format: 'structured' // Request structured output
    });

    // Transform to add-on format
    const response = {
      title: document.title,
      blocks: transformToBlocks(document.content)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating document:', error);
    
    // Return appropriate error status
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Transform your internal document format to add-on block format
 */
function transformToBlocks(content: any): Block[] {
  const blocks: Block[] = [];

  // Example: If your content is markdown-based
  if (typeof content === 'string') {
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        blocks.push({ type: 'heading', level: 1, text: line.slice(2) });
      } else if (line.startsWith('## ')) {
        blocks.push({ type: 'heading', level: 2, text: line.slice(3) });
      } else if (line.startsWith('- ')) {
        // Collect consecutive bullet items
        const items = [];
        // ... collect items logic
        blocks.push({ type: 'bullets', items });
      } else if (line.trim()) {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  }
  
  // Example: If your content is already structured
  else if (Array.isArray(content)) {
    return content.map(section => ({
      type: section.type,
      text: section.content,
      level: section.level,
      items: section.items
    }));
  }

  return blocks;
}

interface Block {
  type: 'heading' | 'paragraph' | 'bullets' | 'numbered_list' | 'table';
  text?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
}
```

### Update Add-on Configuration

In `Code.gs`, update the API endpoint:

```javascript
const BANYAN_API_BASE = 'https://your-domain.vercel.app';

function callBanyanAPI_(params, retryCount) {
  const url = BANYAN_API_BASE + '/api/docs-addon/generate';
  
  // Add authentication header if using Clerk or similar
  const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer ' + getUserToken_() // If needed
  };

  const payload = {
    title: params.title,
    audience: params.audience,
    tone: params.tone,
    context: params.context
  };

  // ... rest of implementation
}
```

## Option 2: Adapt Existing Endpoint

If you already have a generation endpoint, create an adapter:

### Adapter Function in Add-on

```javascript
/**
 * Adapts existing Banyan API response to add-on format
 */
function transformBanyanResponse_(response) {
  // If your API returns Vision Framework format
  if (response.visionFramework) {
    return {
      title: response.title,
      blocks: [
        { type: 'heading', level: 1, text: response.title },
        { type: 'heading', level: 2, text: 'Vision' },
        { type: 'paragraph', text: response.visionFramework.vision },
        { type: 'heading', level: 2, text: 'Mission' },
        { type: 'paragraph', text: response.visionFramework.mission },
        { type: 'heading', level: 2, text: 'Values' },
        { 
          type: 'bullets', 
          items: response.visionFramework.values 
        }
      ]
    };
  }

  // If your API returns one-pager format
  if (response.onePager) {
    const blocks = [];
    
    // Title
    blocks.push({ 
      type: 'heading', 
      level: 1, 
      text: response.onePager.title 
    });

    // Executive Summary
    blocks.push({ 
      type: 'heading', 
      level: 2, 
      text: 'Executive Summary' 
    });
    blocks.push({ 
      type: 'paragraph', 
      text: response.onePager.executiveSummary 
    });

    // Problem
    blocks.push({ 
      type: 'heading', 
      level: 2, 
      text: 'Problem' 
    });
    blocks.push({ 
      type: 'paragraph', 
      text: response.onePager.problem 
    });

    // Solution
    blocks.push({ 
      type: 'heading', 
      level: 2, 
      text: 'Solution' 
    });
    blocks.push({ 
      type: 'paragraph', 
      text: response.onePager.solution 
    });

    // Market Opportunity
    if (response.onePager.marketOpportunity) {
      blocks.push({ 
        type: 'heading', 
        level: 2, 
        text: 'Market Opportunity' 
      });
      blocks.push({ 
        type: 'paragraph', 
        text: response.onePager.marketOpportunity 
      });
    }

    // Competitive Advantage
    if (response.onePager.competitiveAdvantage) {
      blocks.push({ 
        type: 'heading', 
        level: 2, 
        text: 'Competitive Advantage' 
      });
      blocks.push({ 
        type: 'bullets', 
        items: response.onePager.competitiveAdvantage 
      });
    }

    return { title: response.onePager.title, blocks };
  }

  // If your API returns narrative spine format
  if (response.narrativeSpine) {
    return {
      title: response.title,
      blocks: [
        { type: 'heading', level: 1, text: response.title },
        { type: 'heading', level: 2, text: 'Setup' },
        { type: 'paragraph', text: response.narrativeSpine.setup },
        { type: 'heading', level: 2, text: 'Conflict' },
        { type: 'paragraph', text: response.narrativeSpine.conflict },
        { type: 'heading', level: 2, text: 'Resolution' },
        { type: 'paragraph', text: response.narrativeSpine.resolution }
      ]
    };
  }

  // Fallback: treat as generic content
  return {
    title: response.title || 'Untitled',
    blocks: [
      { type: 'paragraph', text: JSON.stringify(response, null, 2) }
    ]
  };
}
```

## Option 3: Use Streaming API (Advanced)

If your Banyan backend supports streaming, you can show real-time progress:

### Backend: Streaming Endpoint

```typescript
// /src/app/api/docs-addon/stream/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start generation in background
  (async () => {
    try {
      const body = await request.json();
      
      // Send progress updates
      await writer.write(
        encoder.encode(JSON.stringify({ 
          stage: 'analyzing', 
          progress: 0.1 
        }) + '\n')
      );

      await writer.write(
        encoder.encode(JSON.stringify({ 
          stage: 'generating', 
          progress: 0.5 
        }) + '\n')
      );

      // Generate content
      const result = await generateDocument(body);

      // Send final result
      await writer.write(
        encoder.encode(JSON.stringify({ 
          stage: 'complete', 
          progress: 1.0,
          data: result 
        }) + '\n')
      );

    } catch (error) {
      await writer.write(
        encoder.encode(JSON.stringify({ 
          stage: 'error', 
          error: error.message 
        }) + '\n')
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### Add-on: Handle Streaming

Note: Apps Script doesn't support streaming responses natively, but you can poll:

```javascript
function callBanyanAPIWithProgress_(params) {
  // Start generation
  const startUrl = BANYAN_API_BASE + '/api/docs-addon/generate-async';
  const startResponse = UrlFetchApp.fetch(startUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(params)
  });
  
  const { jobId } = JSON.parse(startResponse.getContentText());

  // Poll for progress
  const pollUrl = BANYAN_API_BASE + '/api/docs-addon/status/' + jobId;
  let complete = false;
  let result = null;

  while (!complete) {
    Utilities.sleep(2000); // Poll every 2 seconds

    const pollResponse = UrlFetchApp.fetch(pollUrl);
    const status = JSON.parse(pollResponse.getContentText());

    if (status.stage === 'complete') {
      complete = true;
      result = status.data;
    } else if (status.stage === 'error') {
      throw new Error(status.error);
    }

    // Update UI with progress (if using cards)
    // This is tricky with the card UI model - better for sidebar
  }

  return result;
}
```

## Authentication Options

### Option 1: API Key (Simplest)

**Backend:**
```typescript
const ADDON_API_KEY = process.env.GOOGLE_ADDON_API_KEY;

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (apiKey !== ADDON_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // ... rest of handler
}
```

**Add-on:**
```javascript
const BANYAN_API_KEY = 'your-api-key-here'; // Store in Script Properties

function callBanyanAPI_(params, retryCount) {
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-API-Key': BANYAN_API_KEY
    },
    payload: JSON.stringify(params)
  });
  // ...
}
```

### Option 2: User OAuth (Most Secure)

This requires implementing OAuth flow in the add-on, which is complex but provides the best security:

**Backend:** Use Clerk or similar for user authentication

**Add-on:** Store user tokens and refresh as needed

```javascript
function getUserBanyanToken_() {
  const up = PropertiesService.getUserProperties();
  let token = up.getProperty('banyan_access_token');
  
  if (!token || isTokenExpired_(token)) {
    token = refreshBanyanToken_();
  }
  
  return token;
}
```

## Rate Limiting

Implement rate limiting on both sides:

**Backend:**
```typescript
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // ... rest of handler
}
```

**Add-on:** Already handles 429 with exponential backoff

## Testing the Integration

### 1. Test Locally

```bash
# Start your Banyan backend locally
npm run dev

# Update Code.gs temporarily
const BANYAN_API_BASE = 'http://localhost:3000';

# Note: Apps Script can't call localhost directly
# Use ngrok or similar to create a tunnel
ngrok http 3000
```

### 2. Test Response Format

```javascript
// Add to Code.gs for testing
function testBanyanAPI() {
  const testParams = {
    title: 'Test Document',
    audience: 'Developers',
    tone: 'technical',
    context: 'Testing the integration'
  };
  
  const result = callBanyanAPI_(testParams, 0);
  Logger.log(JSON.stringify(result, null, 2));
  
  // Verify format
  if (!result.title) {
    throw new Error('Missing title in response');
  }
  if (!Array.isArray(result.blocks)) {
    throw new Error('Blocks must be an array');
  }
  
  Logger.log('✓ API integration test passed');
}
```

### 3. Test Error Handling

```javascript
function testErrorHandling() {
  try {
    // Test missing title
    callBanyanAPI_({ title: '' }, 0);
    throw new Error('Should have thrown validation error');
  } catch (e) {
    Logger.log('✓ Validation error handled correctly');
  }
  
  // Test rate limiting (if implemented)
  // Test network errors
  // Test malformed responses
}
```

## Deployment Checklist

- [ ] API endpoint created and tested
- [ ] Response format matches add-on expectations
- [ ] Authentication implemented
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] HTTPS enabled (required for production)
- [ ] CORS configured (if needed)
- [ ] API endpoint URL updated in Code.gs
- [ ] Environment variables set in production
- [ ] Monitoring and logging enabled

## Troubleshooting

**"Failed to generate content: 401"**
- Check API key or authentication
- Verify headers are sent correctly

**"Failed to generate content: timeout"**
- Generation takes > 60 seconds (Apps Script limit)
- Consider async/polling approach
- Optimize backend performance

**"Undefined property 'blocks'"**
- Response format doesn't match expected format
- Check transformBanyanResponse_ function
- Log raw API response for debugging

## Next Steps

1. Choose authentication method
2. Create or adapt API endpoint
3. Test integration thoroughly
4. Deploy to production
5. Monitor API usage and errors

---

**Need help?** Check the main README.md or contact the Banyan team.

