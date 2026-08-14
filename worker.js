export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve index.html by default
    if (url.pathname === '/' || url.pathname === '') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    
    return env.ASSETS.fetch(request);
  }
};
