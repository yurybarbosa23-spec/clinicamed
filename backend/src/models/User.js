const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  senha: { type: DataTypes.STRING, allowNull: false },
  perfil: { type: DataTypes.ENUM('paciente', 'secretario', 'admin'), defaultValue: 'paciente' },
  cep: { type: DataTypes.STRING },
  logradouro: { type: DataTypes.STRING },
  bairro: { type: DataTypes.STRING },
  cidade: { type: DataTypes.STRING },
  uf: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.senha = await bcrypt.hash(user.senha, 12);
    }
  }
});

User.prototype.verificarSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = User;
