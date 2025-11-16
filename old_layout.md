# Pages Using OLD Layout Pattern

This document tracks pages that need to be updated to use the new **REAL_DefaultLayout** component.

## New Layout Standard

The new layout (`REAL_DefaultLayout.jsx`) provides:
- **Gradient title** with animation (red to black gradient)
- **Subtitle/description** below title in secondary text color
- **Optional action button** (top right)
- **No footer** - just clean content space
- **Full viewport height** with responsive padding
- **Framer Motion animations** for smooth transitions

**Reference Implementation:** `SitesPage.jsx` and `TeamPage.jsx`

---

## Pages Requiring Update

### HIGH PRIORITY


#### 2. AdminDashboardPage (`pages/Admin/AdminDashboardPage.jsx`)
**Current Issues:**
- Uses `Container maxWidth="xl"`
- NO page title/header - goes straight into tabs
- Missing descriptive subtitle
- No animations

**What to Update:**
- Add gradient title header using REAL_DefaultLayout
- Add page description
- Wrap existing tab content as children

---

#### 3. TermsAdminPage (`pages/Admin/TermsAdminPage.jsx`)
**Current Issues:**
- Custom Card/List layout
- No clear page title with gradient
- Uses custom styling throughout
- Missing page description

**What to Update:**
- Add standardized header with gradient title
- Add page description
- Wrap existing content in REAL_DefaultLayout


