// js/main.js

const garagem = new Garagem();
let dadosPrevisaoGlobal = null;
let unidadeTemperaturaAtual = 'C'; // 'C' para Celsius, 'F' para Fahrenheit
const CHAVE_STORAGE_UNIDADE_TEMP = 'unidadeTemperaturaPreferida';

// Funções de conversão de temperatura
function celsiusParaFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// function fahrenheitParaCelsius(fahrenheit) { // Não usada ativamente, mas pode ser útil
//     return (fahrenheit - 32) * 5/9;
// }

function formatarTemperatura(tempCelsius) {
    if (unidadeTemperaturaAtual === 'F') {
        return `${celsiusParaFahrenheit(tempCelsius).toFixed(1)}°F`;
    }
    return `${tempCelsius.toFixed(1)}°C`;
}
function formatarTemperaturaInteira(tempCelsius) {
    if (unidadeTemperaturaAtual === 'F') {
        return `${celsiusParaFahrenheit(tempCelsius).toFixed(0)}°F`;
    }
    return `${tempCelsius.toFixed(0)}°C`;
}

// Função para determinar a classe CSS baseada na temperatura para o degradê
function getClassPorTemperatura(tempCelsius) {
    if (tempCelsius < 5) return 'temp-grad-muito-frio';
    if (tempCelsius < 12) return 'temp-grad-frio';
    if (tempCelsius < 20) return 'temp-grad-ameno';
    if (tempCelsius < 28) return 'temp-grad-quente';
    return 'temp-grad-muito-quente';
}

// // Temporariamente removida para focar no degradê de temperatura
// function getClassEfeitoClima(icone, descricao) {
//     const descLower = descricao.toLowerCase();
//     if (icone.includes('11') || descLower.includes('trovoada')) return 'efeito-trovoada';
//     if (icone.includes('09') || icone.includes('10') || descLower.includes('chuva') || descLower.includes('chuvisco')) return 'efeito-chuva';
//     if (icone.includes('13') || descLower.includes('neve')) return 'efeito-neve';
//     if (icone.includes('50') || descLower.includes('névoa') || descLower.includes('neblina')) return 'efeito-nevoa';
//     if (icone === '02d' || icone === '02n') return 'efeito-poucas-nuvens';
//     if (icone === '03d' || icone === '03n') return 'efeito-nuvens-dispersas';
//     if (icone === '04d' || icone === '04n' || descLower.includes('nublado')) return 'efeito-nublado';
//     if (icone === '01d') return 'efeito-sol';
//     if (icone === '01n') return 'efeito-ceu-limpo-noite';
//     return '';
// }


function renderizarPrevisaoCompleta() {
    if (!dadosPrevisaoGlobal) return;

    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');
    const numDias = parseInt(document.querySelector('input[name="numDias"]:checked').value, 10);

    const destacarChuva = document.getElementById('destaque-chuva').checked;
    const destacarTempBaixa = document.getElementById('destaque-temp-baixa-check').checked;
    const valorTempBaixa = parseFloat(document.getElementById('destaque-temp-baixa-valor').value);
    const destacarTempAlta = document.getElementById('destaque-temp-alta-check').checked;
    const valorTempAlta = parseFloat(document.getElementById('destaque-temp-alta-valor').value);

    let htmlConteudo = `<h3>Clima em ${dadosPrevisaoGlobal.cidadeNome}, ${dadosPrevisaoGlobal.pais} para ${numDias === 1 ? 'o próximo dia' : `os próximos ${numDias} dias`}</h3>`;
    htmlConteudo += '<div class="previsao-dias-container">';

    if (dadosPrevisaoGlobal.previsoes && dadosPrevisaoGlobal.previsoes.length > 0) {
        const previsoesParaExibir = dadosPrevisaoGlobal.previsoes.slice(0, numDias);

        previsoesParaExibir.forEach(previsaoDia => {
            const dataObj = new Date(previsaoDia.data + "T00:00:00");
            const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const iconUrl = `https://openweathermap.org/img/wn/${previsaoDia.icone}@2x.png`;
            
            let classesCard = "previsao-dia-card forecast-card-clickable";
            // Adiciona classe de temperatura para o degradê
            classesCard += ` ${getClassPorTemperatura(previsaoDia.temperatura)}`;
            // // Temporariamente removido:
            // classesCard += ` ${getClassEfeitoClima(previsaoDia.icone, previsaoDia.descricao)}`;

            if (destacarChuva && previsaoDia.descricao.toLowerCase().includes('chuva')) {
                classesCard += " highlight-rain";
            }
            if (destacarTempBaixa && !isNaN(valorTempBaixa) && previsaoDia.temperaturaMin <= valorTempBaixa) {
                classesCard += " highlight-temp-low";
            }
            if (destacarTempAlta && !isNaN(valorTempAlta) && previsaoDia.temperaturaMax >= valorTempAlta) {
                classesCard += " highlight-temp-high";
            }

            // CORREÇÃO AQUI: Removido o comentário inline que estava aparecendo
            htmlConteudo += `
                <div class="${classesCard.trim()}" data-forecast-date="${previsaoDia.data}">
                    <div class="card-content-wrapper"> 
                        <h4>${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dataFormatada} (clique)</h4>
                        <img src="${iconUrl}" alt="${previsaoDia.descricao}" class="weather-icon-daily">
                        <p><strong>Min:</strong> ${formatarTemperatura(previsaoDia.temperaturaMin)} / <strong>Max:</strong> ${formatarTemperatura(previsaoDia.temperaturaMax)}</p>
                        <p><strong>Temp.:</strong> ${formatarTemperatura(previsaoDia.temperatura)}</p>
                        <p><strong>Condição:</strong> <span style="text-transform: capitalize;">${previsaoDia.descricao}</span></p>
                        <p><strong>Umidade:</strong> ${previsaoDia.umidade.toFixed(0)}%</p>
                        <div class="detalhes-horarios-container" style="display: none;"></div>
                    </div>
                </div>
            `;
        });
    } else {
        htmlConteudo += `<p class="not-found">Nenhuma previsão detalhada encontrada.</p>`;
    }
    htmlConteudo += '</div>';
    previsaoResultadoDiv.innerHTML = htmlConteudo;
}


