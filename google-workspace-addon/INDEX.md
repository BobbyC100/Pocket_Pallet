# Banyan Google Docs Add-on - File Index

Quick reference for all files in this directory.

## 🚀 Start Here

| File | Purpose | Start Here If... |
|------|---------|------------------|
| **[QUICK_START.md](./QUICK_START.md)** | 15-minute setup guide | You want to test it right now |
| **[README.md](./README.md)** | Complete documentation | You want to understand everything |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Production deployment | You're ready to deploy |

## 📝 Core Files

### Code Files

| File | Lines | Description |
|------|-------|-------------|
| **[Code.gs](./Code.gs)** | 700+ | Main application logic (Apps Script) |
| **[Sidebar.html](./Sidebar.html)** | 300+ | HTML UI (optional sidebar interface) |
| **[appsscript.json](./appsscript.json)** | 30 | Manifest and OAuth configuration |

### Key Functions in Code.gs

#### Entry Points
- `onOpen()` - Initializes add-on menu
- `onInstall()` - First-time installation
- `onHomepage()` - Card UI entry point
- `showSidebar()` - Opens HTML sidebar

#### UI Builders
- `buildInputCard_()` - Form for user input
- `buildPreviewCard_()` - Content preview
- `buildErrorCard_()` - Error display
- `buildProgressCard_()` - Loading states

#### Action Handlers
- `handleGenerate()` - Process form and call API
- `handleInsert()` - Write to document
- `handleRetry()` - Retry after error
- `handleCancel()` - Cancel operation

#### Core Logic
- `getDocsSelectionAndMark_()` - Create Named Range for selection
- `getRangeIndexesFromNamedRange_()` - Resolve Named Range to indexes
- `writeSpecToDoc_()` - Insert content with cursor-based indexing
- `callBanyanAPI_()` - Call backend with retry logic
- `transformBanyanResponse_()` - Normalize API response

#### Utilities
- `generatePreviewText_()` - Create text preview
- `getFormValue_()` - Safe form value extraction

## 📚 Documentation Files

### For Users

| File | Purpose | Read Time |
|------|---------|-----------|
| **[README.md](./README.md)** | Complete feature docs, architecture, troubleshooting | 20 min |
| **[QUICK_START.md](./QUICK_START.md)** | Fast setup and testing | 5 min |

### For Developers

| File | Purpose | Read Time |
|------|---------|-----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Technical architecture, data flow, diagrams | 15 min |
| **[INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)** | Backend integration code examples | 15 min |

### For Deployment

| File | Purpose | Read Time |
|------|---------|-----------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Step-by-step production deployment | 30 min |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| **[package.json](./package.json)** | NPM scripts for clasp (optional) |
| **[.clasp.json.template](./.clasp.json.template)** | Clasp configuration template |
| **[.gitignore](./.gitignore)** | Git ignore patterns |

## 📊 File Structure

```
google-workspace-addon/
├── 📄 Code Files
│   ├── Code.gs                   # Main application (700+ lines)
│   ├── Sidebar.html              # HTML UI (300+ lines)
│   └── appsscript.json          # Manifest (30 lines)
│
├── 📖 User Documentation
│   ├── README.md                 # Complete docs (500+ lines)
│   └── QUICK_START.md           # Fast setup (300+ lines)
│
├── 🛠️ Developer Documentation
│   ├── ARCHITECTURE.md          # Technical details (800+ lines)
│   └── INTEGRATION_EXAMPLE.md   # Backend integration (400+ lines)
│
├── 🚀 Deployment
│   └── DEPLOYMENT_GUIDE.md      # Production guide (600+ lines)
│
├── ⚙️ Configuration
│   ├── package.json             # NPM scripts
│   ├── .clasp.json.template     # Clasp config
│   └── .gitignore              # Git ignore
│
└── 📇 This File
    └── INDEX.md                 # You are here
```

## 🎯 Common Tasks

### I Want To...

#### Test the Add-on Locally
1. Read [QUICK_START.md](./QUICK_START.md)
2. Copy [Code.gs](./Code.gs), [Sidebar.html](./Sidebar.html), [appsscript.json](./appsscript.json)
3. Update `BANYAN_API_BASE` in Code.gs
4. Test in a Google Doc

#### Understand How It Works
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
2. Review [Code.gs](./Code.gs) with comments
3. Check specific sections in [README.md](./README.md)

#### Deploy to Production
1. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) step-by-step
2. Set up Google Cloud Project
3. Configure OAuth
4. Deploy and test

#### Integrate with My Backend
1. Read [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)
2. Create API endpoint
3. Update `transformBanyanResponse_()` if needed
4. Test integration

#### Customize the UI
1. For cards: Modify `buildInputCard_()` in [Code.gs](./Code.gs)
2. For sidebar: Edit [Sidebar.html](./Sidebar.html)
3. Test changes with `clasp push`

