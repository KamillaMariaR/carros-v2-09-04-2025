// js/main.js

// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================
// Este script deve ser carregado DEPOIS de todas as classes (Manutencao, Veiculo, ..., Garagem)

// Cria a instância GLOBAL da Garagem
const garagem = new Garagem();

// Executa quando o HTML da página estiver completamente carregado
window.onload = () => {
    console.log("window.onload disparado. Inicializando garagem...");

    const carregou = garagem.carregarGaragem();
    if (!carregou || Object.keys(garagem.veiculos).length === 0) {
        console.log("Garagem vazia ou não carregada. Criando veículos padrão...");
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
        garagem.atualizarListaAgendamentos();
        garagem.exibirInformacoes('meuCarro');
    } else {
        console.log("Veículos carregados do localStorage. Atualizando UI completa.");
        garagem.atualizarUICompleta();
    }

    console.log("==== Tentando configurar listeners da API Detalhes Extras ====");
    const botoesDetalhesExtras = document.querySelectorAll('.btn-detalhes-extras');
    console.log(`==== Encontrados ${botoesDetalhesExtras.length} botões com classe .btn-detalhes-extras ====`);
    botoesDetalhesExtras.forEach(botao => {
        botao.addEventListener('click', async (event) => {
            const veiculoId = event.target.dataset.veiculoId;
            if (veiculoId) {
                await garagem.mostrarDetalhesExtras(veiculoId);
            } else {
                console.error("Botão clicado não possui o atributo 'data-veiculo-id'.");
            }
        });
    });
    console.log("==== Listeners da API Detalhes Extras configurados ====");

    // === Configuração do Planejador de Viagem (Previsão do Tempo) ===
    console.log("==== Configurando listener do Planejador de Viagem ====");
    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    const destinoInput = document.getElementById('destino-viagem');
    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');

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
                if (typeof fetchWeatherData !== 'function') { // Verificando o nome correto da função
                    const errorMsg = 'Erro interno: Função de busca de previsão (fetchWeatherData) não disponível. Verifique se weatherService.js está carregado corretamente antes de main.js.';
                    console.error(errorMsg);
                    previsaoResultadoDiv.innerHTML = `<p class="error">${errorMsg}</p>`;
                    return;
                }

                const previsao = await fetchWeatherData(nomeCidade); // CHAMANDO A FUNÇÃO CORRETA

                // Agora, 'previsao' é o objeto formatado diretamente por fetchWeatherData
                const iconUrl = `https://openweathermap.org/img/wn/${previsao.icone}@2x.png`;
                previsaoResultadoDiv.innerHTML = `
                    <h3>Clima em ${previsao.cidadeNome}, ${previsao.pais}</h3>
                    <img src="${iconUrl}" alt="Ícone do clima: ${previsao.descricao}" class="weather-icon">
                    <p><strong>Temperatura:</strong> ${previsao.temperatura.toFixed(1)} °C</p>
                    <p><strong>Sensação Térmica:</strong> ${previsao.sensacao.toFixed(1)} °C</p>
                    <p><strong>Condição:</strong> <span style="text-transform: capitalize;">${previsao.descricao}</span></p>
                    <p><strong>Umidade:</strong> ${previsao.umidade}%</p>
                    <p><strong>Vento:</strong> ${previsao.ventoVelocidade.toFixed(1)} m/s</p>
                    <p><strong>Nuvens:</strong> ${previsao.nuvens}%</p>
                `;

            } catch (error) {
                console.error("Erro ao buscar ou exibir previsão do tempo:", error);
                previsaoResultadoDiv.innerHTML = `<p class="error">${error.message || 'Ocorreu um erro ao buscar a previsão. Tente novamente.'}</p>`;
            }
        });
        console.log("==== Listener do Planejador de Viagem configurado. ====");
    } else {
        console.error("Não foi possível encontrar os elementos HTML para o Planejador de Viagem (verificar-clima-btn, destino-viagem, ou previsao-tempo-resultado).");
    }

    garagem.verificarAgendamentosProximos();
    console.log("Inicialização completa.");
};