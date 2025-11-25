# 🧹 Flexible Modules - Cleanup Phase

**⚠️ UWAGA: Ten dokument dotyczy OSTATNIEJ fazy projektu - usunięcia legacy code.**

**WYKONAĆ DOPIERO PO:**
- ✅ Nowy system działa stabilnie >2 tygodnie
- ✅ 100% stron używa flexible format
- ✅ Zero critical bugs
- ✅ Pełny backup DB

---

## 📊 Pre-Cleanup Verification

### 1. Database Check

```sql
-- Sprawdź czy WSZYSTKIE strony używają flexible
SELECT 
  site_id,
  name,
  template_config::text
FROM api_site
WHERE template_config::text LIKE '%"type":"hero"%' 
   OR template_config::text LIKE '%"type":"services"%'
   OR template_config::text LIKE '%"type":"about"%'
   OR template_config::text LIKE '%"type":"gallery"%'
   OR template_config::text LIKE '%"type":"contact"%';

-- Jeśli zwraca JAKIEKOLWIEK wyniki → STOP! Nie usuwaj jeszcze!
-- Jeśli zwraca 0 rows → OK, można przejść dalej
```

### 2. Metrics Check

```sql
-- Progress dashboard
SELECT 
  COUNT(*) as total_sites,
  SUM(CASE WHEN template_config::text LIKE '%"type":"flexible"%' THEN 1 ELSE 0 END) as flexible_count,
  ROUND(100.0 * SUM(CASE WHEN template_config::text LIKE '%"type":"flexible"%' THEN 1 ELSE 0 END) / COUNT(*), 2) as percent
FROM api_site;

-- MUSI być 100.00% flexible przed cleanup
```

### 3. Error Log Check

```bash
# Sprawdź logi za ostatnie 2 tygodnie
grep -i "flexible\|module\|render" backend/logs/*.log | grep -i "error\|exception"

# Jeśli są critical errors → FIX najpierw!
```

### 4. Backup Database

```bash
# Full backup przed cleanup
docker-compose exec -T postgres pg_dump -U youreasysiteuser youreasysite_db > backup_pre_cleanup_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_pre_cleanup_*.sql
# Plik powinien mieć rozsądny rozmiar (>1MB)
```

---

## 🗑️ Files to Delete

### Frontend - Legacy Modules

```bash
cd FRONTEND/src/SITES/components/modules

# Delete entire legacy module folders
rm -rf Hero/
rm -rf Services/
rm -rf About/
rm -rf Gallery/
rm -rf Contact/
rm -rf Text/
rm -rf Video/
rm -rf FAQ/
rm -rf Testimonials/
rm -rf Team/
rm -rf Blog/
rm -rf Events/
rm -rf Navigation/
rm -rf Button/
rm -rf Spacer/
rm -rf Container/
rm -rf Calendar_Compact/
rm -rf Caldenar_Full/
rm -rf ReactComponent/

# Delete legacy descriptors
rm -f _descriptors.js
```

### Frontend - Legacy Code in Files

```javascript
// FRONTEND/src/SITES/components/modules/FlexibleModule/converter.js
// DELETE ENTIRE FILE - nie jest już potrzebny

// FRONTEND/src/SITES/components/modules/ModuleRegistry.js
// BYŁO (delete all legacy imports):
import HeroSection from './Hero';
import ServicesSection from './Services';
// ... etc

// ZOSTAJE (only FlexibleModule):
import FlexibleModule from './FlexibleModule';

export const MODULE_REGISTRY = {
  flexible: FlexibleModule
};
```

### Backend - Legacy Converter

```python
# BACKEND/api/views.py
# DELETE function:
def prepare_for_ai(config):
    """Convert all legacy modules to flexible."""
    # DELETE całą funkcję

# DELETE function:
def convert_legacy_module(module):
    # DELETE całą funkcję

# UPDATE AI endpoint (uproszczone):
def process_ai_request(request, site_id):
    site = Site.objects.get(id=site_id)
    config = site.template_config
    
    # BYŁO:
    # converted_config = prepare_for_ai(config)  ← DELETE
    
    # JEST:
    ai_response = site_editor_agent.process_task(
        user_prompt=request.data['message'],
        site_config=config,  # Direct, no conversion
        context=request.data.get('context')
    )
    
    if ai_response['status'] == 'success':
        site.template_config = ai_response['site']
        site.save()
    
    return Response(ai_response)
```

### Frontend - ModuleRenderer Simplification

