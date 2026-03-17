const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha, perfil, cep, logradouro, bairro, cidade, uf } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });

    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const user = await User.create({ nome, email, senha, perfil, cep, logradouro, bairro, cidade, uf });
    res.status(201).json({ mensagem: 'Usuário criado com sucesso', id: user.id });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.verificarSenha(senha))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
