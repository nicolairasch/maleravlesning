exports.handler = async (event) => {
  const SUPABASE_URL = 'https://vaivnbwpatdxvgirhrht.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SUPABASE_KEY not configured' }) };
  }

  const { method, path, body } = JSON.parse(event.body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: method || 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation,resolution=merge-duplicates' : 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
};
