const RESEND_API_KEY = process.env.RESEND_API_KEY;

const MONTHS = ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];

const METERS = [
  { id: 'jysk',      name: 'Jysk butikk' },
  { id: 'jysk_vent', name: 'Jysk/Jula ventilasjon' },
  { id: 'jula',      name: 'Jula butikk' },
  { id: 'lager',     name: 'Lager felles' },
  { id: 'evo_lok',   name: 'EVO lokale' },
  { id: 'evo_vent',  name: 'EVO ventilasjon' },
];

function buildHtml(month, year, readings) {
  const monthName = MONTHS[month];

  const rows = METERS.map(m => {
    const r = readings[m.id] || {};
    const reading     = r.reading     != null ? Math.round(r.reading).toLocaleString('nb-NO')     : '—';
    const consumption = r.consumption != null ? Math.round(r.consumption).toLocaleString('nb-NO') : '—';
    const consNum     = r.consumption != null ? r.consumption : null;
    const color       = consNum === null ? '#374151' : consNum > 0 ? '#374151' : '#6b7280';
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ede6;font-size:14px;color:#1a1a18;font-weight:500">${m.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ede6;font-size:14px;color:#374151;text-align:right;font-variant-numeric:tabular-nums">${reading}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0ede6;font-size:14px;color:${color};text-align:right;font-weight:600;font-variant-numeric:tabular-nums">${consumption}${consNum != null ? ' kWh' : ''}</td>
      </tr>`;
  }).join('');

  const totalConsumption = METERS.reduce((sum, m) => {
    const r = readings[m.id] || {};
    return sum + (r.consumption != null ? r.consumption : 0);
  }, 0);

  return `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Måleravlesning ${monthName} ${year}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:40px 20px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

      <!-- HEADER -->
      <tr>
        <td style="background:#1a3a6b;border-radius:12px 12px 0 0;padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px">Bjerch &amp; Krefting</div>
                <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em">Måleravlesning</div>
                <div style="font-size:15px;color:rgba(255,255,255,0.7);margin-top:4px">${monthName} ${year}</div>
              </td>
              <td align="right" valign="top">
                <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:10px 16px;display:inline-block">
                  <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Totalt forbruk</div>
                  <div style="font-size:20px;font-weight:700;color:#e8a020;letter-spacing:-0.01em">${Math.round(totalConsumption).toLocaleString('nb-NO')} <span style="font-size:12px;font-weight:400;color:rgba(255,255,255,0.5)">kWh</span></div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- TABLE -->
      <tr>
        <td style="background:#ffffff;border-left:1px solid #e8e4dc;border-right:1px solid #e8e4dc">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr style="background:#f7f5f0">
              <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#6b6b67;letter-spacing:.07em;text-transform:uppercase;text-align:left;border-bottom:1px solid #e8e4dc">Måler</th>
              <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#6b6b67;letter-spacing:.07em;text-transform:uppercase;text-align:right;border-bottom:1px solid #e8e4dc">Målerstand</th>
              <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#6b6b67;letter-spacing:.07em;text-transform:uppercase;text-align:right;border-bottom:1px solid #e8e4dc">Forbruk</th>
            </tr>
            ${rows}
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#1a3a6b;border-radius:0 0 12px 12px;padding:16px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;color:rgba(255,255,255,0.45)">Generert automatisk · Torggården Horten</td>
              <td align="right" style="font-size:12px;color:rgba(255,255,255,0.45)">${new Date().toLocaleDateString('nb-NO', {day:'numeric',month:'long',year:'numeric'})}</td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { month, year, readings } = body;
  if (month == null || !year || !readings) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing month, year or readings' }) };
  }

  const monthName = MONTHS[month];
  const html = buildHtml(month, year, readings);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Måleravlesning <nicolai@bjerch.no>',
        to: ['nicolai@bjerch.no', 'Lise-Mari.Jahateh@aider.no'],
        subject: `Måleravlesning ${monthName} ${year} – Torggården Horten`,
        html
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Resend error', details: data }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: data.id })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
