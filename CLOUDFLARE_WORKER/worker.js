/**
 * Cloudflare Worker - Domain Proxy for YourEasySite
 * 
 * This worker handles all custom domains purchased by users.
 * It provides automatic SSL, CDN, and redirects to user sites.
 * 
 * Architecture:
 * - User domain (e.g., dronecomponentsfpv.online) → OVH DNS A record → Cloudflare Worker IP
 * - Worker checks domain in backend API
 * - Worker redirects to target (e.g., youtube.com for tests, or user site subdomain)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    console.log(`[Worker] Request from: ${hostname}`);
    
    // Skip if accessing worker directly (not via custom domain)
    if (hostname.includes('workers.dev')) {
      return new Response('YourEasySite Domain Proxy - OK', { status: 200 });
    }
    
    try {
      // Query backend API for domain configuration
      const apiUrl = `${BACKEND_API}${hostname}`;
      console.log(`[Worker] Querying API: ${apiUrl}`);
      
      const apiResponse = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
        // TEMPORARY: Disable cache for testing
        // TODO: Re-enable with cache purging when target/proxy_mode changes
        // cf: {
        //   cacheTtl: 300,
        //   cacheEverything: true,
        // }
      });
      
      if (!apiResponse.ok) {
        console.error(`[Worker] API error: ${apiResponse.status}`);
        return new Response('Domain not configured', { status: 404 });
      }
      
      const config = await apiResponse.json();
      console.log(`[Worker] Config for ${hostname}:`, config);
      
      // Get target and proxy mode from config
      const target = config.target;
      const proxyMode = config.proxy_mode || false;
      
      if (!target) {
        return new Response('Domain target not configured', { status: 500 });
      }
      
      // Build target URL
      const targetUrl = new URL(url.pathname + url.search, `https://${target}`);
      
      if (proxyMode) {
        // PROXY MODE: Fetch content and serve under original domain
        console.log(`[Worker] Proxying ${hostname} → ${targetUrl.toString()}`);
        
        try {
          const targetResponse = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: 'manual'
          });
          
          // Create new headers, rewriting any absolute URLs to preserve original domain
          const newHeaders = new Headers(targetResponse.headers);
          
          // Remove headers that would break the proxy
          newHeaders.delete('content-security-policy');
          newHeaders.delete('x-frame-options');
          newHeaders.delete('strict-transport-security');
          
          // Add CORS if needed
          newHeaders.set('access-control-allow-origin', '*');
          
          return new Response(targetResponse.body, {
            status: targetResponse.status,
            statusText: targetResponse.statusText,
            headers: newHeaders
          });
          
        } catch (proxyError) {
          console.error(`[Worker] Proxy error:`, proxyError);
          return new Response('Proxy error: Unable to fetch target', { status: 502 });
        }
        
      } else {
        // REDIRECT MODE: 301 redirect (changes URL in browser)
        console.log(`[Worker] Redirecting ${hostname} → ${targetUrl.toString()}`);
        return Response.redirect(targetUrl.toString(), 301);
      }
      
    } catch (error) {
      console.error(`[Worker] Error:`, error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
