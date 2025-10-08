# Add-on Architecture

This document explains the technical architecture of the Banyan Google Docs Add-on.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Docs UI                          │
│  ┌────────────────┐              ┌────────────────┐         │
│  │  Document Menu │              │    Sidebar     │         │
│  │  "Banyan AI"   │              │   (Optional)   │         │
│  └────────┬───────┘              └────────┬───────┘         │
│           │                               │                  │
└───────────┼───────────────────────────────┼──────────────────┘
            │                               │
            └───────────┬───────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Apps Script (Code.gs)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Card Service UI                                      │  │
│  │  • buildInputCard_()                                 │  │
│  │  • buildPreviewCard_()                               │  │
│  │  • buildErrorCard_()                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Action Handlers                                      │  │
│  │  • handleGenerate()                                  │  │
│  │  • handleInsert()                                    │  │
│  │  • handleCancel()                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Selection Management                                 │  │
│  │  • getDocsSelectionAndMark_()                        │  │
│  │  • getRangeIndexesFromNamedRange_()                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Document Writing                                     │  │
│  │  • writeSpecToDoc_()                                 │  │
│  │  • Cursor-based indexing                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Integration                                      │  │
│  │  • callBanyanAPI_()                                  │  │
│  │  • transformBanyanResponse_()                        │  │
│  │  • Retry with exponential backoff                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Banyan Backend                            │
│         (Your existing Next.js application)                  │
│                                                              │
│  POST /api/docs-addon/generate                               │
│  {                                                           │
│    title: "...",                                             │
│    audience: "...",                                          │
│    tone: "...",                                              │
│    context: "..."                                            │
│  }                                                           │
│                                                              │
│  Returns:                                                    │
│  {                                                           │
│    title: "...",                                             │
│    blocks: [                                                 │
│      { type: "heading", level: 1, text: "..." },            │
│      { type: "paragraph", text: "..." },                    │
│      { type: "bullets", items: [...] }                      │
│    ]                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. User Interface Layer

#### Card Service (Primary UI)
The add-on uses Google's Card Service for the primary interface:

**Input Card**
- Text inputs for title, audience, context
- Dropdown for tone selection
- Radio buttons for destination choice
- Generate button with loading indicator

**Preview Card**
- Shows generated content preview
- Insert and Cancel buttons
- Clear call-to-action

**Error Card**
- User-friendly error messages
- Retry button (when applicable)
- Back button

**Progress Card**
- Loading spinner
- Status messages
- Stage indicators

#### Sidebar (Alternative UI)
Optional HTML sidebar for richer interactions:
- Custom styling with CSS
- Real-time form validation
- Enhanced visual feedback
- Better for complex workflows

### 2. Selection Management

The most critical part of the architecture for accurate text replacement:

```javascript
// Step 1: Mark Selection
User selects text in document
    ↓
getDocsSelectionAndMark_()
    ↓
Create Named Range: "BANYAN_TMP_RANGE_1696776000000"
    ↓
Store: { name: "...", id: "..." }

// Step 2: Resolve to Indexes
Before insertion
    ↓
getRangeIndexesFromNamedRange_(docId, rangeName)
    ↓
Docs API: GET /v1/documents/{docId}?fields=namedRanges
    ↓
Parse response: { startIndex: 245, endIndex: 389 }

// Step 3: Use for Replacement
writeSpecToDoc_()
    ↓
Delete content at [startIndex, endIndex]
    ↓
Insert new content at startIndex
    ↓
Clean up Named Range
```

**Why Named Ranges?**
- Document indexes shift as content changes
- Named Ranges are maintained by Google Docs
- Always resolve to current positions
- Survive edits between mark and insert

### 3. Document Writing Engine

Uses cursor-based approach to avoid indexing errors:

```javascript
// Initialize
let cursor = { index: startIndex };  // or null for end-of-doc
const requests = [];

// For each block
block.forEach(b => {
  const text = b.text + '\n';
  const blockStart = cursor.index;
  
  // Insert text
  requests.push({
    insertText: {
      location: cursor,
      text: text
    }
  });
  
  // Advance cursor
  cursor.index += text.length;
  
  // Apply styling at known range
  if (b.type === 'heading') {
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: blockStart,
          endIndex: cursor.index
        },
        paragraphStyle: {
          namedStyleType: 'HEADING_' + b.level
        },
        fields: 'namedStyleType'
      }
    });
  }
});

// Execute all at once
Docs.Documents.batchUpdate({ requests }, docId);
```

**Advantages:**
- No off-by-one errors
- Handles multiple blocks correctly
- Styles apply to exact ranges
- Single batchUpdate call (fast)

### 4. API Integration Layer

#### Request Flow

```javascript
handleGenerate(e)
  ↓
Extract form values
  ↓
Validate inputs
  ↓
Mark selection (if needed)
  ↓
callBanyanAPI_(params, retryCount=0)
  ↓
  ├─ Success (200) → Transform response
  ├─ Rate limit (429) → Retry after delay
  ├─ Server error (5xx) → Retry after delay
  └─ Other error → Show error card
  ↓
Store result in UserProperties
  ↓
buildPreviewCard_()
```

#### Retry Logic

```javascript
Attempt 1: Immediate
  ↓ (429 or 5xx)
Wait 250ms
  ↓
Attempt 2
  ↓ (429 or 5xx)
Wait 500ms
  ↓
Attempt 3
  ↓ (429 or 5xx)
Wait 1000ms
  ↓
Attempt 4
  ↓
Fail with error card
```

#### Response Transformation

```javascript
Banyan API Response (flexible format)
  ↓
transformBanyanResponse_()
  ↓
Normalized Block Format:
{
  title: string,
  blocks: [
    { type: 'heading', level: number, text: string },
    { type: 'paragraph', text: string },
    { type: 'bullets', items: string[] },
    { type: 'numbered_list', items: string[] },
    { type: 'table', rows: string[][] }
  ]
}
  ↓
writeSpecToDoc_()
```

### 5. State Management

Uses `PropertiesService.getUserProperties()` for temporary state:

```javascript
// During generation
up.setProperty('destination', 'replace_selection');
up.setProperty('banyan_tmp_range_name', 'BANYAN_TMP_RANGE_...');
up.setProperty('banyan_doc_id', docId);
up.setProperty('banyan_spec', JSON.stringify(spec));

// During insertion
const spec = JSON.parse(up.getProperty('banyan_spec'));
const rangeName = up.getProperty('banyan_tmp_range_name');

// After completion
up.deleteAllProperties(); // Clean up
```

**Why UserProperties?**
- Persists between function calls
- User-specific (no conflicts)
- Survives card rebuilds
- Automatically cleaned up

### 6. Error Handling

Three-layer approach:

**Layer 1: Validation**
```javascript
if (!title.trim()) {
  return buildErrorCard_('Please provide a title', false);
}

if (destination === 'replace_selection' && !hasSelection()) {
  return buildErrorCard_('Please select text first', false);
}
```

**Layer 2: API Errors**
```javascript
try {
  const response = UrlFetchApp.fetch(...);
  if (response.getResponseCode() === 429) {
    // Retry automatically
  }
} catch (err) {
  return buildErrorCard_('Network error: ' + err.message, true);
}
```

**Layer 3: Document Errors**
```javascript
try {
  writeSpecToDoc_(docId, spec, range);
} catch (err) {
  Logger.log('Write error:', err);
  return buildErrorCard_('Failed to insert content', false);
}
```

## Data Flow Examples

### Example 1: Insert at Cursor

```
1. User fills form
   └─ Title: "Product Strategy"
   └─ Tone: "executive"
   └─ Destination: "insert_here"

2. handleGenerate()
   └─ Validate: ✓ Title present
   └─ No selection marking needed
   └─ Store destination: "insert_here"

3. callBanyanAPI_()
   └─ POST to Banyan backend
   └─ Receive: { title, blocks: [...] }
   └─ Store in UserProperties

4. buildPreviewCard_()
   └─ Show content preview
   └─ Wait for user

5. User clicks "Insert"

6. handleInsert()
   └─ Load spec from UserProperties
   └─ selectionRange = null (insert at end)

7. writeSpecToDoc_(docId, spec, null)
   └─ cursor = null (means end of document)
   └─ insertText("# Product Strategy\n")
   └─ insertText("Executive summary...\n")
   └─ Apply heading style to first paragraph
   └─ batchUpdate()

8. Clean up
   └─ Delete UserProperties
   └─ Show success notification
```

### Example 2: Replace Selection

```
1. User selects text: "OLD CONTENT HERE"

2. User fills form
   └─ Title: "New Content"
   └─ Destination: "replace_selection"

3. handleGenerate()
   └─ Validate: ✓ Title present
   └─ getDocsSelectionAndMark_()
      └─ Get selection from DocumentApp
      └─ Create Named Range: "BANYAN_TMP_RANGE_1234567890"
      └─ Store: { name, id }
   └─ Store destination: "replace_selection"

4. callBanyanAPI_()
   └─ Generate content
   └─ Store spec

5. buildPreviewCard_()
   └─ User reviews

6. User clicks "Insert"

7. handleInsert()
   └─ Load spec and rangeName
   └─ getRangeIndexesFromNamedRange_(docId, rangeName)
      └─ Docs API call
      └─ Returns: { startIndex: 100, endIndex: 120 }

8. writeSpecToDoc_(docId, spec, { startIndex: 100, endIndex: 120 })
   └─ Delete content at [100, 120]
   └─ cursor = { index: 100 }
   └─ Insert new content starting at 100
   └─ Apply styles
   └─ batchUpdate()

9. Clean up
   └─ Remove Named Range
   └─ Delete UserProperties
   └─ Success notification
```

## Security Architecture

### OAuth Scopes

```
documents.currentonly → Read/write current doc only (minimal)
documents            → Full Docs API access (for Named Ranges)
drive.file           → Create new documents
script.container.ui  → Show UI elements
```

### Data Flow Security

```
User Input
  ↓
Validation (client-side)
  ↓
Apps Script (server-side validation)
  ↓
HTTPS → Banyan Backend
  ↓
[Optional] Authentication check
  ↓
Generate content
  ↓
HTTPS → Apps Script
  ↓
Transform and validate
  ↓
Insert to document
  ↓
Clean up temporary data
```

### No Persistent Storage
- UserProperties used only during active session
- Named Ranges removed after insertion
- No user data stored permanently
- No external databases

## Performance Characteristics

### Execution Times

| Operation | Time | Notes |
|-----------|------|-------|
| Open sidebar | < 1s | Initial load |
| Show card | < 500ms | Card rendering |
| Mark selection | < 100ms | Named Range creation |
| API call | 30-60s | Depends on Banyan backend |
| Resolve Named Range | < 500ms | Docs API call |
| Insert content | 1-2s | batchUpdate execution |
| Total (insert) | 32-64s | End-to-end |
| Total (replace) | 33-65s | End-to-end + Named Range |

### Optimization Strategies

1. **Batch Operations**: Single batchUpdate vs multiple calls
2. **Minimal API Calls**: Only necessary Docs API requests
3. **Efficient State**: UserProperties vs CacheService
4. **Async Where Possible**: Non-blocking operations
5. **Progress Feedback**: Keep user informed during long operations

## Scalability Considerations

### Apps Script Limits

| Limit | Value | Impact |
|-------|-------|--------|
| Execution time | 6 min | Must complete generation in < 6min |
| URL Fetch | 20K/day | Should be fine for most use cases |
| Property size | 9KB | Limit spec size stored |
| Daily execution time | 90 min | Per user, rarely an issue |

### Handling Large Documents

For very large generated content (> 1MB):
1. Split into chunks
2. Multiple batchUpdate calls
3. Progress indicators between chunks
4. Consider async generation with polling

### Rate Limiting

Backend should implement:
```
Per user: 10 requests/minute
Per IP: 100 requests/hour
Global: Monitor and adjust
```

## Extension Points

The architecture is designed for easy extension:

### Add New Block Types

```javascript
// In writeSpecToDoc_()
case 'custom_block':
  const customText = block.content;
  insertText(customText);
  applyCustomFormatting(blockStart, cursor.index);
  break;
```

### Add Authentication

```javascript
// In callBanyanAPI_()
const headers = {
  'Authorization': 'Bearer ' + getUserToken_(),
  'Content-Type': 'application/json'
};
```

### Add Caching

```javascript
function getCachedOrGenerate_(params) {
  const cache = CacheService.getUserCache();
  const key = JSON.stringify(params);
  const cached = cache.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = callBanyanAPI_(params, 0);
  cache.put(key, JSON.stringify(result), 300); // 5 min
  return result;
}
```

### Add Analytics

```javascript
function trackEvent_(eventName, properties) {
  const url = 'https://your-analytics.com/track';
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: JSON.stringify({
      event: eventName,
      properties: properties,
      userId: Session.getActiveUser().getEmail()
    })
  });
}

// In handlers
trackEvent_('document_generated', { tone, destination });
```

## Testing Strategy

### Unit Testing (Manual)

```javascript
function testGetSelection() {
  try {
    const mark = getDocsSelectionAndMark_();
    Logger.log('✓ Selection marked: ' + mark.name);
  } catch (e) {
    Logger.log('✗ Failed: ' + e.message);
  }
}

function testAPICall() {
  const result = callBanyanAPI_({
    title: 'Test',
    audience: 'test',
    tone: 'professional',
    context: ''
  }, 0);
  
  if (!result.title || !result.blocks) {
    throw new Error('Invalid API response');
  }
  
  Logger.log('✓ API call successful');
}
```

### Integration Testing

1. Test full flow: form → generate → insert
2. Test error cases: missing data, API errors
3. Test edge cases: empty selection, large content
4. Test cleanup: verify Named Ranges removed

### User Acceptance Testing

1. Different document types
2. Various content lengths
3. Multiple users simultaneously
4. Different browsers
5. Mobile (if applicable)

## Monitoring and Debugging

### Logging Strategy

```javascript
// Info logs
Logger.log('Generate started for: ' + title);

// Debug logs
Logger.log('API response: ' + JSON.stringify(response));

// Error logs
Logger.log('ERROR: ' + err.toString() + '\nStack: ' + err.stack);
```

### Monitoring Points

1. **Apps Script Executions**: View in Apps Script dashboard
2. **Error Rates**: Track in Google Cloud Logging
3. **API Performance**: Monitor backend response times
4. **User Feedback**: In-app feedback mechanism

## Deployment Architecture

```
Development
  ↓
Test Deployment (specific users)
  ↓
Beta Deployment (organization)
  ↓
Production Deployment (public)
  ↓
Marketplace (optional)
```

Each stage has its own:
- Apps Script version
- GCP project configuration
- OAuth consent screen settings
- Monitoring setup

---

This architecture provides a solid foundation for the Banyan Google Docs Add-on while remaining flexible for future enhancements.