```javascript
// BYŁO:
const ModuleRenderer = ({ module, isEditing, pageId, moduleId }) => {
  // DELETE cały ten if block:
  const renderModule = module.type === 'flexible' 
    ? module 
    : convertLegacyToFlexible(module);  ← DELETE
  
  return (
    <FlexibleRenderer
      structure={renderModule.structure}  ← DELETE
      isEditing={isEditing}
      pageId={pageId}
      moduleId={moduleId}
    />
  );
};

// JEST (simplified):
const ModuleRenderer = ({ module, isEditing, pageId, moduleId }) => {
  return (
    <FlexibleRenderer
      structure={module.structure}  // Direct access
      isEditing={isEditing}
      pageId={pageId}
      moduleId={moduleId}
    />
  );
};
```

---

## 📝 Cleanup Script

```bash
#!/bin/bash
# cleanup_legacy_modules.sh

set -e  # Exit on error

echo "🧹 Starting Flexible Modules Cleanup..."
echo "⚠️  Make sure you have a backup!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo "📊 Checking database..."
# Add DB check here

echo "🗑️  Deleting legacy module folders..."
cd FRONTEND/src/SITES/components/modules

rm -rf Hero/ Services/ About/ Gallery/ Contact/ Text/ Video/ FAQ/ Testimonials/ Team/ Blog/ Events/ Navigation/ Button/ Spacer/ Container/ Calendar_Compact/ Caldenar_Full/ ReactComponent/

rm -f _descriptors.js

echo "🗑️  Deleting converter..."
rm -f FlexibleModule/converter.js

echo "✅ Frontend cleanup complete"

echo "🔧 Update imports..."
# Manual step - update ModuleRegistry.js

echo "✅ Cleanup complete!"
echo "📋 Next steps:"
echo "  1. Update ModuleRegistry.js (remove legacy imports)"
echo "  2. Update backend views.py (remove converter functions)"
echo "  3. Test rendering on dev"
echo "  4. Deploy to production"
```

---

## 📊 Post-Cleanup Metrics

### Bundle Size Reduction

```bash
# Before cleanup
npm run build
# Output: dist/assets/index-abc123.js  180 kB

# After cleanup
npm run build
# Output: dist/assets/index-xyz789.js   65 kB

# Reduction: ~64% (-115 kB)
```

### Code Statistics

```bash
# Count lines of code (after cleanup)
find FRONTEND/src/SITES/components/modules -name "*.jsx" -o -name "*.js" | xargs wc -l

# Expected: ~1500 lines (was ~5000)
```

### File Count

```bash
# Count module files
find FRONTEND/src/SITES/components/modules -type f | wc -l

# Expected: ~12 files (was ~30)
```

---

## ✅ Post-Cleanup Testing

### 1. Dev Testing

```bash
# Start dev server
npm run dev

# Test:
- [ ] All pages render correctly
- [ ] Editing works (text, images, buttons)
- [ ] AI commands work
- [ ] No console errors
- [ ] Mobile responsive
```

### 2. Production Deploy

```bash
# Build
npm run build

# Check bundle size
ls -lh dist/assets/*.js

# Deploy
# (your deployment process)
```

### 3. Smoke Tests Production

```bash
# After deploy, test on production:
- [ ] Load 5 random sites
- [ ] Edit test site via AI
- [ ] Check rendering performance
- [ ] Monitor error logs
```

---

## 📈 Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Components** | ~50 | ~15 | **-70%** |
| **LOC** | ~5000 | ~1500 | **-70%** |
| **Files** | ~30 | ~12 | **-60%** |
| **Bundle Size** | 180KB | 65KB | **-64%** |
| **Build Time** | 12s | 5s | **-58%** |
| **Maintenance** | Complex | Simple | **↓↓↓** |

---

## 🚨 Rollback Plan

### If Something Breaks:

```bash
# 1. Stop production
# 2. Restore from backup

docker-compose exec -T postgres psql -U youreasysiteuser youreasysite_db < backup_pre_cleanup_YYYYMMDD.sql

# 3. Revert git commits
git revert <cleanup-commit-hash>

# 4. Rebuild and redeploy
npm run build
# deploy

# 5. Investigate issue before trying cleanup again
```

---

## 📅 Timeline

### Day 1: Verification & Backup
- Morning: Run all pre-cleanup checks
- Afternoon: Create backups, verify backups
- End of day: Go/No-Go decision

### Day 2: Cleanup Execution
- Morning: Execute cleanup script
- Afternoon: Update code (ModuleRegistry, views.py)
- End of day: Dev testing

### Day 3: Deploy & Monitor
- Morning: Production deploy
- Afternoon: Smoke tests, monitoring
- End of day: Success verification or rollback

---

## ✅ Success Criteria

- ✅ All sites render correctly
- ✅ Zero production errors in 24h
- ✅ Bundle size reduced by >60%
- ✅ Build time reduced
- ✅ User editing works perfectly
- ✅ AI commands work perfectly

---

**🎉 Po udanym cleanup - system jest 3x prostszy i łatwiejszy w utrzymaniu!**
