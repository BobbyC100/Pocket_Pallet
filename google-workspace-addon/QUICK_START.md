# Quick Start: Banyan Google Docs Add-on

Get the Banyan add-on running in 15 minutes.

## Prerequisites

- Google Account
- Banyan backend deployed and accessible

## Step 1: Create Apps Script Project (5 min)

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it "Banyan AI Writer"
4. Delete the default `Code.gs`

## Step 2: Add Code Files (3 min)

### Add Code.gs

1. Click **+** next to Files
2. Select **Script**
3. Name it "Code"
4. Copy the contents from [`Code.gs`](./Code.gs)
5. **IMPORTANT**: Update line 14:
   ```javascript
   const BANYAN_API_BASE = 'https://your-banyan-deployment.vercel.app';
   ```
   Replace with your actual Banyan URL

### Add Sidebar.html

1. Click **+** next to Files
2. Select **HTML**
3. Name it "Sidebar"
4. Copy the contents from [`Sidebar.html`](./Sidebar.html)

### Add appsscript.json

1. Click the gear icon (Project Settings)
2. Check **Show "appsscript.json" manifest file**
3. Click on `appsscript.json` in the file list
4. Replace contents with [`appsscript.json`](./appsscript.json)
5. Update the `logoUrl` if you have a logo

### Save

Press **Ctrl/Cmd + S** to save

## Step 3: Test It (5 min)

### Create a Test Document

1. Open [Google Docs](https://docs.google.com)
2. Create a new blank document
3. Name it "Add-on Test"

### Run the Add-on

1. In Apps Script editor, select the function dropdown
2. Choose `onOpen`
3. Click **Run**
4. **Authorize** when prompted (accept all permissions)

### Test in Google Docs

1. Go back to your test document
2. Refresh the page (F5)
3. Look in the menu: **Add-ons** > **Banyan AI Writer** > **Start Banyan**
4. The sidebar should open!

### Generate Content

1. Fill in the form:
   - **Title**: "My First Test"
   - **Audience**: "Team"
   - **Tone**: Professional
   - **Context**: "This is a test"
2. Choose **Insert at cursor**
3. Click **Generate Document**
4. Wait 30-60 seconds
5. Click **Insert into Doc**
6. Your content should appear! 🎉

## Step 4: Test Selection Replacement (2 min)

1. Type some text in your document: "Replace this text"
2. Select the text
3. Open Banyan sidebar again
4. Fill in form
5. Choose **Replace selected text**
6. Generate and insert
7. The selected text should be replaced

## Common Issues

### "Add-on menu doesn't appear"

- Refresh the document
- Run `onOpen` again in Apps Script
- Check browser console for errors (F12)

### "No selection in the document"

- You chose "Replace selected text" but didn't select anything
- Select text first, then generate

### "Failed to generate content"

- Check the `BANYAN_API_BASE` URL is correct
- Verify your Banyan backend is running
- Check Apps Script logs: **View** > **Logs**

### "Authorization required"

- Click **Review Permissions**
- Sign in with your Google account
- Click **Allow**

## Next Steps

### For Development

- Modify the code to customize behavior
- Add more fields to the input form
- Customize the styling in Sidebar.html
- Test different content types

### For Production

- Follow the [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Set up a Google Cloud Project
- Configure OAuth properly
- Test with real users

### For Integration

- Read the [Integration Example](./INTEGRATION_EXAMPLE.md)
- Create a dedicated API endpoint
- Add authentication
- Implement rate limiting

## Testing Checklist

Test these scenarios before deploying:

- [ ] Generate and insert at cursor
- [ ] Generate and replace selection
- [ ] Generate new document
- [ ] Handle missing title (should show error)
- [ ] Handle no selection when using "Replace" (should show error)
- [ ] Cancel during preview (should return to form)
- [ ] Multiple generations in one session
- [ ] Different tones and audiences
- [ ] Long context text
- [ ] Special characters in title

## Understanding the Code

### Key Functions

- **`onOpen()`**: Runs when document opens, adds menu item
- **`buildInputCard_()`**: Creates the input form UI
- **`handleGenerate()`**: Processes form, calls Banyan API
- **`getDocsSelectionAndMark_()`**: Marks selection with Named Range
- **`getRangeIndexesFromNamedRange_()`**: Resolves Named Range to indexes
- **`writeSpecToDoc_()`**: Inserts content with cursor-based indexing
- **`callBanyanAPI_()`**: Calls your backend with retry logic

### Data Flow

```
User fills form
    ↓
handleGenerate()
    ↓
Mark selection (if needed) → Named Range created
    ↓
callBanyanAPI_() → Your backend
    ↓
transformBanyanResponse_() → Standardize format
    ↓
Store in UserProperties
    ↓
Show preview card
    ↓
User clicks "Insert"
    ↓
handleInsert()
    ↓
Resolve Named Range → Get indexes
    ↓
writeSpecToDoc_() → Insert content
    ↓
Clean up Named Range
    ↓
Done! ✓
```

## Customization Ideas

### Add More Input Fields

In `buildInputCard_()`, add widgets:

```javascript
.addWidget(CardService.newTextInput()
  .setFieldName('keywords')
  .setTitle('Keywords')
  .setHint('Comma-separated keywords'))
```

### Change Color Scheme

In `Sidebar.html`, update CSS:

```css
.header {
  background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}
```

### Add More Document Types

In `transformBanyanResponse_()`, handle new formats:

```javascript
if (response.pitch) {
  return {
    title: response.pitch.title,
    blocks: [...] // Your custom structure
  };
}
```

### Customize Error Messages

In `buildErrorCard_()`, make messages more specific:

```javascript
if (message.includes('timeout')) {
  message = 'Generation is taking longer than expected. Please try again.';
}
```

## Performance Tips

1. **Optimize API Response**: Only send necessary data
2. **Batch Updates**: Use `batchUpdate` for multiple operations
3. **Minimize Named Ranges**: Clean up after use
4. **Cache When Possible**: Store repeated API calls
5. **Show Progress**: Use loading indicators [[memory:9585025]]

## Security Notes

- Never hardcode API keys in the script
- Use Script Properties for sensitive data
- Validate all user input
- Use HTTPS only for API calls
- Clean up temporary data after use

## Getting Help

1. **Check Logs**: View > Logs in Apps Script editor
2. **Browser Console**: F12 in Google Docs
3. **Review Documentation**: See README.md
4. **Test Incrementally**: Test each feature separately

## Resources

- [Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Docs API Reference](https://developers.google.com/docs/api/reference/rest)
- [Card Service Reference](https://developers.google.com/apps-script/reference/card-service)
- [Banyan Documentation](../README.md)

---

**Ready to deploy?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Need to integrate with your backend?** See [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)

**Have questions?** Open an issue or contact the Banyan team.

