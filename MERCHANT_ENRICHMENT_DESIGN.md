# Merchant Enrichment & Display - Design Document

## 📋 Executive Summary

This document outlines the complete strategy for:
1. **Syncing** Google Places data to enrich merchant profiles
2. **Displaying** enriched data in the frontend merchant pages
3. **Managing** ongoing data quality and updates

**Goal:** Transform basic merchant listings into rich, informative profiles with photos, hours, ratings, and contact details.

---

## 🎯 Current State vs Target State

### Current State ✅
- **496 merchants** imported with names, coordinates, Place IDs
- **98% have Google Place IDs** ready for enrichment
- **Coordinates verified** from Google Maps URLs
- **Basic categorization** (wine_bar, restaurant, cafe, etc.)
- **Tags** from original Google Maps lists

### Target State 🎯
- **Rich profiles** with photos, hours, ratings
- **Complete contact info** (phone, website)
- **Business status** (open/closed, operational status)
- **Visual galleries** (5+ photos per merchant)
- **Social proof** (Google ratings and review counts)
- **Real-time data** (current popularity, wait times when available)

---

## 📊 Part 1: Data Sync Strategy

### 1.1 Sync Approach

**Method:** Batch enrichment with progressive rollout

**Phases:**
1. **Test Phase:** Sync 10 merchants to validate data quality
2. **Pilot Phase:** Sync 50 merchants to test frontend display
3. **Rollout Phase:** Sync remaining 436 merchants
4. **Maintenance:** Weekly re-sync for updates

### 1.2 Sync Execution Plan

```bash
# Phase 1: Test (10 merchants)
python3 sync_merchants_with_google.py sync --limit 10

# Validate results
python3 sync_merchants_with_google.py stats

# Phase 2: Pilot (50 merchants)
python3 sync_merchants_with_google.py sync --limit 50

# Phase 3: Full rollout
python3 sync_merchants_with_google.py sync
```

### 1.3 Data Quality Validation

After each phase, validate:

**Required Metrics:**
- ✅ Success rate ≥ 90%
- ✅ Average data completeness ≥ 70%
- ✅ Photo availability ≥ 60%
- ✅ Hours availability ≥ 60%

**SQL Query for Validation:**
```sql
SELECT 
  COUNT(*) as total_synced,
  COUNT(google_meta->'formatted_address') as has_address,
  COUNT(google_meta->'opening_hours') as has_hours,
  COUNT(google_meta->'photos') as has_photos,
  COUNT(google_meta->'formatted_phone_number') as has_phone,
  COUNT(google_meta->'website') as has_website,
  AVG(jsonb_array_length(google_meta->'photos')) as avg_photos,
  AVG((google_meta->>'rating')::float) as avg_rating
FROM merchants
WHERE google_sync_status = 'success';
```

### 1.4 Error Handling

**If sync fails:**
- Merchant marked with `google_sync_status = 'failed'`
- Error logged for manual review
- Can be retried with: `python3 sync_merchants_with_google.py sync --force`

**Common failure scenarios:**
- Invalid Place ID → Manual verification needed
- Rate limit exceeded → Automatic retry with backoff
- Place permanently closed → Update merchant status

### 1.5 Cost Management

**Estimated Costs:**
- 486 merchants × $0.017 per request = **$8.26**
- Monthly updates (486 merchants) = **$8.26/month**
- Total annual cost = **~$100/year**

**Free tier:** $200/month = plenty of headroom ✅

---

## 🎨 Part 2: Frontend Display Design

