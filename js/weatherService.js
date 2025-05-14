// js/weatherService.js

const OPENWEATHER_API_KEY = "666060fc76bb4c209494b8e88e39fecd"; // Sua chave API

async function fetchWeatherData(nomeCidade = "") {
    if (OPENWEATHER_API_KEY === "e8c91924ec3936ddb52803320555d684" || !OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.length < 30) {
        const errorMsg = "Chave da API OpenWeatherMap não configurada ou inválida em weatherService.js.";
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            let mensagemErro = `Erro ${response.status}`;
            if (data && data.message) mensagemErro += `: ${data.message}`;
            else if (response.status === 401) mensagemErro += ": Chave de API inválida.";
            else if (response.status === 404) mensagemErro += ": Cidade não encontrada.";
            else mensagemErro += ": Erro ao buscar previsão.";
            console.error(mensagemErro, data);
            throw new Error(mensagemErro);
        }
        return {
            temperatura: data.main.temp,
            sensacao: data.main.feels_like,
            descricao: data.weather[0].description,
            umidade: data.main.humidity,
            icone: data.weather[0].icon,
            cidadeNome: data.name,
            pais: data.sys.country,
            ventoVelocidade: data.wind.speed,
            nuvens: data.clouds.all
        };
    } catch (error) {
        console.error("[WeatherService] Falha (clima atual):", error.message);
        throw error;
    }
}

async function fetchForecastData(nomeCidade = "", numDias = 5) {
    if (OPENWEATHER_API_KEY === "e8c91924ec3936ddb52803320555d684" || !OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.length < 30) {
        const errorMsg = "Chave da API OpenWeatherMap não configurada ou inválida.";
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(nomeCidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            let mensagemErro = `Erro ${response.status}`;
            if (data && data.message) mensagemErro += `: ${data.message}`;
            else if (response.status === 401) mensagemErro += ": Chave de API inválida.";
            else if (response.status === 404) mensagemErro += ": Cidade não encontrada.";
            else mensagemErro += ": Erro ao buscar previsão futura.";
            console.error(mensagemErro, data);
            throw new Error(mensagemErro);
        }

        const previsoesPorDia = {};
        data.list.forEach(item => {
            const dataISO = item.dt_txt.split(' ')[0];
            if (!previsoesPorDia[dataISO]) {
                previsoesPorDia[dataISO] = {
                    data: dataISO,
                    entradas: [],
                    temp_min_dia: item.main.temp_min,
                    temp_max_dia: item.main.temp_max,
                    descricoesContador: {},
                    iconesContador: {},
                    umidadeSoma: 0, ventoSoma: 0, nuvensSoma: 0, tempSoma: 0,
                    countEntradas: 0,
                    descricaoPrincipal: null, iconePrincipal: null, tempPrincipal: null,
                };
            }
            const diaAtual = previsoesPorDia[dataISO];
            diaAtual.entradas.push(item); // Guarda a entrada horária completa
            diaAtual.temp_min_dia = Math.min(diaAtual.temp_min_dia, item.main.temp_min);
            diaAtual.temp_max_dia = Math.max(diaAtual.temp_max_dia, item.main.temp_max);
            const desc = item.weather[0].description;
            const iconBase = item.weather[0].icon.substring(0, 2);
            diaAtual.descricoesContador[desc] = (diaAtual.descricoesContador[desc] || 0) + 1;
            diaAtual.iconesContador[iconBase] = (diaAtual.iconesContador[iconBase] || 0) + 1;
            diaAtual.umidadeSoma += item.main.humidity;
            diaAtual.ventoSoma += item.wind.speed;
            diaAtual.nuvensSoma += item.clouds.all;
            diaAtual.tempSoma += item.main.temp;
            diaAtual.countEntradas++;
            const horaEntrada = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
            if (horaEntrada >= 12 && horaEntrada <= 15 && !diaAtual.descricaoPrincipal) {
                diaAtual.descricaoPrincipal = item.weather[0].description;
                diaAtual.iconePrincipal = item.weather[0].icon;
                diaAtual.tempPrincipal = item.main.temp;
            }
        });
        
        const resultadoFinal = Object.values(previsoesPorDia).map(dia => {
            let descFinal = dia.descricaoPrincipal;
            let iconFinal = dia.iconePrincipal;
            let tempFinal = dia.tempPrincipal;
            if (!descFinal && dia.entradas.length > 0) {
                descFinal = Object.keys(dia.descricoesContador).reduce((a, b) => dia.descricoesContador[a] > dia.descricoesContador[b] ? a : b, "");
                const iconBaseFinal = Object.keys(dia.iconesContador).reduce((a, b) => dia.iconesContador[a] > dia.iconesContador[b] ? a : b, "");
                iconFinal = iconBaseFinal ? `${iconBaseFinal}d` : '01d';
            }
            if (tempFinal === null) tempFinal = dia.countEntradas > 0 ? dia.tempSoma / dia.countEntradas : (dia.temp_min_dia + dia.temp_max_dia) / 2;

            return {
                data: dia.data,
                temperaturaMin: dia.temp_min_dia,
                temperaturaMax: dia.temp_max_dia,
                temperatura: tempFinal,
                descricao: descFinal || 'N/A',
                icone: iconFinal || '01d',
                umidade: dia.countEntradas > 0 ? dia.umidadeSoma / dia.countEntradas : 0,
                ventoVelocidade: dia.countEntradas > 0 ? dia.ventoSoma / dia.countEntradas : 0,
                nuvens: dia.countEntradas > 0 ? dia.nuvensSoma / dia.countEntradas : 0,
                entradasHorarias: dia.entradas // Passa as entradas horárias brutas para este dia
            };
        }).slice(0, numDias);

        return {
            cidadeNome: data.city.name,
            pais: data.city.country,
            previsoes: resultadoFinal // Note que 'previsoes' agora contém 'entradasHorarias'
        };
    } catch (error) {
        console.error("[WeatherService] Falha (forecast):", error.message);
        throw error;
    }
}