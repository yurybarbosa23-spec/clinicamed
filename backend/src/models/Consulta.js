const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Consulta = sequelize.define('Consulta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pacienteId: { type: DataTypes.INTEGER, allowNull: false },
  medicoNome: { type: DataTypes.STRING, allowNull: false },
  especialidade: { type: DataTypes.STRING, allowNull: false },
  dataHora: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('agendada', 'confirmada', 'cancelada', 'realizada'), defaultValue: 'agendada' },
  observacoes: { type: DataTypes.TEXT },
  alertaChuva: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Consulta.belongsTo(User, { as: 'paciente', foreignKey: 'pacienteId' });
User.hasMany(Consulta, { as: 'consultas', foreignKey: 'pacienteId' });

module.exports = Consulta;