### 2.1 Merchant Detail Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Merchants                          [Edit]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [        Hero Image or Photo Gallery Carousel       ]  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Merchant Name                        ⭐ 4.5 (287)      │
│  Wine Bar • $$ • Long Beach, CA    [🟢 Open Now]       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📍 Address & Map                                       │
│  ┌─────────────────────────────────────────────┐       │
│  │  123 Pine Ave                                │       │
│  │  Long Beach, CA 90802                        │       │
│  │  [Get Directions]                            │       │
│  │                                              │       │
│  │  [    Embedded Google Map or Image   ]      │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ⏰ Hours                                               │
│  ┌─────────────────────────────────────────────┐       │
│  │  Monday    Closed                            │       │
│  │  Tuesday   5:00 PM – 11:00 PM               │       │
│  │  Wednesday 5:00 PM – 11:00 PM               │       │
│  │  Thursday  5:00 PM – 12:00 AM  ← Today     │       │
│  │  Friday    5:00 PM – 12:00 AM               │       │
│  │  Saturday  4:00 PM – 12:00 AM               │       │
│  │  Sunday    4:00 PM – 10:00 PM               │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  📞 Contact                                             │
│  ┌─────────────────────────────────────────────┐       │
│  │  📱 (562) 555-1234                          │       │
│  │  🌐 buvonswinebar.com                       │       │
│  │  📸 @buvonswinebar                          │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  🏷️ Tags                                                │
│  [Natural Wine] [Small Plates] [Dog Friendly]          │
│  [Outdoor Seating]                                      │
│                                                          │
│  📸 Photo Mosaic (3×3 Grid)                             │
│  ┌─────┬─────┬─────┐                                   │
│  │ P1  │ P2  │ P3  │  (Google Places Photos)          │
│  ├─────┼─────┼─────┤                                   │
│  │ P4  │ P5  │ P6  │                                   │
│  ├─────┼─────┼─────┤                                   │
│  │ P7  │ P8  │ SV  │  (SV = Street View with badge)   │
│  └─────┴─────┴─────┘                                   │
│                                                          │
│  🔗 View full profile on Google                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

#### A. Hero Section
```tsx
<HeroSection>
  {merchant.hero_image ? (
    <img src={merchant.hero_image} alt={merchant.name} />
  ) : merchant.google_meta?.photos?.[0] ? (
    <GooglePhoto photoRef={merchant.google_meta.photos[0].photo_reference} />
  ) : (
    <PlaceholderImage />
  )}
</HeroSection>
```

**Priority:**
1. Manual `hero_image` (if curator set one)
2. First Google photo
3. Placeholder

#### B. Header Info
```tsx
<Header>
  <h1>{merchant.name}</h1>
  <div className="meta">
    <TypeBadge type={merchant.type} />
    <PriceLevel level={merchant.google_meta?.price_level} />
    <Location country={merchant.country_code} />
    <OpenStatus 
      openNow={merchant.google_meta?.opening_hours?.open_now}
      status={merchant.google_meta?.business_status}
    />
  </div>
  <Rating 
    rating={merchant.google_meta?.rating}
    count={merchant.google_meta?.user_ratings_total}
  />
</Header>
```

**Display Logic:**
- Show type as readable text ("Wine Bar" not "wine_bar")
- Price level as `$` symbols (1=$, 2=$$, 3=$$$, 4=$$$$)
- Green dot if open now, red if closed
- Stars + review count

#### C. Address & Map
```tsx
<AddressSection>
  <address>
    {merchant.google_meta?.formatted_address || merchant.address}
  </address>
  <Button onClick={() => openGoogleMaps(merchant.geo)}>
    Get Directions
  </Button>
  
  {merchant.geo && (
    <StaticMap 
      lat={merchant.geo.lat} 
      lng={merchant.geo.lng}
      zoom={15}
    />
  )}
</AddressSection>
```

**Map Options:**
- **Option 1:** Static Google Maps image
- **Option 2:** Embedded interactive map
- **Option 3:** Link to Google Maps only (simplest)

**Recommendation:** Start with Option 3 (link only), add map later

#### D. Hours Display
```tsx
<HoursSection>
  <h3>Hours</h3>
  {merchant.google_meta?.opening_hours?.weekday_text ? (
    <HoursList>
      {merchant.google_meta.opening_hours.weekday_text.map((day, idx) => (
        <HourRow 
          key={idx}
          day={day.split(':')[0]}
          hours={day.split(':')[1]}
          isToday={isToday(idx)}
        />
      ))}
    </HoursList>
  ) : merchant.hours ? (
    <CustomHours hours={merchant.hours} />
  ) : (
    <p>Hours not available</p>
  )}
</HoursSection>
```

**Priority:**
1. Google `weekday_text` (formatted, reliable)
2. Manual `hours` object
3. "Hours not available"

**Highlight:** Current day in bold or with indicator

