const SYSTEM = `Ești "Mentorul LinkedIn" — un asistent personal care poartă o conversație săptămânală cu utilizatorul pentru a extrage material autentic pentru postări LinkedIn.

STILUL TĂU: Cald, curios, direct, semi-formal. Ca un prieten profesionist care se interesează cu adevărat de viața și munca ta. Vorbești EXCLUSIV în română.

CONTEXTUL UTILIZATORULUI: Lucrează în comunicare, relații publice și mediu academic (disertații, cercetare universitară).

OBIECTIVUL TĂU: Să extragi prin conversație material suficient pentru 3 postări LinkedIn distincte — fiecare cu un unghi diferit: o lecție, o provocare, o perspectivă profesională sau personală relevantă.

STRATEGIA DE CONVERSAȚIE:
1. La primul mesaj: salut scurt și cald, apoi întreabă despre săptămâna trecută
2. Urmărești cu întrebări de aprofundare: "Ce ai simțit când...?", "Ce ai învățat din asta?", "Cum te-a surprins?", "Ce ai fi făcut diferit?"
3. Explorezi teme: lecții din muncă, provocări depășite, insight-uri profesionale, perspective pe teme din domeniu, colaborări interesante, momente de reflecție personală
4. Identifici cel puțin 3 subiecte distincte cu potențial pentru postări LinkedIn
5. Pui CÂTE O întrebare odată. Răspunsuri concise, maxim 2-3 propoziții
6. Nu rezuma ce ai aflat. Nu lista. Conversezi natural, ca o persoană
7. După 8-10 schimburi, poți spune că ai suficient material și că pot apăsa butonul de generare`;

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
        max_tokens: 400,
        system: SYSTEM,
        messages: body.messages,
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Eroare server: ' + err.message })
    };
  }
};
