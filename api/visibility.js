const { sql } = require('./_db');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT section_key, hidden FROM section_visibility`;
      const map = {};
      rows.forEach(r => { map[r.section_key] = r.hidden; });
      return res.status(200).json({ ok: true, hidden: map });
    }

    if (req.method === 'POST') {
      const { changes } = req.body; // { "srv-projeto": true, "sol-comercial": false, ... }
      if (!changes || typeof changes !== 'object') {
        return res.status(400).json({ ok: false, error: 'Faltando "changes"' });
      }
      for (const [key, hidden] of Object.entries(changes)) {
        await sql`
          INSERT INTO section_visibility (section_key, hidden, updated_at)
          VALUES (${key}, ${!!hidden}, now())
          ON CONFLICT (section_key) DO UPDATE SET hidden = ${!!hidden}, updated_at = now()
        `;
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Erro no servidor' });
  }
};
