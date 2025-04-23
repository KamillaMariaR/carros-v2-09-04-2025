// js/main.js

// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================
// Este script deve ser carregado DEPOIS de todas as classes (Manutencao, Veiculo, ..., Garagem)

// Cria a instância GLOBAL da Garagem
const garagem = new Garagem();

// Executa quando o HTML da página estiver completamente carregado
window.onload = () => {
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

    // Após carregar ou criar os veículos, verifica se há lembretes próximos
    garagem.verificarAgendamentosProximos();
};