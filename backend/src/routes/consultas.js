const router = require('express').Router();
const { Op } = require('sequelize');
const Consulta = require('../models/Consulta');
const User = require('../models/User');
const { autenticar } = require('../middleware/auth');
const axios = require('axios');

// Verificar disponibilidade
router.get('/disponibilidade', autenticar, async (req, res) => {
  const { dataHora, medicoNome } = req.query;
  const inicio = new Date(dataHora);
  const fim = new Date(inicio.getTime() + 30 * 60000); // bloco de 30 min

  const conflito = await Consulta.findOne({
    where: {
      medicoNome,
      status: { [Op.ne]: 'cancelada' },
      dataHora: { [Op.between]: [inicio, fim] }
    }
  });

  res.json({ disponivel: !conflito });
});

// Agendar consulta
router.post('/', autenticar, async (req, res) => {
  try {
    const { medicoNome, especialidade, dataHora, observacoes } = req.body;

    // Verificar conflito
    const inicio = new Date(dataHora);
    const fim = new Date(inicio.getTime() + 30 * 60000);
    const conflito = await Consulta.findOne({
      where: { medicoNome, status: { [Op.ne]: 'cancelada' }, dataHora: { [Op.between]: [inicio, fim] } }
    });
    if (conflito) return res.status(409).json({ erro: 'Horário indisponível para este médico' });

    // Verificar chuva
    let alertaChuva = false;
    try {
      const usuario = await User.findByPk(req.usuario.id);
      if (usuario?.cidade) {
        const clima = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(usuario.cidade)},BR&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
        );
        const dataConsulta = new Date(dataHora).toDateString();
        alertaChuva = clima.data.list.some(item => {
          return new Date(item.dt_txt).toDateString() === dataConsulta &&
            item.weather.some(w => w.main === 'Rain' || w.main === 'Thunderstorm');
        });
      }
    } catch { /* clima não bloqueia agendamento */ }

    const consulta = await Consulta.create({
      pacienteId: req.usuario.id, medicoNome, especialidade, dataHora, observacoes, alertaChuva
    });

    res.status(201).json({ consulta, alertaChuva });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Listar consultas do paciente
router.get('/minhas', autenticar, async (req, res) => {
  const consultas = await Consulta.findAll({
    where: { pacienteId: req.usuario.id },
    order: [['dataHora', 'ASC']]
  });
  res.json(consultas);
});

// Cancelar consulta
router.patch('/:id/cancelar', autenticar, async (req, res) => {
  const consulta = await Consulta.findByPk(req.params.id);
  if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada' });
  if (consulta.pacienteId !== req.usuario.id && req.usuario.perfil === 'paciente') {
    return res.status(403).json({ erro: 'Sem permissão' });
  }
  await consulta.update({ status: 'cancelada' });
  res.json({ mensagem: 'Consulta cancelada' });
});

module.exports = router;
