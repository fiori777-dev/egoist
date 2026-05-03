// api/chat.js  —  Vercel Serverless Function
// Egoistタイプ診断 + 未来Wikipedia 共通バックエンド

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', response.status, err);
      return res.status(502).json({ error: 'Claude API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}