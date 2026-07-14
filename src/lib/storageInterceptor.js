/**
 * Multi-Tenant LocalStorage Interceptor
 * 
 * Hijacks the native window.localStorage API to automatically prefix keys
 * with the active tenant ID (Admin Email). This guarantees complete data isolation
 * across different schools using the same application instance without needing
 * to rewrite the entire application's data persistence layer.
 */

const originalSetItem = window.localStorage.setItem;
const originalGetItem = window.localStorage.getItem;
const originalRemoveItem = window.localStorage.removeItem;

// Global keys that should NOT be prefixed by the tenant ID
const GLOBAL_KEYS = [
  'gdl_active_tenant', 
  'gdl_admin_setup_complete', 
  'gdl_current_role', 
  'gdl_sa_history',
  'gdl_local_admin_user',
  'gdl_local_admin_pass_mock'
];

const isGlobal = (key) => {
  if (!key) return false;
  // Always allow the crypto token engine to globally store licenses
  if (key.startsWith('gdl_lic_')) return true;
  // Other global flags
  return GLOBAL_KEYS.includes(key);
};

const getActualKey = (key) => {
  const tenant = originalGetItem.call(window.localStorage, 'gdl_active_tenant');
  if (tenant && !isGlobal(key)) {
    return `${tenant}_${key}`;
  }
  return key;
};

// Override setItem
window.localStorage.setItem = function(key, value) {
  originalSetItem.call(window.localStorage, getActualKey(key), value);
};

// Override getItem
window.localStorage.getItem = function(key) {
  return originalGetItem.call(window.localStorage, getActualKey(key));
};

// Override removeItem
window.localStorage.removeItem = function(key) {
  originalRemoveItem.call(window.localStorage, getActualKey(key));
};

console.log('[GDL Storage Engine] Multi-Tenant Data Isolation Active.');

// Global Fetch Interceptor for SQLite Multi-Tenancy
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('/api/')) {
    config = config || {};
    const tenantId = originalGetItem.call(window.localStorage, 'gdl_active_tenant');
    
    // Convert headers to plain object if it's a Headers instance
    let headersObj = {};
    if (config.headers instanceof Headers) {
      for (let [k, v] of config.headers.entries()) {
        headersObj[k] = v;
      }
    } else if (config.headers) {
      headersObj = { ...config.headers };
    }
    
    if (tenantId) {
      headersObj['x-tenant-id'] = tenantId;
    }
    
    config.headers = headersObj;
    console.log('[GDL Fetch] Intercepted:', resource, 'Tenant:', tenantId);
  }
  return originalFetch.call(this, resource, config);
};
console.log('[GDL Network Engine] Multi-Tenant Request Interception Active.');