#### E. Contact Information
```tsx
<ContactSection>
  {merchant.google_meta?.formatted_phone_number && (
    <ContactItem 
      icon="📱"
      label="Phone"
      value={merchant.google_meta.formatted_phone_number}
      href={`tel:${merchant.google_meta.international_phone_number}`}
    />
  )}
  
  {(merchant.google_meta?.website || merchant.contact?.website) && (
    <ContactItem 
      icon="🌐"
      label="Website"
      value={displayUrl(merchant.google_meta?.website || merchant.contact?.website)}
      href={merchant.google_meta?.website || merchant.contact?.website}
    />
  )}
  
  {merchant.contact?.instagram && (
    <ContactItem 
      icon="📸"
      label="Instagram"
      value={merchant.contact.instagram}
      href={`https://instagram.com/${merchant.contact.instagram.replace('@', '')}`}
    />
  )}
</ContactSection>
```

**Priority:**
- Phone: Google's formatted version first
- Website: Google first (more reliable), fallback to manual
- Instagram: Manual only (Google doesn't provide this)

#### F. Photo Mosaic with Street View Integration

**Street View Helper:**
```tsx
const streetViewUrl = (lat: number, lng: number, size = 800, fov = 85) =>
  `https://maps.googleapis.com/maps/api/streetview?size=${size}x${size}&location=${lat},${lng}&fov=${fov}&pitch=0&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

function getGooglePhotoUrl(ref: string, width: number) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photoreference=${ref}&key=${GOOGLE_API_KEY}`;
}
```

**Mosaic Assembly:**
```tsx
// Build mosaic with Google photos + Street View
const buildMosaic = () => {
  let images: string[] = [];
  
  // Add Google Places photos (6-8 photos)
  if (merchant.google_meta?.photos) {
    images = merchant.google_meta.photos
      .slice(0, 7)
      .map(photo => getGooglePhotoUrl(photo.photo_reference, 800));
  }
  
  // Append Street View as final square tile
  if (merchant.geo?.lat && merchant.geo?.lng) {
    images.push(streetViewUrl(merchant.geo.lat, merchant.geo.lng));
  }
  
  return images;
};

const images = buildMosaic();
const lastIsStreetView = merchant.geo?.lat && merchant.geo?.lng;
```

**Mosaic Component:**
```tsx
<PhotoMosaic className="grid grid-cols-3 gap-2">
  {images.map((src, i) => (
    <figure 
      key={i} 
      className="relative aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition"
      onClick={() => openLightbox(i)}
    >
      <img
        src={src}
        alt={lastIsStreetView && i === images.length - 1 
          ? `Street view of ${merchant.name}` 
          : `${merchant.name} photo ${i + 1}`}
        loading="lazy"
        className="object-cover w-full h-full"
        onError={(e) => {
          // Gracefully remove failed Street View
          if (lastIsStreetView && i === images.length - 1) {
            e.currentTarget.parentElement?.remove();
          }
        }}
      />
      
      {/* Street View badge */}
      {lastIsStreetView && i === images.length - 1 && (
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Street View
        </span>
      )}
    </figure>
  ))}
</PhotoMosaic>

{/* View on Google Profile Link */}
<a
  href={merchant.google_meta?.url || merchant.source_url}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-3"
>
  <svg width="16" height="16" fill="currentColor" className="opacity-70" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
  View full profile on Google
</a>
```

**Features:**
- **Square crop (1:1)**: All images including Street View are 800x800
- **Field of view**: 85° for natural framing
- **Street View badge**: Clear visual indicator on last tile
- **Error handling**: Failed Street View removes gracefully
- **Google profile link**: Direct link below mosaic
- **Lazy loading**: All images load lazily for performance
- **Lightbox**: Click any image to open full view
- **Consistent grid**: 3-column mosaic on desktop, responsive on mobile

**Street View Parameters:**
- `size=800x800`: Square aspect ratio
- `fov=85`: Slightly narrower than default (90°)
- `pitch=0`: Horizon centered
- Falls back gracefully if not available

#### G. Tags & Categories
```tsx
<TagsSection>
  {merchant.tags?.map(tag => (
    <Tag key={tag} variant="default">
      {tag}
    </Tag>
  ))}
  
  {merchant.google_meta?.types?.slice(0, 3).map(type => (
    <Tag key={type} variant="google">
      {formatGoogleType(type)}
    </Tag>
  ))}
