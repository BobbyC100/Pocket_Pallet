# Banyan Google Docs Workspace Add-on

A Google Workspace Add-on that integrates Banyan's AI-powered document generation directly into Google Docs. This add-on allows users to generate strategic documents with proper text selection handling, Named Ranges for stable replacement, and cursor-based indexing for accurate content insertion.

## Features

- **Smart Text Selection**: Uses Named Ranges to maintain stable reference points even as the document changes
- **Multiple Output Modes**:
  - Insert at cursor position
  - Replace selected text
  - Create new document
- **Structured Content Support**: 
  - Headings (H1-H6)
  - Paragraphs
  - Bullet lists
  - Numbered lists
  - Tables
- **Robust Error Handling**: Automatic retry with exponential backoff for rate limiting and server errors
- **Real-time Preview**: Review generated content before inserting
- **Progress Indicators**: Visual feedback during generation [[memory:9585025]]

## Architecture

### Key Components

#### 1. Selection Handling (`getDocsSelectionAndMark_`)

Instead of relying on unstable event parameters, we explicitly fetch the selection using `DocumentApp.getActiveDocument().getSelection()` and mark it with a temporary Named Range:

```javascript
function getDocsSelectionAndMark_() {
  const doc = DocumentApp.getActiveDocument();
  const sel = doc.getSelection();
  if (!sel) throw new Error('No selection in the document.');
  
  const name = NAMED_RANGE_PREFIX + '_' + new Date().getTime();
  const nr = doc.addNamedRange(name, sel.getRangeElements()[0].getElement());
  
  return { name: name, id: nr.getId() };
}
```

#### 2. Stable Index Resolution (`getRangeIndexesFromNamedRange_`)

We use the Docs API to resolve Named Ranges to actual document indexes, ensuring we get correct `startIndex` and `endIndex` values:

```javascript
function getRangeIndexesFromNamedRange_(docId, namedRangeName) {
  const url = `https://docs.googleapis.com/v1/documents/${docId}?fields=namedRanges`;
  const response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() }
  });
  
  const doc = JSON.parse(response.getContentText());
  const range = doc.namedRanges[namedRangeName].namedRanges[0].ranges[0];
  
  return {
    startIndex: range.startIndex,
    endIndex: range.endIndex,
    segmentId: range.segmentId
  };
}
```

#### 3. Cursor-Based Writing (`writeSpecToDoc_`)

We maintain a running cursor index to avoid indexing gotchas when inserting multiple blocks:

```javascript
function writeSpecToDoc_(docId, spec, selectionRange) {
  const requests = [];
  let cursor = null;

  if (selectionRange) {
    requests.push({ deleteContentRange: { range: selectionRange } });
    cursor = { index: selectionRange.startIndex };
  }

  const insertText = (text) => {
    if (cursor) {
      requests.push({ insertText: { location: cursor, text: text } });
      cursor.index += text.length; // Advance cursor
    } else {
      requests.push({ insertText: { endOfSegmentLocation: {}, text: text } });
    }
  };

  // Process blocks...
}
```

#### 4. Retry Logic with Exponential Backoff

We handle 429 (rate limiting) and 5xx (server errors) with automatic retries:

```javascript
function callBanyanAPI_(params, retryCount) {
  try {
    const response = UrlFetchApp.fetch(url, {...});
    const statusCode = response.getResponseCode();
    
    if ((statusCode === 429 || statusCode >= 500) && retryCount < MAX_RETRIES) {
      Utilities.sleep(RETRY_DELAYS[retryCount]); // 250, 500, 1000ms
      return callBanyanAPI_(params, retryCount + 1);
    }
    // ...
  } catch (err) {
    // Retry on timeout
  }
}
```

## Setup Instructions

### 1. Prerequisites

- Google Account with access to Google Apps Script
- Banyan backend deployed and accessible via HTTPS
- Google Cloud Project (for OAuth scopes)

### 2. Create the Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Name it "Banyan AI Writer"

### 3. Add the Code Files

Copy the contents of the following files into your Apps Script project:

- **Code.gs**: Main application code
- **Sidebar.html**: HTML sidebar interface
- **appsscript.json**: Manifest and configuration

### 4. Configure the Banyan API Endpoint

In `Code.gs`, update the `BANYAN_API_BASE` constant with your actual Banyan deployment URL:

```javascript
const BANYAN_API_BASE = 'https://your-banyan-deployment.vercel.app';
```

### 5. Set Up OAuth Scopes

The following scopes are required (already configured in `appsscript.json`):

- `https://www.googleapis.com/auth/documents.currentonly` - Read/write current document
- `https://www.googleapis.com/auth/documents` - Full Docs API access
- `https://www.googleapis.com/auth/drive.file` - Create new documents
- `https://www.googleapis.com/auth/script.container.ui` - Show UI elements

### 6. Deploy as Add-on

#### For Testing:

1. In Apps Script editor, click **Run** > **Test as add-on**
2. Select a test document
3. Click **Test**

#### For Production:

1. Click **Deploy** > **New deployment**
2. Choose **Add-on** as deployment type
3. Fill in add-on details:
   - Name: "Banyan AI Writer"
   - Description: "Generate strategic documents with AI"
   - Logo URL: Your logo image URL
   - Support URL: Your support page
