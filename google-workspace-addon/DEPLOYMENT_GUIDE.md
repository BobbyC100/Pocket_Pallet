# Deployment Guide: Banyan Google Docs Add-on

This guide walks you through deploying the Banyan Google Docs Workspace Add-on from development to production.

## Prerequisites

Before you begin, ensure you have:

- [ ] Google Account with Apps Script access
- [ ] Banyan backend deployed and accessible via HTTPS
- [ ] Google Cloud Project (create at [console.cloud.google.com](https://console.cloud.google.com))
- [ ] Logo image (512x512 PNG) hosted on a public URL

## Step 1: Set Up Google Cloud Project

### 1.1 Create or Select a Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** > **New Project**
3. Name it "Banyan Add-on"
4. Click **Create**

### 1.2 Enable Required APIs

1. In Cloud Console, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - Google Docs API
   - Google Drive API
   - Google Apps Script API

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (or **Internal** if using Google Workspace)
3. Fill in the application information:
   - **App name**: Banyan AI Writer
   - **User support email**: Your support email
   - **Developer contact email**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/documents.currentonly`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/script.container.ui`
5. Add test users (for testing phase)
6. Click **Save and Continue**

## Step 2: Create Apps Script Project

### 2.1 Initialize the Project

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it "Banyan AI Writer"
4. Go to **Project Settings** (gear icon)
5. Under **Google Cloud Platform (GCP) Project**:
   - Click **Change project**
   - Enter your GCP project number
   - Click **Set project**

### 2.2 Add Code Files

1. **Delete** the default `Code.gs` file
2. Click **+** next to Files
3. Create **Code.gs**:
   - Copy contents from `Code.gs`
   - Update `BANYAN_API_BASE` constant:
     ```javascript
     const BANYAN_API_BASE = 'https://your-actual-domain.vercel.app';
     ```
4. Add **Sidebar.html**:
   - Click **+** > **HTML**
   - Name it "Sidebar"
   - Copy contents from `Sidebar.html`
5. Update **appsscript.json**:
   - Click the project settings gear
   - Enable **Show "appsscript.json" manifest file**
   - Click on `appsscript.json` in the file list
   - Replace with contents from `appsscript.json`
   - Update `logoUrl` with your actual logo URL

### 2.3 Save and Version

1. Click **Save project** (Ctrl/Cmd + S)
2. Go to **Manage versions** (clock icon)
3. Add description: "Initial version"
4. Click **Save new version**

## Step 3: Test the Add-on

### 3.1 Create Test Document

1. Open [Google Docs](https://docs.google.com)
2. Create a new document
3. Name it "Banyan Add-on Test"

### 3.2 Test as Add-on

1. In Apps Script editor, click **Run** > **Test as add-on**
2. Configure test:
   - **Document**: Select your test document
   - **Installed**: Checked
   - **Enabled**: Checked
3. Click **Test**

### 3.3 Verify Functionality

In your test document:

1. **Menu appears**: Check **Add-ons** > **Banyan AI Writer**
2. **Start Banyan**: Click to open sidebar
3. **Form loads**: Verify all fields appear
4. **Test generation**:
   - Fill in title: "Test Document"
   - Select tone: Professional
   - Choose destination: "Insert at cursor"
   - Click **Generate**
5. **Preview appears**: Verify content preview
6. **Insert works**: Click "Insert into Doc"
7. **Content appears**: Verify formatting (headings, lists, etc.)

### 3.4 Test Selection Replacement

1. Type some text in the document
2. Select the text
3. Open Banyan sidebar
4. Fill in form
5. Choose "Replace selected text"
6. Generate and insert
7. Verify the selected text is replaced

### 3.5 Check Error Handling

1. Try generating without a title (should show error)
2. Try "Replace selection" without selecting text (should show error)
3. Verify retry works on network errors

## Step 4: Deploy for Testing

### 4.1 Create Test Deployment

1. In Apps Script editor, click **Deploy** > **Test deployments**
2. Click **Install**
3. Select your test document
4. Click **Done**

### 4.2 Share with Beta Testers

1. Click **Deploy** > **Manage deployments**
2. Click **Create deployment**
3. Select **Add-on**
4. Configuration:
   - **Version**: Latest
   - **Description**: Beta test version
5. Click **Deploy**
6. Copy the deployment ID
7. Share with beta testers:
   - Send them the add-on URL
   - They must be added as test users in OAuth consent screen

## Step 5: Production Deployment

### 5.1 Prepare for Production

1. **Test thoroughly** with beta users
2. **Fix any reported issues**
3. **Update version**:
   - Make fixes
   - Save new version
   - Add detailed version notes

### 5.2 Create Production Deployment

1. Click **Deploy** > **New deployment**
2. Type: **Add-on**
3. Configuration:
   - **Version**: Latest stable version
   - **Description**: Production v1.0
   - **Execute as**: User accessing the app
   - **Who has access**: Anyone (or your organization)
4. Click **Deploy**
5. Copy deployment ID and URL

### 5.3 Update OAuth Consent Screen

1. Go to GCP Console > OAuth consent screen
2. Change **Publishing status** to **In Production**
3. Click **Publish app**
4. (If external) Submit for verification:
   - Requires privacy policy
   - Requires terms of service
   - May take 2-4 weeks for Google review

## Step 6: Publish to Workspace Marketplace (Optional)

### 6.1 Prepare Marketplace Listing

Required materials:
- [ ] Logo (512x512 PNG)
- [ ] Screenshots (1280x800 PNG, at least 2)
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Support URL
- [ ] Detailed description
- [ ] Category selection
- [ ] Pricing information

### 6.2 Enable Marketplace SDK

1. Go to GCP Console
2. **APIs & Services** > **Library**
3. Search for "Google Workspace Marketplace SDK"
4. Click **Enable**

### 6.3 Configure Marketplace Listing

1. In GCP Console, go to **Google Workspace Marketplace SDK**
2. Click **App Configuration**
3. Fill in:
   - **Application name**: Banyan AI Writer
   - **Short description**: (< 80 chars)
   - **Long description**: (< 4000 chars)
   - **Application icon**: Upload 512x512 logo
   - **Screenshots**: Upload at least 2 screenshots
   - **Support URL**: Your support page
   - **Privacy policy URL**: Your privacy policy
   - **Terms of service URL**: Your ToS
4. Under **Extensions**:
   - Click **Add Google Docs extension**
   - Enter your Apps Script project ID
   - Select the add-on deployment
5. Under **OAuth Scopes**:
   - Verify all required scopes are listed
   - Add justifications for each scope
6. Under **Distribution**:
   - Select regions
   - Select languages
   - Set visibility (public/private)
7. Click **Save**

### 6.4 Submit for Review

1. Review all information
2. Click **Submit for Review**
3. Google will review within 3-5 business days
4. Address any feedback from Google
5. Once approved, your add-on is live!

## Step 7: Monitor and Maintain

### 7.1 Set Up Monitoring

1. **Apps Script Logs**:
   - View > Logs (in Apps Script editor)
   - Review for errors
2. **Google Cloud Logging**:
   - GCP Console > Logging
   - Create alerts for errors
3. **Usage Metrics**:
   - Apps Script > Executions
   - Track daily active users

### 7.2 Handle Updates

When you need to update:

1. Make changes in Apps Script editor
2. Test thoroughly in test deployment
3. Create new version
4. Deploy to production
5. Update Marketplace listing if needed
6. Notify users of changes

### 7.3 Support

Set up support channels:
- Email: support@your-domain.com
- Documentation: Link to README.md
- Issue tracker: GitHub Issues or similar
- FAQ page: Common questions and solutions

## Troubleshooting Deployment Issues

### "OAuth Error"

**Cause**: Scopes not configured correctly

**Solution**:
1. Check `appsscript.json` has all required scopes
2. Verify OAuth consent screen includes same scopes
3. Re-authorize the add-on

### "Script not found"

**Cause**: GCP project not linked correctly

**Solution**:
1. Verify GCP project number in Apps Script settings
2. Ensure Apps Script API is enabled in GCP
3. Re-link the project

### "Permission denied"

**Cause**: User hasn't granted permissions

**Solution**:
1. User must accept OAuth consent
2. Verify all scopes are justified in consent screen
3. Check if app is in test mode (limited users)

### "Add-on doesn't appear in menu"

**Cause**: Not properly installed or authorized

**Solution**:
1. Reload the document
2. Check if add-on is enabled: Add-ons > Manage add-ons
3. Reinstall the add-on
4. Check for JavaScript errors in browser console

## Security Best Practices

1. **Minimize Scopes**: Only request necessary permissions
2. **Validate Input**: Always validate user input server-side
3. **Secure API Calls**: Use HTTPS only for Banyan API
4. **Clean Up**: Remove Named Ranges after use
5. **Rate Limiting**: Implement server-side rate limits
6. **Error Messages**: Don't expose sensitive info in errors
7. **Audit Logs**: Log all API calls for security review

## Performance Optimization

1. **Batch Operations**: Use `batchUpdate` instead of multiple calls
2. **Cache**: Cache repeated API calls when possible
3. **Async**: Use async operations where possible
4. **Minimize Payload**: Only send necessary data to Banyan API
5. **Progress Indicators**: Show progress for long operations [[memory:9585025]]

## Rollback Procedure

If you need to rollback:

1. Go to Apps Script > Deploy > Manage deployments
2. Find the previous stable version
3. Click **Edit** on current deployment
4. Change **Version** to previous version
5. Click **Deploy**
6. Notify users of the rollback

## Checklist: Ready for Production?

- [ ] All features tested thoroughly
- [ ] Error handling covers edge cases
- [ ] OAuth scopes minimized and justified
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support channels set up
- [ ] Documentation complete
- [ ] Logo and screenshots ready
- [ ] Banyan API endpoint configured correctly
- [ ] GCP project set up and linked
- [ ] Monitoring and logging configured
- [ ] Beta tested with real users
- [ ] Performance acceptable (< 60s generation)
- [ ] Security review completed
- [ ] Rollback procedure tested

## Cost Considerations

**Google Apps Script**:
- Free for up to 20,000 URL Fetch calls/day
- Free for up to 6 minutes runtime per execution
- Free for up to 90 minutes daily execution time

**Google Cloud**:
- API calls: Most Docs/Drive API calls are free
- Monitoring: Free tier includes basic logging

**Banyan API**:
- Depends on your backend infrastructure
- Consider rate limiting per user
- Monitor costs and set budgets

## Next Steps

After deployment:

1. **Gather Feedback**: Collect user feedback
2. **Iterate**: Plan feature improvements
3. **Scale**: Optimize for larger user base
4. **Integrate**: Add more Banyan features
5. **Expand**: Consider Sheets, Slides add-ons

## Support Resources

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Workspace Add-ons Guide](https://developers.google.com/workspace/add-ons)
- [Marketplace Publishing Guide](https://developers.google.com/workspace/marketplace/how-to-publish)
- [OAuth Best Practices](https://developers.google.com/identity/protocols/oauth2/best-practices)
- [Banyan Documentation](../README.md)

---

**Questions?** Contact the Banyan team or refer to the main README.md for technical details.