</TagsSection>
```

**Display:**
- Manual tags in primary color
- Google types in secondary color
- Limit to top tags to avoid clutter

### 2.3 Merchant List Page Updates

**Add to each card:**
```tsx
<MerchantCard>
  <CardImage>
    {merchant.google_meta?.photos?.[0] ? (
      <GooglePhoto photoRef={merchant.google_meta.photos[0]} width={300} />
    ) : (
      <PlaceholderImage />
    )}
  </CardImage>
  
  <CardContent>
    <h3>{merchant.name}</h3>
    <Meta>
      <TypeBadge type={merchant.type} />
      {merchant.google_meta?.rating && (
        <Rating compact>
          ⭐ {merchant.google_meta.rating}
        </Rating>
      )}
      {merchant.google_meta?.opening_hours?.open_now !== undefined && (
        <OpenBadge open={merchant.google_meta.opening_hours.open_now} />
      )}
    </Meta>
    <Address>{truncate(merchant.google_meta?.formatted_address || merchant.address, 60)}</Address>
  </CardContent>
</MerchantCard>
```

**Enhancements:**
- Show first photo as card thumbnail
- Display rating if available
- Show open/closed status
- Truncated address for cleaner layout

### 2.4 Responsive Design

**Mobile (< 768px):**
- Stack all sections vertically
- Full-width components
- Simplified map (link only)
- Horizontal scroll for photo gallery

**Tablet (768px - 1024px):**
- Two-column layout for contact/hours
- Grid gallery (3 columns)
- Slightly larger map

**Desktop (> 1024px):**
- Side-by-side layout for map + info
- Grid gallery (3 columns)
- Larger photos and map

---

## 🔄 Part 3: Data Update Strategy

### 3.1 Initial Sync

**When:** Immediately after design approval

**Process:**
1. Test sync (10 merchants)
2. Deploy frontend changes
3. Validate display works
4. Run pilot sync (50 merchants)
5. User testing & feedback
6. Full rollout (remaining merchants)

### 3.2 Ongoing Maintenance

**Weekly Sync:**
```bash
# Cron job (every Sunday at 2am)
0 2 * * 0 cd /path/to/backend && python3 sync_merchants_with_google.py sync
```

**Updates:**
- Hours changes
- New photos
- Rating updates
- Business status changes

### 3.3 Manual Override

**Curator Controls:**
- Can manually edit any field
- Manual edits marked as "curated"
- Google sync won't overwrite curated fields
- "Revert to Google data" button available

**Priority Order:**
1. Manually curated data (highest priority)
2. Google Places data
3. Import data (lowest priority)

---

## 🎨 Part 4: UI/UX Considerations

### 4.1 Loading States

**Merchant Detail Page:**
```tsx
if (loading) {
  return <MerchantDetailSkeleton />;
}

if (error) {
  return <ErrorState message={error} />;
}

if (!merchant) {
  return <NotFound />;
}
```

**Skeleton Components:**
- Animated placeholders while loading
- Maintain layout to prevent shift
- Show structure without content

### 4.2 Empty States

**No Photos:**
```tsx
<div className="no-photos">
  <Icon name="camera" />
  <p>Photos coming soon</p>
</div>
```

**No Hours:**
```tsx
<div className="no-hours">
  <p>Hours not available</p>
  <a href={merchant.google_meta?.url}>View on Google Maps</a>
