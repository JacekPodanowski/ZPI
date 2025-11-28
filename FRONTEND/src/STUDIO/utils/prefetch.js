/**
 * Prefetch utility for lazy-loaded components
 * 
 * Loads pages in background after the current page is ready,
 * prioritized by importance for smooth navigation.
 */

// Priority groups - higher priority = loaded first
export const PREFETCH_PRIORITY = {
  CRITICAL: 1,    // Most likely next pages
  HIGH: 2,        // Common navigation targets
  MEDIUM: 3,      // Secondary pages
  LOW: 4,         // Rarely visited pages
};

// Lazy import functions grouped by priority - FOR AUTHENTICATED USERS
const authenticatedImports = {
  // CRITICAL - Main navigation destinations (Sites -> Calendar -> Editor)
  [PREFETCH_PRIORITY.CRITICAL]: [
    () => import('../pages/Sites/SitesPage'),
    () => import('../pages/Creator/CreatorCalendarApp'),
    () => import('../pages/Editor/NewEditorPage'),
  ],
  
  // HIGH - Common pages
  [PREFETCH_PRIORITY.HIGH]: [
    () => import('../pages/Events/EventsPage'),
    () => import('../pages/Domain/DomainPage'),
    () => import('../pages/Team/TeamPage'),
    () => import('../pages/Settings/ProfilePage'),
    () => import('../pages/Settings/NotificationsPage'),
  ],
  
  // MEDIUM - Secondary features
  [PREFETCH_PRIORITY.MEDIUM]: [
    () => import('../pages/NewSite/CategorySelectionPage'),
    () => import('../pages/NewSite/NewProjectPage'),
    () => import('../pages/NewSite/ManageModulesPage'),
    () => import('../pages/NewSite/StyleSelectionPage'),
    () => import('../pages/Settings/AppearancePage'),
    () => import('../pages/Settings/SettingsPage'),
    () => import('../pages/Settings/OrdersPage'),
    () => import('../pages/Settings/BillingPage'),
    () => import('../pages/Settings/MailsPage'),
  ],
  
  // LOW - Rarely visited
  [PREFETCH_PRIORITY.LOW]: [
    () => import('../pages/Lab/SiteLabPage'),
    () => import('../pages/Admin/AdminDashboardPage'),
    () => import('../pages/Admin/LegalDocumentsAdminPage'),
    () => import('../pages/EmailEditor/EmailEditorPage'),
    () => import('../pages/Domain/BuyDomainPage'),
  ],
};

// Lazy import functions grouped by priority - FOR UNAUTHENTICATED USERS
const unauthenticatedImports = {
  // CRITICAL - Page creation flow first for unauthenticated users
  [PREFETCH_PRIORITY.CRITICAL]: [
    () => import('../pages/NewSite/CategorySelectionPage'),
    () => import('../pages/NewSite/NewProjectPage'),
    () => import('../pages/NewSite/StyleSelectionPage'),
  ],
  
  // HIGH - Next steps in creation flow
  [PREFETCH_PRIORITY.HIGH]: [
    () => import('../pages/NewSite/ManageModulesPage'),
    () => import('../pages/Editor/NewEditorPage'),
  ],
  
  // MEDIUM - Auth pages they might need
  [PREFETCH_PRIORITY.MEDIUM]: [
    () => import('../pages/Auth/BuildingLoginPage'),
  ],
  
  // LOW - Other pages
  [PREFETCH_PRIORITY.LOW]: [],
};

// Track what's already been prefetched
const prefetchedModules = new Set();

/**
 * Prefetch a single module if not already loaded
 */
const prefetchModule = async (importFn, name) => {
  const key = importFn.toString();
  if (prefetchedModules.has(key)) return;
  
  try {
    prefetchedModules.add(key);
    await importFn();
  } catch (error) {
    // Silent fail - prefetch is not critical
    console.debug(`Prefetch failed for module`, error);
    prefetchedModules.delete(key); // Allow retry
  }
};

/**
 * Prefetch modules with delay between each to avoid blocking
 */
const prefetchWithDelay = async (imports, delayMs = 100) => {
  for (const importFn of imports) {
    await prefetchModule(importFn);
    // Small delay to not block main thread
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
};

/**
 * Start prefetching all modules in priority order
 * Uses requestIdleCallback for non-blocking execution
 * @param {Object} options - Configuration options
 * @param {number} options.startFromPriority - Skip higher priorities
 * @param {boolean} options.isAuthenticated - Whether user is logged in
 */
export const startPrefetching = (options = {}) => {
  const { 
    startFromPriority = PREFETCH_PRIORITY.CRITICAL,
    isAuthenticated = true 
  } = options;

  // Choose import map based on auth status
  const lazyImports = isAuthenticated ? authenticatedImports : unauthenticatedImports;

  // Wait for page to be fully interactive
  const startPrefetch = async () => {
    const priorities = Object.keys(lazyImports)
      .map(Number)
      .filter(p => p >= startFromPriority)
      .sort((a, b) => a - b);
    
    for (const priority of priorities) {
      const imports = lazyImports[priority] || [];
      await prefetchWithDelay(imports, priority === PREFETCH_PRIORITY.CRITICAL ? 50 : 150);
    }
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => startPrefetch(), { timeout: 2000 });
  } else {
    setTimeout(startPrefetch, 1000);
  }
};

/**
 * Prefetch specific routes based on current location
 * Call this when user hovers over navigation links
 */
export const prefetchRoute = (routePath) => {
  const routeImports = {
    '/studio/sites': () => import('../pages/Sites/SitesPage'),
    '/studio/editor': () => import('../pages/Editor/NewEditorPage'),
    '/studio/calendar/creator': () => import('../pages/Creator/CreatorCalendarApp'),
    '/studio/events': () => import('../pages/Events/EventsPage'),
    '/studio/domain': () => import('../pages/Domain/DomainPage'),
    '/studio/new': () => import('../pages/NewSite/CategorySelectionPage'),
    '/studio/account': () => import('../pages/Settings/NotificationsPage'),
  };
  
  const importFn = routeImports[routePath];
  if (importFn) {
    prefetchModule(importFn, routePath);
  }
};

/**
 * Hook-friendly prefetch on hover
 * Usage: onMouseEnter={() => prefetchOnHover('/studio/sites')}
 */
export const prefetchOnHover = (routePath) => {
  prefetchRoute(routePath);
};
