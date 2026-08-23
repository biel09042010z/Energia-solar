const { sql } = require('./_db');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT img_key, data_url FROM site_images`;
      const map = {};
      rows.forEach(r => { map[r.img_key] = r.data_url; });
      return res.status(200).json({ ok: true, images: map });
    }

    if (req.method === 'POST') {
      const { key, dataUrl } = req.body;
      if (!key || !dataUrl) {
        return res.status(400).json({ ok: false, error: 'Faltando key ou dataUrl' });
      }
      await sql`
        INSERT INTO site_images (img_key, data_url, updated_at)
        VALUES (${key}, ${dataUrl}, now())
        ON CONFLICT (img_key) DO UPDATE SET data_url = ${dataUrl}, updated_at = now()
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { key } = req.body;
      if (!key) {
        return res.status(400).json({ ok: false, error: 'Faltando key' });
      }
      await sql`DELETE FROM site_images WHERE img_key = ${key}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Erro no servidor' });
  }
};