4. Click **Deploy**

### 7. Publish to Google Workspace Marketplace (Optional)

To make the add-on available to all users:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Workspace Marketplace SDK
3. Configure OAuth consent screen
4. Submit add-on for review

## Usage

### Basic Workflow

1. **Open a Google Doc**
2. **Select "Add-ons" > "Banyan AI Writer" > "Start Banyan"**
3. **Fill in the form**:
   - Title: Name of your document
   - Audience: Who will read it
   - Tone: Professional, casual, technical, or executive
   - Context: Additional requirements
4. **Choose output destination**:
   - **Insert at cursor**: Adds content at current cursor position
   - **Replace selected text**: Replaces your selection (select text first!)
   - **Create new document**: Creates a separate Google Doc
5. **Click "Generate"**
6. **Review the preview**
7. **Click "Insert into Doc"** or **"Cancel"**

### Tips

- For **Replace selected text**, select the text you want to replace before clicking Generate
- The add-on supports up to 3 automatic retries for network issues
- Generation typically takes 30-60 seconds [[memory:9585025]]
- You can cancel during preview by clicking "Cancel"

## Technical Details

### Indexing Strategy

When inserting multiple blocks, we use a forward cursor approach:

1. Start with `cursor = { index: startIndex }`
2. For each insertion: 
   - Insert text at `cursor.index`
   - Advance cursor: `cursor.index += text.length`
3. Apply styles/bullets using the calculated ranges

This avoids the brittle `startIndex: -1` hack and ensures accurate positioning.

### Named Ranges vs Direct Indexes

**Why Named Ranges?**
- Document indexes can shift as content is inserted/deleted
- Named Ranges are stable references maintained by Google Docs
- The Docs API resolves them to current indexes at execution time

**When to use `replaceNamedRangeContent`:**
- Plain text replacement only
- For structured content (headings, lists, tables), use `deleteContentRange` + `batchUpdate`

### Error Handling

The add-on handles three types of errors:

1. **Validation Errors**: Missing title, no selection when required
2. **API Errors**: Rate limiting (429), server errors (5xx)
3. **Document Errors**: Failed to insert, invalid content structure

All errors show user-friendly messages with retry options when appropriate.

## API Integration

### Expected Banyan API Response Format

The add-on expects the Banyan API to return:

```json
{
  "title": "Document Title",
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "Main Heading"
    },
    {
      "type": "paragraph",
      "text": "Paragraph content..."
    },
    {
      "type": "bullets",
      "items": ["Item 1", "Item 2", "Item 3"]
    },
    {
      "type": "numbered_list",
      "items": ["First", "Second", "Third"]
    },
    {
      "type": "table",
      "rows": [
        ["Header 1", "Header 2"],
        ["Cell 1", "Cell 2"]
      ]
    }
  ]
}
```

### Modifying the Integration

If your Banyan API uses a different format, modify the `transformBanyanResponse_` function in `Code.gs`:

```javascript
function transformBanyanResponse_(response) {
  // Transform your API response to the expected format
  return {
    title: response.yourTitleField,
    blocks: response.yourBlocksField.map(block => ({
      type: block.yourType,
      text: block.yourText,
      // ... etc
    }))
  };
}
```

## Troubleshooting

### "No selection in the document"

**Cause**: User chose "Replace selected text" but didn't select any text.

**Solution**: Select text in the document before choosing this option.

### "Failed to resolve selection range"

**Cause**: Named Range couldn't be found in the Docs API response.

**Solution**: This usually indicates a timing issue. Try again, or use "Insert at cursor" instead.

### "API error (429)"

**Cause**: Rate limiting from Banyan API.

**Solution**: The add-on automatically retries up to 3 times. If it persists, wait a few minutes.

### Content appears in wrong location

**Cause**: Cursor position or selection changed between generation and insertion.

**Solution**: Don't edit the document between clicking "Generate" and "Insert". The Named Range system should prevent most issues, but extreme edits can cause problems.

## Development

### Local Testing

1. Make changes in the Apps Script editor
2. Save (Ctrl/Cmd + S)
3. Run `onOpen` to initialize the add-on in your test document
4. Test the functionality

### Debugging

Use `Logger.log()` to add debug output:

```javascript
Logger.log('Debug info: ' + JSON.stringify(data));
```

View logs: **View** > **Logs** (Ctrl/Cmd + Enter)

### Version Control

Apps Script doesn't have built-in Git integration. Consider using [clasp](https://github.com/google/clasp) for local development:

```bash
npm install -g @google/clasp
clasp login
clasp clone <scriptId>
```

## Security Considerations

- The add-on only requests necessary OAuth scopes
- User data is not stored permanently (uses `UserProperties` for session state only)
- All API calls use the user's OAuth token
- Named Ranges are cleaned up after use

## Performance

- **Generation time**: 30-60 seconds (depends on Banyan API)
- **Insertion time**: < 2 seconds for typical documents
- **Retry delays**: 250ms, 500ms, 1000ms (exponential backoff)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Apps Script execution logs
- Contact Banyan support

## License

[Your License Here]

## References

- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Workspace Add-ons Guide](https://developers.google.com/workspace/add-ons)
- [Named Ranges in Google Docs](https://developers.google.com/docs/api/how-tos/named-ranges)

