// Vercel serverless function. Receives the hero lead form.
// Set LEAD_WEBHOOK_URL in Vercel (Settings, Environment Variables) to forward each lead to
// Google Sheets (Apps Script web app), Zapier, Make, Slack, etc.
// Without it, leads are written to the function logs so nothing is lost while you set it up.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  var b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  var name = String(b.name || '').trim().slice(0, 80);
  var phone = String(b.phone || '').replace(/[^\d+]/g, '').slice(0, 14);
  var program = ['BSW', 'MSW', 'Ph.D.'].indexOf(b.program) > -1 ? b.program : 'BSW';
  if (name.length < 2 || !/^\+91[6-9]\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: 'invalid' });
  var lead = { name: name, phone: phone, program: program, page: String(b.page || '').slice(0, 300), lang: String(b.lang || '').slice(0, 5), at: new Date().toISOString() };
  var url = process.env.LEAD_WEBHOOK_URL;
  try {
    if (url) {
      var r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      if (!r.ok) throw new Error('webhook ' + r.status);
    } else {
      console.log('LEAD', JSON.stringify(lead));
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('LEAD_FAILED', JSON.stringify(lead), e && e.message);
    return res.status(502).json({ ok: false });
  }
};
