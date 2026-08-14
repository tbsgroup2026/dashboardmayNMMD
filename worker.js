export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API proxy for Google Sheet with zero-cache headers to eliminate timestamp rollback
    if (url.pathname === '/api/sheet') {
      const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true&widget=false&headers=false&chrome=false";
      
      try {
        const googleRes = await fetch(sheetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cache-Control': 'no-cache, no-store'
          }
        });
        
        let htmlText = await googleRes.text();
        
        return new Response(htmlText, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (err) {
        return new Response('Error fetching Google Sheet: ' + err.message, { status: 500 });
      }
    }
    
    // Serve index.html by default
    if (url.pathname === '/' || url.pathname === '') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    
    return env.ASSETS.fetch(request);
  }
};
