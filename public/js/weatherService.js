// js/weatherService.js

// A linha const OPENWEATHER_API_KEY = "SUA_CHAVE_AQUI"; DEVE SER REMOVIDA OU COMENTADA

async function fetchWeatherData(nomeCidade = "") {
    // Esta função era para o clima ATUAL.
    // O endpoint que criamos no backend é para FORECAST (previsão para vários dias).
    // Se você precisar de clima atual, precisará criar um endpoint similar no backend para /clima-atual.
    // Por ora, vamos desabilitá-la para não causar confusão ou erros.
    const errorMsg = "[WeatherService] fetchWeatherData (clima atual) não está configurado para usar o backend. Crie um endpoint /clima-atual no servidor se esta funcionalidade for necessária.";
    console.warn(errorMsg);
    // alert(errorMsg); // Pode ser muito intrusivo para o usuário
    return Promise.reject(new Error(errorMsg)); // Indica que a função não deve ser usada como está.
}

async function fetchForecastData(nomeCidade = "", numDias = 5) {
    // URL do nosso backend.
    // Se o seu frontend (index.html) estiver sendo servido pelo Live Server (ex: porta 5500 ou similar),
    // e o backend Node.js rodar na porta 3000, você PRECISA da URL completa.
    const backendUrl = `http://localhost:3000/clima?cidade=${encodeURIComponent(nomeCidade)}`;
    // Nota: O parâmetro numDias é usado pelo frontend para decidir quantos dias mostrar,
    // o backend sempre buscará o forecast completo da OpenWeatherMap (que é o comportamento padrão da API deles).

    console.log(`[WeatherService] Chamando backend para forecast: ${backendUrl}`);

    try {
        const response = await fetch(backendUrl); // Chama o NOSSO backend
        const data = await response.json();     // Espera uma resposta JSON

        if (!response.ok) {
            // O backend deve retornar uma mensagem de erro significativa em 'data.message'
            let mensagemErroApi = `Erro ${response.status}`;
            if (data && data.message) {
                mensagemErroApi = data.message; // Usa a mensagem de erro vinda do backend
            } else if (response.status === 404 && data && data.details && data.details.message) {
                // Tratamento específico para 404 da OpenWeather (cidade não encontrada)
                mensagemErroApi = data.details.message;
            } else {
                mensagemErroApi += ": Erro ao buscar previsão do servidor da Garagem Inteligente.";
            }
            console.error("[WeatherService] Erro retornado pelo backend:", mensagemErroApi, data);
            throw new Error(mensagemErroApi);
        }

        console.log("[WeatherService] Dados recebidos do backend:", data);

        // A lógica de processamento dos dados da API OpenWeatherMap (data.list, data.city, etc.)
        // permanece a mesma, pois nosso backend está apenas fazendo o proxy da resposta.
        const previsoesPorDia = {};
        if (data.list && Array.isArray(data.list)) {
            data.list.forEach(item => {
                const dataISO = item.dt_txt.split(' ')[0]; // Pega apenas a parte da data "YYYY-MM-DD"
                if (!previsoesPorDia[dataISO]) {
                    previsoesPorDia[dataISO] = {
                        data: dataISO,
                        entradas: [], // Para guardar todas as entradas de 3h para este dia
                        temp_min_dia: item.main.temp_min,
                        temp_max_dia: item.main.temp_max,
                        descricoesContador: {},
                        iconesContador: {},
                        umidadeSoma: 0, ventoSoma: 0, nuvensSoma: 0, tempSoma: 0,
                        countEntradas: 0,
                        // Para escolher a descrição/ícone principal (ex: meio-dia)
                        descricaoPrincipal: null, iconePrincipal: null, tempPrincipal: null,
                    };
                }
                const diaAtual = previsoesPorDia[dataISO];
                diaAtual.entradas.push(item); // Adiciona a entrada horária completa
                diaAtual.temp_min_dia = Math.min(diaAtual.temp_min_dia, item.main.temp_min);
                diaAtual.temp_max_dia = Math.max(diaAtual.temp_max_dia, item.main.temp_max);

                // Contabiliza descrições e ícones para encontrar o mais comum
                const desc = item.weather[0].description;
                const iconBase = item.weather[0].icon.substring(0, 2); // Ex: '01' de '01d'
                diaAtual.descricoesContador[desc] = (diaAtual.descricoesContador[desc] || 0) + 1;
                diaAtual.iconesContador[iconBase] = (diaAtual.iconesContador[iconBase] || 0) + 1;

                // Soma para médias
                diaAtual.umidadeSoma += item.main.humidity;
                diaAtual.ventoSoma += item.wind.speed;
                diaAtual.nuvensSoma += item.clouds.all;
                diaAtual.tempSoma += item.main.temp;
                diaAtual.countEntradas++;

                // Tenta pegar dados de um horário representativo (ex: entre 12h e 15h) como "principal"
                const horaEntrada = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
                if (horaEntrada >= 12 && horaEntrada <= 15 && !diaAtual.descricaoPrincipal) {
                    diaAtual.descricaoPrincipal = item.weather[0].description;
                    diaAtual.iconePrincipal = item.weather[0].icon;
                    diaAtual.tempPrincipal = item.main.temp;
                }
            });
        } else {
            console.warn("[WeatherService] Estrutura de dados inesperada do backend (data.list não encontrado ou não é array):", data);
            throw new Error("Resposta inválida do servidor de clima da Garagem Inteligente.");
        }

        // Agrega os dados diários
        const resultadoFinal = Object.values(previsoesPorDia).map(dia => {
            let descFinal = dia.descricaoPrincipal;
            let iconFinal = dia.iconePrincipal;
            let tempFinal = dia.tempPrincipal;

            // Fallback se não encontrou um horário "principal"
            if (!descFinal && dia.entradas.length > 0) {
                descFinal = Object.keys(dia.descricoesContador).reduce((a, b) => dia.descricoesContador[a] > dia.descricoesContador[b] ? a : b, "");
                const iconBaseFinal = Object.keys(dia.iconesContador).reduce((a, b) => dia.iconesContador[a] > dia.iconesContador[b] ? a : b, "");
                iconFinal = iconBaseFinal ? `${iconBaseFinal}d` : '01d'; // Default 'd' para dia
            }
            if (tempFinal === null) { // Se não pegou temp principal, calcula média
                tempFinal = dia.countEntradas > 0 ? dia.tempSoma / dia.countEntradas : (dia.temp_min_dia + dia.temp_max_dia) / 2;
            }


            return {
                data: dia.data,
                temperaturaMin: dia.temp_min_dia,
                temperaturaMax: dia.temp_max_dia,
                temperatura: tempFinal, // Pode ser a temp do meio-dia ou média
                descricao: descFinal || 'N/A',
                icone: iconFinal || '01d', // Ícone do meio-dia, mais comum, ou fallback
                umidade: dia.countEntradas > 0 ? dia.umidadeSoma / dia.countEntradas : 0,
                ventoVelocidade: dia.countEntradas > 0 ? dia.ventoSoma / dia.countEntradas : 0,
                nuvens: dia.countEntradas > 0 ? dia.nuvensSoma / dia.countEntradas : 0,
                entradasHorarias: dia.entradas // Mantém as entradas horárias para detalhes
            };
        }).slice(0, numDias); // O frontend ainda usa numDias para fatiar o resultado final

        return {
            cidadeNome: data.city ? data.city.name : "Cidade Desconhecida",
            pais: data.city ? data.city.country : "",
            previsoes: resultadoFinal
        };
    } catch (error) {
        console.error("[WeatherService] Falha ao buscar dados do backend ou processá-los:", error.message);
        // O erro já deve ser uma instância de Error com uma mensagem significativa
        throw error; // Re-lança o erro para ser tratado pela função chamadora no main.js
    }
}