</div>
```

### 4.3 Error Handling

**Failed Sync:**
- Don't show broken data
- Fallback to basic info
- Show "Limited information available"

**Closed Business:**
```tsx
{merchant.google_meta?.permanently_closed && (
  <Alert variant="warning">
    ⚠️ This business may be permanently closed
  </Alert>
)}
```

### 4.4 Performance

**Optimizations:**
- Lazy load images
- Cache Google photo URLs
- Minimize API calls
- Progressive loading (show basic info first, enrich later)

**Image Sizes:**
- Thumbnail: 300px
- Card image: 400px
- Detail hero: 800px
- Lightbox: 1200px

---

## 📱 Part 5: Mobile-First Considerations

### 5.1 Touch Interactions

- Large tap targets (min 44x44px)
- Swipeable photo gallery
- Pull-to-refresh on list view
- Bottom sheet for filters

### 5.2 Performance

- Optimize images for mobile
- Lazy load below fold
- Minimize data transfer
- Cache aggressively

### 5.3 Layout

- Single column on mobile
- Sticky header on scroll
- Collapsible sections for long content
- Bottom navigation for key actions

---

## ✅ Part 6: Success Criteria

### 6.1 Data Quality

- [ ] ≥90% sync success rate
- [ ] ≥70% data completeness
- [ ] ≥60% have photos
- [ ] ≥60% have hours
- [ ] ≥50% have contact info

### 6.2 User Experience

- [ ] Page load < 3 seconds
- [ ] Mobile responsive
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Cross-browser compatible
- [ ] Touch-friendly interactions

### 6.3 Technical

- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Fallbacks working
- [ ] Images optimized

---

## 📅 Part 7: Implementation Timeline

### Week 1: Data Sync
- [ ] Day 1: Run test sync (10 merchants)
- [ ] Day 2: Validate data quality
- [ ] Day 3: Run pilot sync (50 merchants)
- [ ] Day 4-5: Buffer for issues

### Week 2: Frontend Implementation
- [ ] Day 1-2: Update merchant detail page
- [ ] Day 3: Update merchant list cards
- [ ] Day 4: Responsive design & testing
- [ ] Day 5: Polish & bug fixes

### Week 3: Rollout
- [ ] Day 1: Deploy frontend to production
- [ ] Day 2: Run full sync (all merchants)
- [ ] Day 3-4: Monitor & fix issues
- [ ] Day 5: Documentation & handoff

---

## 🚨 Risk Mitigation

### Risk 1: API Rate Limits
**Mitigation:** Built-in 0.5s delay between requests, automatic retry logic

### Risk 2: Poor Data Quality
**Mitigation:** Validate in phases, manual review before full rollout

### Risk 3: Display Bugs
**Mitigation:** Comprehensive empty state handling, fallbacks for all fields

### Risk 4: Cost Overruns
**Mitigation:** Monthly cost is $8, well within $200 free tier

### Risk 5: Closed Businesses
**Mitigation:** Display warning, allow manual override, periodic re-sync

---

## 📊 Appendix: Data Field Mapping

| Frontend Display      | Data Source (Priority Order)                              |
| :-------------------- | :-------------------------------------------------------- |
| Hero Image            | 1. `hero_image` 2. `google_meta.photos[0]` 3. Placeholder |
| Address               | 1. `google_meta.formatted_address` 2. `address`          |
| Phone                 | 1. `google_meta.formatted_phone_number` 2. `contact.phone` |
| Website               | 1. `google_meta.website` 2. `contact.website`            |
| Hours                 | 1. `google_meta.opening_hours` 2. `hours`                |
| Photos                | 1. `google_meta.photos` 2. `gallery_images`              |
| Rating                | `google_meta.rating` (Google only)                       |
| Reviews Count         | `google_meta.user_ratings_total` (Google only)           |
| Open Now              | `google_meta.opening_hours.open_now` (Google only)       |
| Business Status       | `google_meta.business_status` (Google only)              |
| Price Level           | `google_meta.price_level` (Google only)                  |
| Tags                  | `tags` (manual only)                                     |
| Instagram             | `contact.instagram` (manual only)                        |

---

## ✅ Approval Checklist

Before proceeding, please confirm:

- [ ] **Sync strategy** is acceptable (phased rollout)
- [ ] **Frontend design** matches expectations (layout, components)
- [ ] **Data display priority** makes sense (Google first, manual override)
- [ ] **Cost** is acceptable (~$8/month)
- [ ] **Timeline** is reasonable (2-3 weeks)
- [ ] **Risk mitigation** addresses concerns

---

## 📝 Next Steps After Approval

1. **Run test sync** (10 merchants)
2. **Implement frontend** updates
3. **Deploy & test** on staging
4. **Run pilot sync** (50 merchants)
5. **User testing** with pilot data
6. **Full rollout** (remaining merchants)
7. **Monitor & iterate**

---

**Questions or Changes?**  
Please provide feedback on any sections before we proceed with implementation.

