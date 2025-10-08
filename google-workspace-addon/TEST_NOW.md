# Test the Add-on NOW! ✅

Your backend is ready and running. Let's test the Google Docs Add-on!

## ✅ Backend Status

```
✓ API Endpoint Created: /api/docs-addon/generate
✓ Server Running: http://localhost:3000
✓ Test Successful: Generated document in ~15 seconds
✓ Cost per generation: ~$0.017 (GPT-4o)
```

## 📋 5-Minute Testing Steps

### Step 1: Configure for Local Testing (2 min)

The backend is running on `localhost:3000`, but Google Apps Script can't access localhost directly. We have 2 options:

#### Option A: Use Ngrok (Recommended for testing)

```bash
# Install ngrok if you don't have it
brew install ngrok

# Create a tunnel to your local server
ngrok http 3000
```

This will give you a URL like: `https://abc123.ngrok.io`

**Then update Code.gs line 14:**
```javascript
const BANYAN_API_BASE = 'https://abc123.ngrok.io'; // Your ngrok URL
```

#### Option B: Deploy to Vercel (For real testing)

```bash
cd /Users/bobbyciccaglione/Banyan
vercel deploy

# After deployment, update Code.gs with the Vercel URL
```

### Step 2: Create Apps Script Project (2 min)

1. **Go to** [script.google.com](https://script.google.com)

2. **Click** "New project"

3. **Name it** "Banyan Test"

4. **Delete** the default `Code.gs`

5. **Add Code.gs**:
   - Click **+ Add file** > **Script**
   - Name it "Code"
   - Copy contents from `/Users/bobbyciccaglione/Banyan/google-workspace-addon/Code.gs`
   - **Update line 14** with your ngrok or Vercel URL

6. **Add Sidebar.html**:
   - Click **+ Add file** > **HTML**
   - Name it "Sidebar"
   - Copy contents from `/Users/bobbyciccaglione/Banyan/google-workspace-addon/Sidebar.html`

7. **Update appsscript.json**:
   - Click ⚙️ Project Settings
   - Check ☑️ "Show appsscript.json manifest file"
   - Click on `appsscript.json` in file list
   - Replace with contents from `/Users/bobbyciccaglione/Banyan/google-workspace-addon/appsscript.json`

8. **Save**: Press `Ctrl/Cmd + S`

### Step 3: Test in Google Docs (1 min)

1. **Create a test document**:
   - Go to [docs.google.com](https://docs.google.com)
   - Create a new blank document
   - Name it "Add-on Test"

2. **Run the add-on**:
   - Go back to Apps Script editor
   - Select function dropdown → Choose `onOpen`
   - Click **Run**
   - **Authorize** when prompted (accept all permissions)

3. **Refresh your Google Doc**:
   - Go back to your test document
   - Refresh the page (F5)

4. **Open Banyan**:
   - Look in menu: **Add-ons** > **Banyan AI Writer** > **Start Banyan**
   - The sidebar should open! 🎉

### Step 4: Generate Content (1 min)

1. **Fill in the form**:
   ```
   Title: Product Strategy Q4 2025
   Audience: Executive Team
   Tone: Professional
   Context: Focus on AI integration
   Destination: Insert at cursor
   ```

2. **Click "Generate Document"**

3. **Wait 15-30 seconds** (you'll see loading indicator)

4. **Review preview** when it appears

5. **Click "Insert into Doc"**

6. **Your content should appear!** 🎉

## 🧪 What to Test

### Test 1: Insert at Cursor
- ✅ Fill form
- ✅ Click "Generate"
- ✅ Wait for preview
- ✅ Click "Insert"
- ✅ Content appears at cursor position

### Test 2: Replace Selection
- ✅ Type some text: "Replace this"
- ✅ Select the text
- ✅ Open Banyan sidebar
- ✅ Fill form
- ✅ Choose "Replace selected text"
- ✅ Generate and insert
- ✅ Selected text is replaced

### Test 3: New Document
- ✅ Fill form
- ✅ Choose "Create new document"
- ✅ Generate and insert
- ✅ New document created with content

### Test 4: Error Handling
- ✅ Try without title (should show error)
- ✅ Try "Replace selection" without selecting (should show error)
- ✅ Verify errors are user-friendly

### Test 5: Different Content Types
Check that these appear correctly:
- ✅ Headings (different levels)
- ✅ Paragraphs
- ✅ Bullet lists
- ✅ Numbered lists
- ✅ Proper formatting

## 📸 Expected Results

### API Response Example

The API returns:
```json
{
  "title": "Product Strategy Test",
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "Executive Summary"
    },
    {
      "type": "paragraph",
      "text": "..."
    },
    {
      "type": "bullets",
      "items": ["Item 1", "Item 2", "Item 3"]
    },
    {
      "type": "numbered_list",
      "items": ["First", "Second", "Third"]
    }
  ],
  "metadata": {
    "generatedAt": "2025-10-08T...",
    "duration": 14886,
    "cost": {
      "total": 0.0167,
      "tokens": {...}
    }
  }
}
```

### Google Doc Output

You should see:
```
# Executive Summary

The purpose of this Product Strategy Test document is...

1. Outline essential components
2. Evaluate current methodologies
3. Identify areas for improvement

# Key Strategic Points

Our product strategy is built around three core pillars...

• Focus on innovation
• Use data-driven insights
• Maintain flexibility
```

## 🐛 Troubleshooting

### "Add-on menu doesn't appear"
- **Solution**: Refresh the document, run `onOpen` again

### "Failed to generate content"
- **Check**: Is ngrok/Vercel URL correct in Code.gs line 14?
- **Check**: Is the backend server running?
- **Check**: Look at Apps Script logs (View > Logs)

### "No selection in the document"
- **Solution**: You chose "Replace selection" but didn't select text
- **Fix**: Select text first, then generate

### "Authorization required"
- **Solution**: Click "Review Permissions" → Allow
- **Note**: This is normal for first run

### Ngrok timeout
- **Issue**: Free ngrok URLs expire after a few hours
- **Solution**: Restart ngrok, update Code.gs with new URL

## 📊 Performance Metrics

From our test:
```
Generation Time: ~15 seconds
API Cost: $0.017 per document
Token Usage: 1,294 tokens (266 input + 1,028 output)
Response Size: 5.4 KB
Blocks Generated: 36 blocks
```

## 🎯 Success Criteria

You've successfully tested when:
- ✅ Add-on menu appears in Google Docs
- ✅ Sidebar opens without errors
- ✅ Form accepts input
- ✅ Generation completes in < 30 seconds
- ✅ Preview shows generated content
- ✅ Content inserts correctly into document
- ✅ Formatting is preserved (headings, lists, etc.)
- ✅ Selection replacement works
- ✅ Error handling is graceful

## 🚀 Next Steps After Testing

Once testing is successful:

### For Development
1. **Add more features**:
   - Custom templates
   - Image insertion
   - Tables
   - Collaboration

2. **Improve prompts**:
   - Edit `createDocumentPrompt()` in route.ts
   - Adjust tone/style
   - Add more context

3. **Customize UI**:
   - Edit Sidebar.html styles
   - Add more form fields
   - Improve loading states

### For Production
1. **Deploy backend to Vercel**
2. **Update Code.gs with production URL**
3. **Follow DEPLOYMENT_GUIDE.md**
4. **Set up monitoring**
5. **Publish to Workspace Marketplace**

## 🔄 Testing Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. User opens Google Doc                           │
│    └─> Add-ons > Banyan AI Writer > Start Banyan  │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 2. User fills form                                  │
│    • Title: "Product Strategy"                      │
│    • Audience: "Exec Team"                          │
│    • Tone: Professional                             │
│    • Destination: Insert at cursor                  │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 3. Click "Generate"                                 │
│    └─> Apps Script handleGenerate()                │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 4. POST to your backend                             │
│    http://localhost:3000/api/docs-addon/generate   │
│    (via ngrok: https://abc123.ngrok.io/api/...)    │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 5. Backend generates (GPT-4o)                       │
│    ~15 seconds                                      │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 6. Returns structured blocks                        │
│    { title, blocks: [...], metadata }              │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 7. Show preview in sidebar                          │
│    User reviews content                             │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 8. Click "Insert"                                   │
│    └─> writeSpecToDoc_()                           │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│ 9. Content appears in Google Doc! ✨                │
│    • Headings formatted                             │
│    • Lists created                                  │
│    • Paragraphs inserted                            │
└─────────────────────────────────────────────────────┘
```

## 📝 Test Checklist

Print this and check off as you test:

```
☐ Backend server running (npm run dev)
☐ Ngrok tunnel created (if testing locally)
☐ Apps Script project created
☐ Code.gs updated with correct URL
☐ All files copied correctly
☐ Project saved
☐ onOpen() executed successfully
☐ Google Doc created
☐ Add-on menu appears
☐ Sidebar opens
☐ Form accepts input
☐ Generate button works
☐ Loading indicator appears
☐ Generation completes
☐ Preview shows content
☐ Insert button works
☐ Content appears in doc
☐ Formatting is correct
☐ Selection replacement works
☐ Error handling works
☐ Multiple generations work
☐ Cancel button works
```

## 🎉 You're Ready!

Everything is set up. Just follow the steps above and you'll have a working Google Docs add-on in 5 minutes!

**Questions?** Check:
- [README.md](./README.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Detailed setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works

**Have fun testing!** 🚀

