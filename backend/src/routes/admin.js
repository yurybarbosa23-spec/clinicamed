const router = require('express').Router();
const Consulta = require('../models/Consulta');
const User = require('../models/User');
const { autenticar, apenasAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// Listar todas as consultas
router.get('/consultas', autenticar, apenasAdmin, async (req, res) => {
  const { status, data } = req.query;
  const where = {};
  if (status) where.status = status;
  if (data) {
    const inicio = new Date(data); inicio.setHours(0, 0, 0);
    const fim = new Date(data); fim.setHours(23, 59, 59);
    where.dataHora = { [Op.between]: [inicio, fim] };
  }

  const consultas = await Consulta.findAll({
    where,
    include: [{ model: User, as: 'paciente', attributes: ['nome', 'email', 'cidade'] }],
    order: [['dataHora', 'ASC']]
  });
  res.json(consultas);
});

// Atualizar status
router.patch('/consultas/:id/status', autenticar, apenasAdmin, async (req, res) => {
  const consulta = await Consulta.findByPk(req.params.id);
  if (!consulta) return res.status(404).json({ erro: 'Não encontrada' });
  await consulta.update({ status: req.body.status });
  res.json({ mensagem: 'Status atualizado', consulta });
});

// Dashboard: métricas
router.get('/metricas', autenticar, apenasAdmin, async (req, res) => {
  const total = await Consulta.count();
  const agendadas = await Consulta.count({ where: { status: 'agendada' } });
  const canceladas = await Consulta.count({ where: { status: 'cancelada' } });
  const realizadas = await Consulta.count({ where: { status: 'realizada' } });
  const pacientes = await User.count({ where: { perfil: 'paciente' } });
  res.json({ total, agendadas, canceladas, realizadas, pacientes });
});

module.exports = router;
