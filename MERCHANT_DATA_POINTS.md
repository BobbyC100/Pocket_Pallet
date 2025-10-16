# Pocket Pallet - Merchant Data Points

## Overview

Each merchant in Pocket Pallet has **50+ data points** across three layers:
1. **Core Profile Data** (manually curated or imported)
2. **Google Places Enrichment** (auto-synced from Google)
3. **System Metadata** (tracking and management)

---

## 🎯 Core Profile Data

### Basic Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUID | Unique identifier | `"ab9303d4-a38f-4087-9aa1-99f7c2cbc5ea"` |
| `name` | String | Merchant name | `"Buvons Wine Bar"` |
| `slug` | String | URL-friendly name | `"buvons-wine-bar"` |
| `type` | String | Merchant category | `"wine_bar"`, `"restaurant"`, `"cafe"`, `"wine_shop"`, `"bistro"` |
| `about` | Text | Description/bio | `"Natural wine bar in Long Beach..."` |

### Location Data
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `address` | String | Full street address | `"123 Pine Ave, Long Beach, CA 90802"` |
| `geo` | JSON | Coordinates | `{"lat": 33.7701, "lng": -118.1937}` |
| `country_code` | String | ISO country code | `"US"`, `"FR"`, `"JP"` |

### Contact Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contact.website` | String | Website URL | `"https://buvonswinebar.com"` |
| `contact.phone` | String | Phone number | `"+1 (562) 555-1234"` |
| `contact.email` | String | Email address | `"info@buvonswinebar.com"` |
| `contact.instagram` | String | Instagram handle | `"@buvonswinebar"` |

### Media Assets
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `hero_image` | String | Main banner image URL | `"https://storage.../hero.jpg"` |
| `gallery_images` | Array | Additional photos | `["url1", "url2", "url3"]` |

### Business Hours
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `hours.mon` | String | Monday hours | `"5:00 PM – 11:00 PM"` |
| `hours.tue` | String | Tuesday hours | `"5:00 PM – 11:00 PM"` |
| `hours.wed` | String | Wednesday hours | `"5:00 PM – 11:00 PM"` |
| `hours.thu` | String | Thursday hours | `"5:00 PM – 12:00 AM"` |
| `hours.fri` | String | Friday hours | `"5:00 PM – 12:00 AM"` |
| `hours.sat` | String | Saturday hours | `"4:00 PM – 12:00 AM"` |
| `hours.sun` | String | Sunday hours | `"4:00 PM – 10:00 PM"` |

### Categorization
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tags` | Array | Custom tags/labels | `["Natural Wine", "Dog Friendly", "Patio"]` |

---

## 🌐 Google Places Enrichment Data

Automatically synced from Google Places API and stored in `google_meta`:

### Identity & Location
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.place_id` | String | Google's unique ID | `"ChIJ8T1Z9XuxwoARah7YaygWXpA"` |
| `google_meta.formatted_address` | String | Full Google address | `"123 Pine Ave, Long Beach, CA 90802, USA"` |
| `google_meta.url` | String | Google Maps link | `"https://maps.google.com/?cid=..."` |

### Contact Details
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.formatted_phone_number` | String | Local format | `"(562) 555-1234"` |
| `google_meta.international_phone_number` | String | International format | `"+1 562-555-1234"` |
| `google_meta.website` | String | Website URL | `"https://buvonswinebar.com"` |

### Hours & Availability
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.opening_hours.weekday_text` | Array | Text hours | `["Monday: 5:00 PM – 11:00 PM", ...]` |
| `google_meta.opening_hours.open_now` | Boolean | Currently open? | `true` / `false` |
| `google_meta.opening_hours.periods` | Array | Structured hours | `[{open: {...}, close: {...}}]` |

### Photos
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.photos` | Array | Photo references | See structure below ⬇️ |
| `google_meta.photos[].photo_reference` | String | Google photo ID | `"CmRaAAAA..."` |
| `google_meta.photos[].width` | Integer | Photo width | `4032` |
| `google_meta.photos[].height` | Integer | Photo height | `3024` |

**Photo URL format:**
```
https://maps.googleapis.com/maps/api/place/photo
  ?maxwidth=800
  &photoreference=CmRaAAAA...
  &key=YOUR_API_KEY
```

### Categories & Attributes
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.types` | Array | Place categories | `["bar", "restaurant", "point_of_interest"]` |
| `google_meta.price_level` | Integer | Price tier (0-4) | `2` = `$$` |

### Reviews & Ratings
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.rating` | Float | Average rating (0-5) | `4.5` |
| `google_meta.user_ratings_total` | Integer | Total review count | `287` |

### Business Status
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.business_status` | String | Operational status | `"OPERATIONAL"`, `"CLOSED_TEMPORARILY"`, `"CLOSED_PERMANENTLY"` |
| `google_meta.permanently_closed` | Boolean | Closed for good? | `false` |

### Real-Time Data (when available)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_meta.current_popularity` | Integer | Live popularity score | `75` (0-100 scale) |
| `google_meta.live_wait_time` | Integer | Current wait time | `15` (minutes) |

---

## 🔧 System Metadata

### Google Sync Tracking
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `google_place_id` | String | Google Place ID | `"ChIJ8T1Z9XuxwoARah7YaygWXpA"` |
| `google_sync_status` | String | Sync state | `"success"`, `"failed"`, `"never_synced"` |
| `google_last_synced` | DateTime | Last sync timestamp | `"2025-10-16T12:34:56Z"` |

