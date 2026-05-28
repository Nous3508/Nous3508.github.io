export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const market = url.searchParams.get('mkt') || 'zh-CN';
    const count = Math.min(Math.max(Number(url.searchParams.get('count') || 5), 1), 10);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.BING_SEARCH_KEY) {
      return new Response(JSON.stringify({ error: 'Missing BING_SEARCH_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const endpoint = new URL('https://api.bing.microsoft.com/v7.0/search');
    endpoint.searchParams.set('q', query);
    endpoint.searchParams.set('mkt', market);
    endpoint.searchParams.set('count', String(count));
    endpoint.searchParams.set('responseFilter', 'Webpages');
    endpoint.searchParams.set('safeSearch', 'Moderate');

    const res = await fetch(endpoint.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': env.BING_SEARCH_KEY
      }
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error || data }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const items = (data.webPages && data.webPages.value) ? data.webPages.value : [];
    const results = items.map(item => ({
      name: item.name,
      url: item.url,
      snippet: item.snippet
    }));

    return new Response(JSON.stringify({ results }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