#### Add New Features
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for extension points
2. Add functions to [Code.gs](./Code.gs)
3. Update [README.md](./README.md) documentation
4. Test thoroughly

## 📏 File Statistics

| Category | Files | Total Lines | Total Size |
|----------|-------|-------------|------------|
| Code | 3 | ~1,100 | ~45 KB |
| Documentation | 6 | ~3,000 | ~120 KB |
| Configuration | 3 | ~50 | ~2 KB |
| **Total** | **12** | **~4,150** | **~167 KB** |

## 🔍 Quick Find

Looking for information about...

### Features
- **Selection handling**: [ARCHITECTURE.md](./ARCHITECTURE.md#2-selection-management)
- **Named Ranges**: [README.md](./README.md#named-ranges-vs-direct-indexes)
- **Retry logic**: [Code.gs](./Code.gs) line 437
- **Error handling**: [ARCHITECTURE.md](./ARCHITECTURE.md#6-error-handling)

### Setup & Deployment
- **Quick test**: [QUICK_START.md](./QUICK_START.md#step-3-test-it-5-min)
- **OAuth setup**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#13-configure-oauth-consent-screen)
- **GCP project**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#step-1-set-up-google-cloud-project)
- **Marketplace**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#step-6-publish-to-workspace-marketplace-optional)

### Integration
- **API endpoint**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md#option-1-create-a-new-api-endpoint)
- **Authentication**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md#authentication-options)
- **Response format**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md#option-2-adapt-existing-endpoint)
- **Rate limiting**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md#rate-limiting)

### Technical Details
- **Data flow**: [ARCHITECTURE.md](./ARCHITECTURE.md#data-flow-examples)
- **Cursor indexing**: [ARCHITECTURE.md](./ARCHITECTURE.md#3-document-writing-engine)
- **State management**: [ARCHITECTURE.md](./ARCHITECTURE.md#5-state-management)
- **Performance**: [ARCHITECTURE.md](./ARCHITECTURE.md#performance-characteristics)

### Troubleshooting
- **Common issues**: [QUICK_START.md](./QUICK_START.md#common-issues)
- **Deployment problems**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting-deployment-issues)
- **Integration errors**: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md#troubleshooting)
- **Testing**: [ARCHITECTURE.md](./ARCHITECTURE.md#testing-strategy)

## 💡 Tips

### For First-Time Users
1. Start with [QUICK_START.md](./QUICK_START.md) - you'll be testing in 15 minutes
2. Don't worry about understanding everything at once
3. The code is well-commented - read it alongside docs
4. Test each feature individually

### For Developers
1. [ARCHITECTURE.md](./ARCHITECTURE.md) explains the "why" behind design decisions
2. All functions follow a consistent naming pattern: `verb_()` for private, `handleVerb()` for public
3. Error handling is consistent across all functions
4. Use clasp for faster development: `npm run watch`

### For Deployers
1. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) in order - don't skip steps
2. Test thoroughly at each stage (dev → test → beta → prod)
3. Keep track of your deployment IDs and versions
4. Set up monitoring before going public

## 🔗 External Resources

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Docs API Reference](https://developers.google.com/docs/api)
- [Workspace Add-ons Guide](https://developers.google.com/workspace/add-ons)
- [Named Ranges API](https://developers.google.com/docs/api/how-tos/named-ranges)
- [Clasp CLI Tool](https://github.com/google/clasp)

## ✅ Checklist: Have I...

Before deploying:
- [ ] Read [QUICK_START.md](./QUICK_START.md) and tested locally?
- [ ] Updated `BANYAN_API_BASE` in [Code.gs](./Code.gs)?
- [ ] Created backend API endpoint per [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)?
- [ ] Tested all three output modes (insert, replace, new doc)?
- [ ] Set up Google Cloud Project per [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)?
- [ ] Configured OAuth consent screen?
- [ ] Added logo and updated `logoUrl` in [appsscript.json](./appsscript.json)?
- [ ] Tested with real users?
- [ ] Set up monitoring and logging?
- [ ] Read security best practices in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)?

## 🆘 Getting Help

**Can't find what you're looking for?**

1. Check the **Quick Find** section above
2. Search across all docs (they're markdown - easy to grep)
3. Review [Code.gs](./Code.gs) comments
4. Check Apps Script logs: View > Logs

**Still stuck?**

- Open an issue on GitHub
- Contact the Banyan team
- Check official Google documentation

## 📝 Notes

- All documentation is in Markdown format
- Code files use Google Apps Script (JavaScript variant)
- Line counts are approximate
- File sizes exclude generated files (.clasp.json, node_modules)

---

**Last Updated**: October 8, 2025

**Version**: 1.0.0

**Status**: ✅ Production Ready

