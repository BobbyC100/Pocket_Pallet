# Sync 10 Test Merchants on Render

## Step 1: SSH into Render

```bash
# Get the SSH command from Render Dashboard > Settings > Shell
# It will look like:
ssh <service-name>@ssh.oregon.render.com
```

## Step 2: Run Test Sync

Once connected, run:

```bash
# Navigate to backend
cd PP_MVP/backend

# Preview 10 merchants to sync
python3 -c "
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL))
with engine.connect() as conn:
    result = conn.execute(text('''
        SELECT id, name, slug, google_place_id
        FROM merchants
        WHERE google_place_id IS NOT NULL
        ORDER BY RANDOM()
        LIMIT 10
    '''))
    merchants = result.fetchall()
    print('\n📋 10 Merchants to Sync:\n')
    for i, m in enumerate(merchants, 1):
        print(f'{i}. {m[1]} (slug: {m[2]})')
        print(f'   View at: https://pocket-pallet.vercel.app/merchants/{m[2]}')
    print('\n' + '='*60)
    print('IDs:', ','.join([str(m[0]) for m in merchants]))
"
```

## Step 3: Sync Those 10 Merchants

Copy the IDs from Step 2 output, then run:

```bash
python3 -c "
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.google_places import GooglePlacesService
from app.models.merchant import Merchant

# Replace with IDs from Step 2
MERCHANT_IDS = ['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10']

engine = create_engine(str(settings.DATABASE_URL))
google_service = GooglePlacesService(settings.GOOGLE_MAPS_API_KEY)

with Session(engine) as db:
    for i, merchant_id in enumerate(MERCHANT_IDS, 1):
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if merchant:
            print(f'[{i}/10] Syncing: {merchant.name}')
            try:
                google_service.sync_merchant(merchant)
                db.commit()
                print(f'  ✅ Success')
            except Exception as e:
                print(f'  ❌ Error: {e}')
                db.rollback()
    print('\n✅ Sync complete!')
"
```

## Alternative: Simpler One-Liner

If the above is too complex, try this simpler version:

```bash
# Just sync 10 random merchants
python3 << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.merchant import Merchant
from app.services.google_places import GooglePlacesService

engine = create_engine(str(settings.DATABASE_URL))
service = GooglePlacesService(settings.GOOGLE_MAPS_API_KEY)

with Session(engine) as db:
    merchants = db.query(Merchant).filter(
        Merchant.google_place_id.isnot(None)
    ).limit(10).all()
    
    for i, m in enumerate(merchants, 1):
        print(f'[{i}/10] {m.name}...')
        try:
            service.sync_merchant(m)
            db.commit()
            print(f'  ✅ https://pocket-pallet.vercel.app/merchants/{m.slug}')
        except Exception as e:
            print(f'  ❌ {e}')
            db.rollback()
EOF
```

## Step 4: View Results

Visit the merchants at:
`https://pocket-pallet.vercel.app/merchants/<slug>`

Look for:
- ✅ Photo mosaic (Google Photos + Street View)
- ✅ Opening hours
- ✅ Rating/reviews
- ✅ "View on Google" link
- ✅ Enhanced contact info

