const GENERATE_PROMPT = `Bazat pe conversația de mai sus, generează 3 postări distincte pentru LinkedIn.

CERINȚE PENTRU FIECARE POSTARE:
- Hook puternic: prima propoziție captivantă, specifică — nu generică
- Ton: semi-formal, conversational, autentic. Ca o persoană reală care vorbește, nu o companie
- Lungime: 150-250 cuvinte
- Structură: hook → conținut (3-4 paragrafe scurte sau bullet-uri) → încheiere cu întrebare, lecție sau call-to-action
- Fiecare postare pe un unghi DISTINCT (ex: lecție personală, perspectivă profesională, provocare depășită, insight academic)
- Specifice și personale — bazate exact pe ce a spus utilizatorul, nu generice sau clișee
- Fără emoji sau maxim 1-2 dacă se potrivesc perfect natural
- Domeniu: comunicare, relații publice, mediu academic

Răspunde EXCLUSIV cu JSON valid, fără niciun text în afara JSON-ului:
{
  "posts": [
    {"titlu": "titlu intern scurt (nu apare în postare)", "continut": "textul complet al postării"},
    {"titlu": "titlu intern scurt", "continut": "textul complet al postării"},
    {"titlu": "titlu intern scurt", "continut": "textul complet al postării"}
  ]
}`;

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Cheia API nu este configurată.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Request invalid.' })
    };
  }

  const messages = [
    ...body.messages,
    { role: 'user', content: GENERATE_PROMPT }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: data.error?.message || 'Eroare API.' })
      };
    }

    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed = { posts: [] };
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch(e) {}
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Eroare server: ' + err.message })
    };
  }
};
