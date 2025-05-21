// server.js
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importa o pacote cors
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; // Usa a porta do .env ou 3000 como padrão
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY_BACKEND;

// Middleware para habilitar CORS para todas as origens
app.use(cors());

// Middleware para parsear JSON (útil para futuras requisições POST/PUT)
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")))
// Endpoint GET /clima
// Exemplo de chamada do frontend: http://localhost:3000/clima?cidade=Londres
app.get('/clima', async (req, res) => {
    const { cidade } = req.query; // Pega o parâmetro 'cidade' da URL

    // Validação da chave da API no servidor
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.length < 30) {
        console.error('Chave da API OpenWeatherMap não configurada ou inválida no servidor.');
        // Em produção, não exponha detalhes internos, mas para debug local é útil.
        return res.status(500).json({ message: 'Erro de configuração do servidor: Chave da API ausente ou inválida.' });
    }

    // Validação do parâmetro 'cidade'
    if (!cidade) {
        return res.status(400).json({ message: 'O parâmetro "cidade" é obrigatório.' });
    }

    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    try {
        console.log(`Backend: Recebida requisição para cidade: ${cidade}`);
        // Para não logar sua chave, você pode fazer um replace temporário ou omitir a URL completa no log
        console.log(`Backend: Chamando OpenWeatherMap API (URL sem chave para log): ${openWeatherUrl.replace(OPENWEATHER_API_KEY, 'SUA_CHAVE_OCULTA')}`);

        // Faz a requisição para a API OpenWeatherMap usando axios
        const response = await axios.get(openWeatherUrl);

        // Envia a resposta da OpenWeatherMap de volta para o frontend
        res.json(response.data);
        console.log(`Backend: Resposta da OpenWeatherMap enviada para o cliente para cidade: ${cidade}`);

    } catch (error) {
        console.error('Backend: Erro ao buscar dados do OpenWeatherMap:');
        if (error.response) {
            // Erro vindo da API OpenWeatherMap (ex: cidade não encontrada, chave inválida)
            console.error(' - Status:', error.response.status);
            console.error(' - Data:', error.response.data);
            res.status(error.response.status).json({
                message: error.response.data.message || 'Erro ao contatar o serviço de clima externo.',
                details: error.response.data // Pode incluir 'details' para debug no frontend
            });
        } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            console.error(' - Error Request:', error.request);
            res.status(503).json({ message: 'Serviço de clima externo indisponível ou não respondeu.' });
        } else {
            // Algo deu errado ao configurar a requisição
            console.error(' - Error Message:', error.message);
            res.status(500).json({ message: 'Erro interno no servidor ao processar a requisição de clima.' });
        }
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend da Garagem Inteligente rodando na porta ${PORT}`);
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.length < 30) {
        console.warn('-----------------------------------------------------------------------------');
        console.warn('ATENÇÃO: A variável de ambiente OPENWEATHER_API_KEY_BACKEND não está configurada');
        console.warn('corretamente no arquivo .env. O endpoint de clima NÃO FUNCIONARÁ.');
        console.warn('Verifique se o arquivo .env existe e contém a chave correta.');
        console.warn('-----------------------------------------------------------------------------');
    } else {
        console.log('Chave da API OpenWeatherMap carregada com sucesso do .env.');
    }
});