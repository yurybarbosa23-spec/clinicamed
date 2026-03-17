require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const consultaRoutes = require('./src/routes/consultas');
const cepRoutes = require('./src/routes/cep');
const climaRoutes = require('./src/routes/clima');
const adminRoutes = require('./src/routes/admin');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/cep', cepRoutes);
app.use('/api/clima', climaRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3001;

sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Banco de dados sincronizado');
  app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
}).catch(err => console.error('Erro ao conectar DB:', err));
