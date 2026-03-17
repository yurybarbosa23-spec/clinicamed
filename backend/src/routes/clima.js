const router = require('express').Router();
const axios = require('axios');
const { autenticar } = require('../middleware/auth');

router.get('/:cidade', autenticar, async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(req.params.cidade)},BR&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br&cnt=40`
    );

    const previsao = data.list.map(item => ({
      dataHora: item.dt_txt,
      temp: item.main.temp,
      descricao: item.weather[0].description,
      chuva: ['Rain', 'Thunderstorm', 'Drizzle'].includes(item.weather[0].main)
    }));

    res.json({ cidade: data.city.name, previsao });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar previsão do tempo' });
  }
});

module.exports = router;
