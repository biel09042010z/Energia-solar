const bcrypt = require('bcryptjs');
const { sql } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  }

  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ ok: false, error: 'Informe email e senha' });
    }

    const rows = await sql`SELECT pass_hash FROM admin_users WHERE email = ${email}`;
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos' });
    }

    const confere = await bcrypt.compare(senha, rows[0].pass_hash);
    if (!confere) {
      return res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Erro no servidor' });
  }
};
