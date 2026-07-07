export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages obrigatório' });
  }

  const token = process.env.SYMPHONY_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'SYMPHONY_TOKEN não configurado no servidor' });
  }

  try {
    const r = await fetch('https://symphony.fcamara.com/api/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization':   'Bearer ' + token,
        'Content-Type':    'application/json',
        'x-enterprise-id': 'fcamara-0000-0000-0000-000000000001',
      },
      body: JSON.stringify({
        model:       'conhecimento-devoluo-gruposc',
        stream:      false,
        temperature: 0.1,
        max_tokens:  2000,
        files:       [],
        messages,
      })
    });

    const data = await r.json();
    return res.status(r.status).json(data);

  } catch (err) {
    return res.status(502).json({ error: 'Erro ao contactar Symphony: ' + err.message });
  }
}