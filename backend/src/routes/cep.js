const router = require('express').Router();
const axios = require('axios');
const { autenticar } = require('../middleware/auth');

router.get('/:cep', autenticar, async (req, res) => {
  try {
    const cep = req.params.cep.replace(/\D/g, '');
    if (cep.length !== 8) return res.status(400).json({ erro: 'CEP inválido' });

    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (data.erro) return res.status(404).json({ erro: 'CEP não encontrado' });

    res.json(data);
  } catch {
    res.status(500).json({ erro: 'Erro ao consultar ViaCEP' });
  }
});

module.exports = router;