window.onload = () => {
    console.log("window.onload disparado. Inicializando garagem...");
    const unidadeSalva = localStorage.getItem(CHAVE_STORAGE_UNIDADE_TEMP);
    if (unidadeSalva) {
        unidadeTemperaturaAtual = unidadeSalva;
    }
    const btnAlternarUnidade = document.getElementById('alternar-unidade-temp-btn');
    if (btnAlternarUnidade) {
         btnAlternarUnidade.textContent = `Mudar para ${unidadeTemperaturaAtual === 'C' ? '°F' : '°C'}`;
    }

    const carregou = garagem.carregarGaragem();
    if (!carregou || Object.keys(garagem.veiculos).length === 0) {
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
        garagem.exibirInformacoes('meuCarro');
    } else {
        garagem.atualizarUICompleta();
    }
    garagem.atualizarListaAgendamentos();

    document.querySelectorAll('.btn-detalhes-extras').forEach(botao => {
        botao.addEventListener('click', async (event) => {
            const veiculoId = event.target.dataset.veiculoId;
            if (veiculoId) await garagem.mostrarDetalhesExtras(veiculoId);
        });
    });

    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    const destinoInput = document.getElementById('destino-viagem');
    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');

    if (btnAlternarUnidade) {
        btnAlternarUnidade.addEventListener('click', () => {
            unidadeTemperaturaAtual = unidadeTemperaturaAtual === 'C' ? 'F' : 'C';
            localStorage.setItem(CHAVE_STORAGE_UNIDADE_TEMP, unidadeTemperaturaAtual);
            btnAlternarUnidade.textContent = `Mudar para ${unidadeTemperaturaAtual === 'C' ? '°F' : '°C'}`;
            renderizarPrevisaoCompleta(); 
        });
    }
    
    document.querySelectorAll('input[name="numDias"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (dadosPrevisaoGlobal) { 
                renderizarPrevisaoCompleta();
            }
        });
    });

    ['destaque-chuva', 'destaque-temp-baixa-check', 'destaque-temp-alta-check', 'destaque-temp-baixa-valor', 'destaque-temp-alta-valor'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('change', () => {
                if (dadosPrevisaoGlobal) {
                    renderizarPrevisaoCompleta();
                }
            });
        }
    });


    if (verificarClimaBtn && destinoInput && previsaoResultadoDiv) {
        verificarClimaBtn.addEventListener('click', async () => {
            const nomeCidade = destinoInput.value.trim();
            
            if (!nomeCidade) {
                previsaoResultadoDiv.innerHTML = '<p class="error">Por favor, digite o nome da cidade.</p>';
                destinoInput.focus();
                return;
            }
            previsaoResultadoDiv.innerHTML = '<p class="loading">Buscando previsão...</p>';
            
            try {
                if (typeof fetchForecastData !== 'function') {
                    throw new Error('Função fetchForecastData não disponível.');
                }
                
                dadosPrevisaoGlobal = await fetchForecastData(nomeCidade, 5); 
                renderizarPrevisaoCompleta(); 

            } catch (error) {
                console.error("Erro ao buscar/exibir previsão (forecast):", error);
                previsaoResultadoDiv.innerHTML = `<p class="error">${error.message || 'Erro ao buscar a previsão.'}</p>`;
                dadosPrevisaoGlobal = null;
            }
        });

        previsaoResultadoDiv.addEventListener('click', (event) => {
            const cardClicado = event.target.closest('.forecast-card-clickable');
            if (cardClicado && dadosPrevisaoGlobal) {
                const dataSelecionada = cardClicado.dataset.forecastDate;
                const detalhesContainer = cardClicado.querySelector('.detalhes-horarios-container');
                
                if (detalhesContainer.style.display === 'block') {
                    detalhesContainer.style.display = 'none';
                    detalhesContainer.innerHTML = '';
                    return;
                }

                const previsaoDoDia = dadosPrevisaoGlobal.previsoes.find(p => p.data === dataSelecionada);

                if (previsaoDoDia && previsaoDoDia.entradasHorarias) {
                    let htmlHorarios = '<h5>Previsão Horária:</h5><div class="horarios-grid">';
                    previsaoDoDia.entradasHorarias.forEach(itemHorario => {
                        const hora = itemHorario.dt_txt.split(' ')[1].substring(0, 5);
                        const iconHorarioUrl = `https://openweathermap.org/img/wn/${itemHorario.weather[0].icon}.png`;
                        htmlHorarios += `
                            <div class="horario-item">
                                <span>${hora}</span>
                                <img src="${iconHorarioUrl}" alt="${itemHorario.weather[0].description}" title="${itemHorario.weather[0].description}">
                                <span>${formatarTemperaturaInteira(itemHorario.main.temp)}</span>
                            </div>
                        `;
                    });
                    htmlHorarios += '</div>';
                    detalhesContainer.innerHTML = htmlHorarios;
                    detalhesContainer.style.display = 'block';
                } else {
                    detalhesContainer.innerHTML = '<p>Detalhes horários não disponíveis.</p>';
                    detalhesContainer.style.display = 'block';
                }
            }
        });

    } else {
        console.error("Elementos do Planejador de Viagem não encontrados.");
    }
    garagem.verificarAgendamentosProximos();
    console.log("Inicialização completa.");
};