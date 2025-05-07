// js/weatherService.js

// ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
// Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
// A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
// Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
//
// ===================================================================================
// === COLOQUE SUA CHAVE DA OPENWEATHERMAP AQUI:                                   ===
// === Se esta for sua chave real, mantenha. Se for um placeholder, substitua.     ===
// ===================================================================================
const OPENWEATHER_API_KEY = "666060fc76bb4c209494b8e88e39fecd"; // <--- CERTIFIQUE-SE QUE ESTA É SUA CHAVE VÁLIDA

/**
 * Busca a previsão do tempo atual para uma cidade.
 * @async
 * @param {string} nomeCidade - O nome da cidade para buscar a previsão.
 * @returns {Promise<object>} Um objeto com os dados da previsão.
 * @throws {Error} Se a chave da API não estiver configurada, ou se houver um erro da API, ou erro de rede.
 * Formato do objeto de sucesso:
 * {
 *   temperatura: number,
 *   sensacao: number,
 *   descricao: string,
 *   umidade: number,
 *   icone: string,
 *   cidadeNome: string,
 *   pais: string,
 *   ventoVelocidade: number,
 *   nuvens: number
 * }
 */
async function fetchWeatherData(nomeCidade = "") { // Mantido o nome fetchWeatherData
    // Corrigido: Verificar se a chave é o placeholder padrão ou está vazia
    if (OPENWEATHER_API_KEY === "e8c91924ec3936ddb52803320555d684" || !OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.length < 30) {
        const errorMsg = "Chave da API OpenWeatherMap não configurada ou inválida em weatherService.js. Por favor, adicione sua chave válida.";
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        const data = await response.json(); // Lê o corpo da resposta como JSON, mesmo para erros

        if (!response.ok) {
            // Erros comuns: 401 (chave inválida), 404 (cidade não encontrada), 429 (limite de chamadas)
            let mensagemErro = `Erro ${response.status}`;
            if (data && data.message) {
                mensagemErro += `: ${data.message}`;
            } else if (response.status === 401) {
                mensagemErro += ": Chave de API inválida ou não autorizada.";
            } else if (response.status === 404) {
                mensagemErro += ": Cidade não encontrada.";
            } else {
                mensagemErro += ": Erro ao buscar previsão do tempo.";
            }
            console.error(mensagemErro, data);
            throw new Error(mensagemErro); // LANÇA o erro para ser pego pelo catch em main.js
        }

        // Extrai os dados relevantes
        const previsao = {
            temperatura: data.main.temp,
            sensacao: data.main.feels_like,
            descricao: data.weather[0].description,
            umidade: data.main.humidity,
            icone: data.weather[0].icon,
            cidadeNome: data.name,
            pais: data.sys.country,
            ventoVelocidade: data.wind.speed, // m/s
            nuvens: data.clouds.all // %
        };
        console.log("[WeatherService] Dados do clima:", previsao);
        return previsao; // Retorna o objeto de previsão formatado

    } catch (error) {
        // Se o erro já foi lançado pelo bloco !response.ok, ele será pego aqui e re-lançado.
        // Se for um erro de rede (fetch falhou antes do .json()), error.message será "Failed to fetch".
        console.error("[WeatherService] Falha na requisição ou processamento:", error.message);
        // Re-lança o erro para ser pego e tratado pelo chamador na UI (main.js)
        // Se for um erro já instanciado (como o da chave), ele será apenas repassado.
        // Se for um erro de rede, ele será lançado como new Error implicitamente pelo fetch.
        throw error;
    }
}