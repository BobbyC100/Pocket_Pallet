# 🧪 Phase 1 Testing Guide

## ✅ What's Complete

1. **Anonymous Sessions** - Auto-generates ID, saves drafts to localStorage
2. **Save Modal** - Beautiful UI with Email + Google CTAs
3. **Clerk Auth** - Magic links + Google OAuth working
4. **Auto-Save** - Drafts auto-saved to localStorage as users create briefs
5. **Save to Cloud** - Authenticated users can save to Supabase
6. **Auth Upgrade** - localStorage drafts migrate to user account after sign-in
7. **RLS Policies** - Owner-scoped access control enabled

---

## 🎯 Test Flow

### **Test 1: Anonymous User Flow**

1. **Open the app** (incognito/private window)
   ```
   http://localhost:3000/new
   ```

2. **Create a brief**
   - Fill out all 8 wizard steps
   - Use the "Load Test Data" button for speed
   - Click "Generate Brief"

3. **Check auto-save**
   - Open browser console (F12)
   - Look for: `💾 Auto-saving draft to localStorage...`
   - Check localStorage:
     ```javascript
     localStorage.getItem('banyan_anonymous_id')
     localStorage.getItem('banyan_drafts')
     ```

4. **See the Save Status Bar**
   - Should show: "Draft auto-saved locally" with yellow dot
   - Save button says: "Save Progress"

5. **Click "Save Progress"**
   - Save Modal should appear
   - Two CTAs: "Continue with Email" and "Continue with Google"

---

### **Test 2: Magic Link Sign-Up**

1. **Click "Continue with Email"**
   - Redirects to `/sign-in`
   - Enter your email
   - Check email for magic link
   - Click link

2. **After sign-in**
   - Should redirect to `/sos` (Strategic Operating System)
   - localStorage drafts should be migrated to Supabase
   - Check console for migration logs

3. **Verify migration**
   - Open Supabase dashboard
   - Go to Table Editor → `documents`
   - Your brief should be there with `user_id` populated

---

### **Test 3: Google OAuth Sign-Up**

1. **Start fresh** (new incognito window)
   - Create another brief
   - Click "Save Progress" → "Continue with Google"
   
2. **Sign in with Google**
   - Select Google account
   - Approve permissions (email/profile only)

3. **After sign-in**
   - Same migration flow as Test 2
   - Check Supabase for the document

---

### **Test 4: Signed-In User Flow**

1. **Create a new brief while signed in**
   - Go to `/new`
   - Create another brief

2. **Check Save Status Bar**
   - Should show: "Signed in as [your-email]" with green dot
   - Save button says: "Save to Cloud"

3. **Click "Save to Cloud"**
   - Should save directly to Supabase (no modal)
   - Alert: "Brief saved successfully!"

4. **Verify in Supabase**
   - Check `documents` table
   - Check `events_audit` table for `saved_brief` event

---

## 🔍 What to Look For

### **Console Logs**

Anonymous user creating a brief:
```
💾 Auto-saving draft to localStorage...
✅ Draft saved: draft_[uuid]
```

Clicking "Save Progress" (anonymous):
```
[Save Modal opens]
```

After sign-in (migration):
```
[Migration logs in server logs]
```

Signed-in user saving:
```
💾 Saving to database...
✅ Saved to database: {document}
```

### **localStorage Contents**

```javascript
// Anonymous ID
"banyan_anonymous_id": "anon_[uuid]"

// Drafts array
"banyan_drafts": [{
  "id": "draft_[uuid]",
  "type": "brief",
  "title": "Founder Brief",
  "contentJson": { ... },
  "createdAt": "2025-01-01T...",
  "updatedAt": "2025-01-01T..."
}]
```

### **Supabase Tables**

**users**
- `clerk_id`: Clerk user ID
- `email`: User email (optional)
- `auth_provider`: 'email' or 'google'
- `anonymous_id`: Previous anon ID (if migrated)

**documents**
- `user_id`: References users.id
- `type`: 'brief'
- `title`: 'Founder Brief'
- `content_json`: Full brief data
- `metadata`: { migratedFrom: 'localStorage', ... }

**events_audit**
- `event_type`: 'upgraded_account' or 'saved_brief'
- `user_id`: References users.id

---

## 🐛 Common Issues

### Issue: "Draft not auto-saving"
- Check console for errors
- Verify `saveDraft()` is called in useEffect
- Check localStorage permissions

### Issue: "Save Modal not appearing"
- Verify `showSaveModal` state is working
- Check if `isSignedIn` is correct

### Issue: "Migration not working"
- Check server logs for migration errors
- Verify Supabase RLS policies allow inserts
- Check `clerk_id` is being passed correctly

### Issue: "Can't sign in with Google"
- Verify Clerk Google OAuth is enabled
- Check redirect URLs in Clerk dashboard
- Ensure `CLERK_SECRET_KEY` is correct

---

## ✅ Success Criteria

- [ ] Anonymous user can create a brief
- [ ] Draft auto-saves to localStorage
- [ ] Save Modal appears when clicking "Save Progress"
- [ ] Magic link sign-up works
- [ ] Google OAuth sign-up works
- [ ] localStorage drafts migrate to Supabase after sign-in
- [ ] Signed-in user can save directly to cloud
- [ ] Documents appear in Supabase with correct `user_id`
- [ ] Events are logged in `events_audit` table

---

## 🚀 Next Steps (Phase 2)

Once all tests pass:
1. Google Drive integration (incremental scopes)
2. Export to Google Docs
3. Shareable read-only links
4. Account settings page (view/disconnect integrations)

Let me know how the tests go! 🎉