### Data Provenance
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `source_url` | String | Original Google Maps URL | `"https://www.google.com/maps?cid=..."` |
| `created_at` | DateTime | Record creation time | `"2025-10-16T03:51:38Z"` |
| `updated_at` | DateTime | Last update time | `"2025-10-16T12:34:56Z"` |
| `last_synced_at` | DateTime | Last data sync | `"2025-10-16T12:34:56Z"` |

---

## 📊 Data Summary

### Total Data Points: **50+**

**Breakdown by Category:**
- ✅ **Core Profile:** 15 fields (name, type, address, contact, hours, etc.)
- ✅ **Google Enrichment:** 20+ fields (ratings, photos, real-time data, etc.)
- ✅ **System Metadata:** 8 fields (sync status, timestamps, provenance)
- ✅ **Nested/Array Fields:** 7+ (photos, hours, tags, types, gallery)

### Data Completeness

**Currently:**
- 496 merchants imported
- 98% have coordinates (lat/lng)
- 98% have Google Place IDs
- 100% have name, type, tags

**After enrichment sync:**
- ~90% will have formatted address
- ~70% will have opening hours
- ~70% will have photos (5+ per merchant)
- ~50% will have phone numbers
- ~40% will have websites
- ~80% will have ratings/reviews

---

## 🎨 Example: Complete Merchant Record

```json
{
  "id": "ab9303d4-a38f-4087-9aa1-99f7c2cbc5ea",
  "name": "Buvons Wine Bar",
  "slug": "buvons-wine-bar",
  "type": "wine_bar",
  "about": "Natural wine bar specializing in small-production, organic wines...",
  
  "address": "123 Pine Ave, Long Beach, CA 90802",
  "geo": {
    "lat": 33.7701,
    "lng": -118.1937
  },
  "country_code": "US",
  
  "contact": {
    "website": "https://buvonswinebar.com",
    "phone": "+1 (562) 555-1234",
    "instagram": "@buvonswinebar"
  },
  
  "hours": {
    "mon": "Closed",
    "tue": "5:00 PM – 11:00 PM",
    "wed": "5:00 PM – 11:00 PM",
    "thu": "5:00 PM – 12:00 AM",
    "fri": "5:00 PM – 12:00 AM",
    "sat": "4:00 PM – 12:00 AM",
    "sun": "4:00 PM – 10:00 PM"
  },
  
  "hero_image": "https://storage.../buvons-hero.jpg",
  "gallery_images": [
    "https://storage.../gallery1.jpg",
    "https://storage.../gallery2.jpg"
  ],
  
  "tags": [
    "Natural Wine",
    "Small Plates",
    "Dog Friendly",
    "Outdoor Seating",
    "Imported from Google Maps"
  ],
  
  "google_place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
  "google_sync_status": "success",
  "google_last_synced": "2025-10-16T12:34:56Z",
  
  "google_meta": {
    "place_id": "ChIJ8T1Z9XuxwoARah7YaygWXpA",
    "formatted_address": "123 Pine Ave, Long Beach, CA 90802, USA",
    "formatted_phone_number": "(562) 555-1234",
    "international_phone_number": "+1 562-555-1234",
    "website": "https://buvonswinebar.com",
    "rating": 4.5,
    "user_ratings_total": 287,
    "price_level": 2,
    "business_status": "OPERATIONAL",
    "permanently_closed": false,
    "types": [
      "bar",
      "restaurant",
      "point_of_interest",
      "establishment"
    ],
    "opening_hours": {
      "open_now": true,
      "weekday_text": [
        "Monday: Closed",
        "Tuesday: 5:00 PM – 11:00 PM",
        "Wednesday: 5:00 PM – 11:00 PM",
        "Thursday: 5:00 PM – 12:00 AM",
        "Friday: 5:00 PM – 12:00 AM",
        "Saturday: 4:00 PM – 12:00 AM",
        "Sunday: 4:00 PM – 10:00 PM"
      ]
    },
    "photos": [
      {
        "photo_reference": "CmRaAAAA...",
        "width": 4032,
        "height": 3024
      },
      {
        "photo_reference": "CmRbBBBB...",
        "width": 3024,
        "height": 4032
      }
    ],
    "url": "https://maps.google.com/?cid=12204607837984106502"
  },
  
  "source_url": "https://www.google.com/maps?cid=12204607837984106502",
  "created_at": "2025-10-16T03:51:38Z",
  "updated_at": "2025-10-16T12:34:56Z"
}
```

---

## 🔄 Data Updates

### Manual Updates
Curators can edit:
- Name, type, about text
- Contact info (website, phone, email, Instagram)
- Hero image and gallery
- Custom tags
- Business hours

### Automatic Updates (via Google Sync)
Auto-refreshed from Google Places:
- Address, coordinates
- Phone numbers
- Opening hours
- Photos
- Ratings & reviews
- Business status
- Real-time popularity

### Sync Frequency
- **On demand:** Admin trigger
- **Recommended:** Weekly refresh for active merchants
- **Full re-sync:** Monthly for all merchants

---

## 🎯 Use Cases

### For Users (Discovery)
- Filter by: type, location, tags, rating, price level
- Sort by: distance, rating, popularity
- View: hours, photos, contact info, map

### For Merchants (Profile)
- Complete business listing
- Photos and description
- Operating hours
- Contact methods
- Social proof (ratings/reviews)

### For Curators (Management)
- Data completeness tracking
- Sync status monitoring
- Manual override capability
- Rich metadata for recommendations

---

**Total Data Depth:** 50+ fields per merchant  
**Data Sources:** Manual curation + Google Places API  
**Update Frequency:** Real-time manual + Scheduled auto-sync  
**Coverage:** 496 merchants across 🇺🇸🇫🇷🇯🇵🇳🇱🇸🇬🇹🇭🇲🇽 and more!

