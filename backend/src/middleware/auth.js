const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

const apenasAdmin = (req, res, next) => {
  if (!['admin', 'secretario'].includes(req.usuario.perfil)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
};

module.exports = { autenticar, apenasAdmin };
