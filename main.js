
// js/main.js

// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================
// Este script deve ser carregado DEPOIS de todas as classes (Manutencao, Veiculo, ..., Garagem)

// Cria a instância GLOBAL da Garagem
const garagem = new Garagem();

// Executa quando o HTML da página estiver completamente carregado
window.onload = () => {
    console.log("window.onload disparado. Inicializando garagem..."); // Debug: Confirma que onload está rodando

    // Tenta carregar a garagem do localStorage
    const carregou = garagem.carregarGaragem();

    // Se não carregou (localStorage vazio ou erro), cria veículos padrão
    if (!carregou || Object.keys(garagem.veiculos).length === 0) {
        console.log("Garagem vazia ou não carregada. Criando veículos padrão...");
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
        // Após criar, atualiza a lista de agendamentos (que estará vazia) e mostra infos do 1º carro
        garagem.atualizarListaAgendamentos();
        garagem.exibirInformacoes('meuCarro');
    } else {
        // Se a garagem foi carregada com dados, atualiza toda a UI para refletir o estado carregado
        console.log("Veículos carregados do localStorage. Atualizando UI completa.");
        garagem.atualizarUICompleta(); // Este método já atualiza agendamentos e exibe info
    }

    console.log("==== Tentando configurar listeners da API ===="); // Debug: Início da configuração dos listeners

    // === Adiciona listeners para os botões de Detalhes Extras (API) ===
    // Seleciona todos os botões com a classe 'btn-detalhes-extras'
    const botoesDetalhesExtras = document.querySelectorAll('.btn-detalhes-extras');

    console.log(`==== Encontrados ${botoesDetalhesExtras.length} botões com classe .btn-detalhes-extras ====`); // Debug: Mostra quantos botões foram encontrados

    // Itera sobre cada botão encontrado e adiciona um ouvinte de evento de clique
    botoesDetalhesExtras.forEach(botao => {
        botao.addEventListener('click', async (event) => { // Adicionado 'async' aqui também por boa prática
            // Pega o ID do veículo do atributo 'data-veiculo-id' do botão
            const veiculoId = event.target.dataset.veiculoId;

            // console.log(`Botão Detalhes Extras clicado para: ${veiculoId}`); // Debug: Descomente se os console.log anteriores aparecerem mas este não
            
            // Verifica se o ID foi encontrado
            if (veiculoId) {
                 // console.log(`Chamando mostrarDetalhesExtras para: ${veiculoId}`); // Debug: Confirma a chamada
                // Chama o método da instância global 'garagem' para mostrar os detalhes
                await garagem.mostrarDetalhesExtras(veiculoId); // Usa await aqui porque mostrarDetalhesExtras é async
            } else {
                console.error("Botão clicado não possui o atributo 'data-veiculo-id'.");
            }
        });
    });

    console.log("==== Listeners da API configurados (ou tentou configurar) ===="); // Debug: Fim da configuração dos listeners


    // Após carregar ou criar os veículos, verifica se há lembretes próximos
    garagem.verificarAgendamentosProximos();

    console.log("Inicialização completa."); // Debug: Fim da execução de onload
};
