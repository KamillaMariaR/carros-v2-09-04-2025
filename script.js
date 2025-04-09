// script.js (v7 - Organizado e Comentado)

// =============================================================================
// === CLASSE Manutencao =======================================================
// =============================================================================

/**
 * Representa um registro de manutenção (passado ou agendado) para um veículo.
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string} data - Data da manutenção (formato "YYYY-MM-DD").
     * @param {string} tipo - Tipo de serviço.
     * @param {number | string | null} custo - Custo (null/NaN/negativo se agendada, número >= 0 se concluída).
     * @param {string} [descricao=''] - Descrição opcional.
     * @param {string | null} [hora=null] - Hora da manutenção (formato "HH:MM").
     * @param {string} [status='concluida'] - Status ('concluida' ou 'agendada').
     */
    constructor(data, tipo, custo, descricao = '', hora = null, status = 'concluida') {
        this.data = data || '';
        this.tipo = tipo ? tipo.trim() : '';
        const custoNum = parseFloat(custo);
        this.custo = (status === 'agendada' || custo === null || isNaN(custoNum) || custoNum < 0) ? null : custoNum;
        this.descricao = descricao ? descricao.trim() : '';
        this.hora = (hora && /^\d{2}:\d{2}$/.test(hora)) ? hora : null; // Armazena null se inválida
        this.status = (status === 'agendada') ? 'agendada' : 'concluida';
    }

    /**
     * Retorna um objeto Date representando a data/hora da manutenção.
     * Retorna null se a data ou hora forem inválidas ou inconsistentes.
     * @returns {Date | null}
     */
    getDateTime() {
        if (!this.data || !/^\d{4}-\d{2}-\d{2}$/.test(this.data)) return null;

        let dateString = this.data + "T" + (this.hora || "00:00") + ":00"; // Usa hora ou meia-noite

        try {
            const dt = new Date(dateString);

            // Checagem primária de validade do objeto Date
            if (isNaN(dt.getTime())) {
                // console.warn(`Data/hora resultou em Date inválido: ${dateString}`);
                return null;
            }

            // Validação extra de consistência (evita 31/02 virar 03/03, etc.)
            const [year, month, day] = this.data.split('-').map(Number);
            if (dt.getFullYear() !== year || dt.getMonth() + 1 !== month || dt.getDate() !== day) {
                // console.warn(`Inconsistência lógica na data: ${this.data}`);
                return null;
            }

            // Valida hora se foi fornecida e era sintaticamente válida
            if (this.hora) {
                const [hour, minute] = this.hora.split(':').map(Number);
                if (dt.getHours() !== hour || dt.getMinutes() !== minute) {
                   // console.warn(`Inconsistência lógica na hora: ${this.hora}`);
                   return null;
                }
            }
            return dt; // Data/hora válida e consistente
        } catch (e) {
            console.error("Erro crítico ao parsear data/hora:", dateString, e);
            return null;
        }
    }

    /**
     * Retorna uma string formatada do registro de manutenção para exibição.
     * @returns {string} Informação formatada.
     */
    formatar() {
        if (!this.tipo) return "(Tipo não informado)";

        let dataFormatada = this.data || "Data inválida"; // Fallback para data original
        const dateObj = this.getDateTime();
        if (dateObj) {
            dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        let info = '';
        if (this.status === 'agendada') {
            info = `Agendado: ${this.tipo} em ${dataFormatada}`;
            if (this.hora) info += ` às ${this.hora}`;
            if (this.descricao) info += ` (Obs: ${this.descricao})`;
        } else { // concluida
            const custoFormatado = (this.custo !== null)
                ? this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'Custo N/A'; // Custo Não Aplicável ou Não Informado
            info = `- ${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
            if (this.descricao) info += ` (${this.descricao})`;
        }
        return info;
    }

    /**
     * Valida os dados da manutenção.
     * Verifica formato, obrigatoriedade e regras de negócio (data futura, custo >= 0).
     * @returns {string[]} Array de mensagens de erro. Vazio se válido.
     */
    validar() {
        const erros = [];
        const dataValida = this.getDateTime(); // Valida data e hora juntas

        if (!dataValida) {
            // Tenta dar um erro mais específico baseado no que falhou
            if (!this.data || !/^\d{4}-\d{2}-\d{2}$/.test(this.data)) {
                erros.push('Formato da data inválido (AAAA-MM-DD).');
            } else if (this.hora !== null && !/^\d{2}:\d{2}$/.test(this.hora)) {
                 // Só valida formato da hora se ela existir (não for null)
                erros.push('Formato da hora inválido (HH:MM).');
            } else {
                 // Se formatos estão ok, mas getDateTime falhou, é data/hora logicamente inválida
                erros.push('Data ou hora inválida (ex: 31/02, 25:00).');
            }
        }

        if (!this.tipo) {
            erros.push('O tipo de serviço é obrigatório.');
        }

        if (this.status === 'concluida') {
            if (this.custo === null) { // Custo 0 é válido
                erros.push('Para manutenção concluída, o custo é obrigatório (pode ser 0).');
            } else if (typeof this.custo !== 'number' || this.custo < 0) {
                erros.push('Custo deve ser um número maior ou igual a zero.');
            }
        }

        // Validação de data futura apenas para agendamentos e se a data for válida
        if (this.status === 'agendada' && dataValida) {
            const agora = new Date();
            agora.setSeconds(0, 0); // Compara sem segundos/ms
            if (dataValida < agora) {
                erros.push('A data/hora do agendamento deve ser no futuro.');
            }
        }
        return erros;
    }
}


// =============================================================================
// === CLASSE BASE Veiculo =====================================================
// =============================================================================

/**
 * Classe base para todos os veículos da garagem.
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     */
    constructor(modelo, cor) {
        this.modelo = modelo || "Não definido";
        this.cor = cor || "Não definida";
        this.combustivel = 100; // Percentual
        this.historicoManutencao = []; // Array de instâncias de Manutencao
        this.nomeNaGaragem = null; // Identificador interno (ex: 'meuCarro')
    }

    // --- Ações Comuns ---

    /**
     * Pinta o veículo com uma nova cor.
     * @param {string} novaCor - A nova cor desejada.
     * @returns {boolean} True se a pintura foi bem-sucedida, false caso contrário.
     */
    pintar(novaCor) {
        if (novaCor && typeof novaCor === 'string' && novaCor.trim() !== '') {
            this.cor = novaCor.trim();
            if (this.atualizarDetalhes) this.atualizarDetalhes(); // Atualiza UI se método existir
            console.log(`Veículo ${this.nomeNaGaragem} pintado de ${this.cor}`);
            garagem.salvarGaragem(); // Persiste a mudança
            return true;
        } else {
            alert("Por favor, insira uma cor válida.");
            return false;
        }
    }

    /**
     * Adiciona um registro de manutenção JÁ VALIDADO ao histórico do veículo.
     * @param {Manutencao} manutencao - O objeto Manutencao validado.
     * @returns {boolean} True se adicionado com sucesso.
     */
    adicionarManutencaoValidada(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Tentativa de adicionar manutenção não validada ou de tipo incorreto.", manutencao);
            return false;
        }
        this.historicoManutencao.push(manutencao);
        console.log(`Manutenção (${manutencao.status}) adicionada para ${this.nomeNaGaragem}.`);
        garagem.atualizarDisplaysManutencao(this.nomeNaGaragem, this.modelo); // Atualiza UI (lista agendamentos, info veículo)
        garagem.salvarGaragem(); // Persiste a mudança
        alert(`Manutenção ${manutencao.status === 'agendada' ? 'agendada' : 'registrada'} com sucesso!`);
        return true;
    }

    // --- Exibição de Informações ---

    /**
     * Retorna uma string formatada com as informações básicas e o histórico CONCLUÍDO do veículo.
     * As subclasses devem chamar este método e adicionar suas informações específicas.
     * @returns {string} Informações formatadas.
     */
    exibirInformacoes() {
        let info = `Modelo: ${this.modelo}\nCor: ${this.cor}\nCombustível: ${this.combustivel}%`;

        // Filtra manutenções concluídas
        const concluidas = this.historicoManutencao.filter(m => m.status === 'concluida');

        // Delega a formatação do histórico para o helper da Garagem
        info += "\n\n--- Histórico de Manutenção Realizada ---";
        info += garagem._renderizarHistoricoConcluido(concluidas);

        return info;
    }

    // --- Métodos de Atualização de UI (Placeholders) ---
    // Estes métodos devem ser implementados ou sobrescritos pelas subclasses
    // para interagir com os elementos HTML específicos de cada tipo de veículo.

    /** Atualiza os detalhes visuais (modelo, cor) na UI. */
    atualizarDetalhes() { console.warn(`atualizarDetalhes não implementado para ${this.constructor.name}`); }
    /** Atualiza o status visual (Ligado/Desligado) e habilita/desabilita botões na UI. */
    atualizarStatus() { console.warn(`atualizarStatus não implementado para ${this.constructor.name}`); }
    /** Atualiza o display numérico de velocidade (km/h) na UI. */
    atualizarVelocidadeDisplay() { console.warn(`atualizarVelocidadeDisplay não implementado para ${this.constructor.name}`); }
    /** Atualiza a barra/ponteiro de velocidade na UI. */
    atualizarPonteiroVelocidade() { console.warn(`atualizarPonteiroVelocidade não implementado para ${this.constructor.name}`); }
    /** Atualiza áreas de informação específicas (Turbo, Carga) na UI. */
    atualizarInfoDisplay() { /* Pode ser vazio para veículos sem info extra */ }

    // --- Helpers Internos ---

    /**
     * Ativa uma animação CSS (aceleração ou freagem) no elemento correspondente.
     * @param {'aceleracao' | 'freagem'} tipoAnimacao - O tipo de animação.
     * @param {string} prefixoId - O prefixo do ID do elemento HTML (ex: 'carro', 'carroEsportivo').
     */
    ativarAnimacao(tipoAnimacao, prefixoId) {
        const elemento = document.getElementById(`animacao-${tipoAnimacao}-${prefixoId}`);
        if (elemento) {
            elemento.classList.add('ativa');
            // Remove a classe após a duração da animação CSS
            setTimeout(() => elemento.classList.remove('ativa'), 300);
        }
    }

    /**
     * Obtém o prefixo usado nos IDs principais dos elementos HTML deste veículo.
     * Ex: 'carro', 'carroEsportivo', 'caminhao', 'moto'.
     * @returns {string} O prefixo do ID.
     */
    obterPrefixoIdHtml() {
        // Mapeia o nome interno da garagem para o prefixo do ID HTML
        switch (this.nomeNaGaragem) {
            case 'meuCarro': return 'carro';
            case 'carroEsportivo': return 'carroEsportivo';
            case 'caminhao': return 'caminhao';
            case 'moto': return 'moto';
            default:
                console.error("Nome interno de veículo desconhecido:", this.nomeNaGaragem);
                return '';
        }
    }

    /**
     * Obtém o sufixo usado nos IDs dos elementos do *formulário de manutenção* deste veículo.
     * Ex: 'Carro', 'Esportivo', 'Caminhao', 'Moto'. (Note a capitalização)
     * @returns {string} O sufixo do ID do formulário.
     */
    obterIdHtmlSufixoFormulario() {
        // Mapeia o nome interno para o sufixo usado nos IDs dos inputs de manutenção
        switch (this.nomeNaGaragem) {
            case 'meuCarro': return 'Carro';
            case 'carroEsportivo': return 'Esportivo'; // Corrigido
            case 'caminhao': return 'Caminhao';
            case 'moto': return 'Moto';
            default:
                console.error("Nome interno de veículo desconhecido para sufixo de form:", this.nomeNaGaragem);
                return '';
        }
    }
}


// =============================================================================
// === CLASSE Carro (Herda de Veiculo) =========================================
// =============================================================================

class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 200;
    }

    // --- Ações Específicas ---

    ligar() {
        if (this.ligado) return;
        if (this.combustivel > 0) {
            this.ligado = true;
            this.atualizarStatus(); // Atualiza UI
            console.log(`${this.nomeNaGaragem} ligado!`);
            garagem.salvarGaragem();
        } else {
            alert("Sem combustível!");
        }
    }

    desligar() {
        if (!this.ligado) return;

        const estavaLigado = this.ligado;
        this.ligado = false; // Define como desligado imediatamente

        // Se estiver em movimento, freia automaticamente antes de desligar completamente
        if (this.velocidade > 0) {
            console.log(`${this.nomeNaGaragem} desligando... Freando automaticamente.`);
            const interval = setInterval(() => {
                this.frear(true); // Chama frear internamente (sem animação/salvar repetido)
                if (this.velocidade === 0) {
                    clearInterval(interval);
                    this.atualizarStatus(); // Atualiza UI final (botões, status)
                    this.atualizarVelocidadeDisplay();
                    this.atualizarPonteiroVelocidade();
                    console.log(`${this.nomeNaGaragem} parado e desligado.`);
                    garagem.salvarGaragem(); // Salva estado final
                }
            }, 100); // Intervalo da frenagem
        } else {
            // Se já estava parado, apenas atualiza a UI e salva se necessário
            this.atualizarStatus();
            this.atualizarVelocidadeDisplay();
            this.atualizarPonteiroVelocidade();
            console.log(`${this.nomeNaGaragem} desligado.`);
            if (estavaLigado) garagem.salvarGaragem(); // Salva só se realmente mudou de estado
        }
    }

    acelerar() {
        const prefixoId = this.obterPrefixoIdHtml();
        if (!this.ligado) {
            return alert(`Ligue o ${prefixoId === 'carro' ? 'carro' : prefixoId} primeiro!`);
        }
        if (this.combustivel <= 0) {
            this.desligar(); // Desliga se tentar acelerar sem combustível
            return alert("Sem combustível!");
        }
        if (this.velocidade >= this.velocidadeMaxima) {
            return; // Já está na velocidade máxima
        }

        // Aumenta velocidade e consome combustível
        this.velocidade = Math.min(this.velocidade + 10, this.velocidadeMaxima);
        this.combustivel = Math.max(this.combustivel - 5, 0);

        // Atualiza UI
        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        this.ativarAnimacao('aceleracao', prefixoId);
        console.log(`${this.nomeNaGaragem} acelerando! V:${this.velocidade}, C:${this.combustivel.toFixed(0)}%`);
        garagem.salvarGaragem(); // Salva estado

        // Verifica se acabou o combustível após acelerar
        if (this.combustivel <= 0) {
            console.log("Combustível acabou durante a aceleração!");
            this.desligar(); // Inicia processo de desligamento (que vai frear)
        }
    }

    /**
     * Freia o veículo.
     * @param {boolean} [interno=false] - Flag para indicar se a chamada é interna (ex: desligamento),
     *                                    para evitar animações ou salvamentos repetidos.
     */
    frear(interno = false) {
        const prefixoId = this.obterPrefixoIdHtml();
        // Encontra o botão de frear específico deste veículo
        const frearBtn = document.getElementById(`frear${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`);

        if (this.velocidade === 0) {
            if (frearBtn) frearBtn.disabled = true; // Garante que botão esteja desabilitado se parado
            return; // Não faz nada se já parado
        }

        // Diminui velocidade
        this.velocidade = Math.max(this.velocidade - 10, 0);

        // Atualiza UI
        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        if (frearBtn) frearBtn.disabled = (this.velocidade === 0); // Desabilita/Habilita botão

        // Ações apenas se chamado externamente (clique do usuário)
        if (!interno) {
            this.ativarAnimacao('freagem', prefixoId);
            console.log(`${this.nomeNaGaragem} freando! V:${this.velocidade}`);
            garagem.salvarGaragem(); // Salva estado
        }

        // Se parou E o carro está desligando (flag 'ligado' é false), atualiza status final
        if (this.velocidade === 0 && !this.ligado) {
            this.atualizarStatus();
        }
    }

    /**
     * Abastece o veículo.
     * @param {number} quantidade - Percentual de combustível a adicionar.
     * @returns {boolean} True se abastecido com sucesso, false se quantidade inválida.
     */
    abastecer(quantidade) {
        if (isNaN(quantidade) || quantidade < 0) {
             alert("Quantidade inválida. Use um número maior ou igual a 0.");
             return false;
        }
        const combustivelAntes = this.combustivel;
        this.combustivel = Math.min(this.combustivel + quantidade, 100); // Limita a 100%
        const adicionado = this.combustivel - combustivelAntes;

        alert(`${this.nomeNaGaragem} abastecido com ${adicionado.toFixed(0)}%. Nível atual: ${this.combustivel.toFixed(0)}%`);
        this.atualizarStatus(); // Habilita/Desabilita botões (ligar, turbo)
        this.atualizarInfoDisplay(); // Caso mostre combustível em outro lugar
        garagem.salvarGaragem(); // Salva novo nível de combustível
        return true;
    }

    // --- Métodos de Atualização de UI (Implementação) ---

    atualizarStatus() {
        const prefixoId = this.obterPrefixoIdHtml();
        const statusElem = document.getElementById(`${prefixoId}-status`);

        // IDs dos botões comuns (podem ter sufixo ou não)
        const ligarBtnId = `ligar${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const desligarBtnId = `desligar${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const acelerarBtnId = `acelerar${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const frearBtnId = `frear${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const pintarBtnId = `pintar${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const abastecerBtnId = `abastecer${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;

        // Busca os elementos
        const ligarBtn = document.getElementById(ligarBtnId);
        const desligarBtn = document.getElementById(desligarBtnId);
        const acelerarBtn = document.getElementById(acelerarBtnId);
        const frearBtn = document.getElementById(frearBtnId);
        const pintarBtn = document.getElementById(pintarBtnId);
        const abastecerBtn = document.getElementById(abastecerBtnId);

        // Atualiza texto e cor do status
        if (statusElem) {
            statusElem.textContent = this.ligado ? 'Ligado' : 'Desligado';
            statusElem.style.color = this.ligado ? 'green' : 'red';
        }

        // Habilita/Desabilita botões
        if (ligarBtn) ligarBtn.disabled = this.ligado;
        if (desligarBtn) desligarBtn.disabled = !this.ligado;
        if (acelerarBtn) acelerarBtn.disabled = !this.ligado;
        if (frearBtn) frearBtn.disabled = this.velocidade === 0; // Desabilita só se parado
        if (pintarBtn) pintarBtn.disabled = false; // Sempre habilitado
        if (abastecerBtn) abastecerBtn.disabled = false; // Sempre habilitado
    }

    atualizarVelocidadeDisplay() {
        const prefixoId = this.obterPrefixoIdHtml();
        const velElemId = `${prefixoId}-velocidade-valor`;
        // Tenta ID específico, se não achar (caso do carro base), usa ID genérico
        const velElem = document.getElementById(velElemId) || document.getElementById('velocidade-valor');
        if (velElem) {
            velElem.textContent = `${this.velocidade.toFixed(0)} km/h`;
        }
        // Garante que o botão de frear reflita o estado atual da velocidade
        const frearBtnId = `frear${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const frearBtn = document.getElementById(frearBtnId);
         if (frearBtn) {
             frearBtn.disabled = (this.velocidade === 0);
         }
    }

    atualizarPonteiroVelocidade() {
        const prefixoId = this.obterPrefixoIdHtml();
        const ponteiroId = `ponteiro${prefixoId === 'carro' ? '' : '-' + prefixoId}-velocidade`;
        const ponteiro = document.getElementById(ponteiroId);
        if (ponteiro) {
            const porcentagem = Math.min((this.velocidade / this.velocidadeMaxima) * 100, 100);
            ponteiro.style.width = `${porcentagem}%`;
        }
    }

    atualizarDetalhes() {
        const prefixoId = this.obterPrefixoIdHtml();
        // IDs dos spans de modelo e cor (ex: 'modelo', 'carroEsportivo-modelo')
        const modeloElemId = (prefixoId === 'carro') ? 'modelo' : `${prefixoId}-modelo`;
        const corElemId = (prefixoId === 'carro') ? 'cor' : `${prefixoId}-cor`;

        const modeloElem = document.getElementById(modeloElemId);
        const corElem = document.getElementById(corElemId);

        if (modeloElem) modeloElem.textContent = this.modelo;
        if (corElem) corElem.textContent = this.cor;
    }

    // atualizarInfoDisplay() é deixado vazio aqui, para ser sobrescrito se necessário.

    // --- Exibição de Informações ---

    /** Sobrescreve exibirInformacoes para adicionar Status e Velocidade */
    exibirInformacoes() {
        let baseInfo = super.exibirInformacoes(); // Pega Modelo, Cor, Combustível, Histórico
        return `${baseInfo}\nStatus: ${this.ligado ? 'Ligado' : 'Desligado'}\nVelocidade: ${this.velocidade.toFixed(0)} km/h`;
    }
}


// =============================================================================
// === CLASSE CarroEsportivo (Herda de Carro) ==================================
// =============================================================================

class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.velocidadeMaxima = 300; // Velocidade maior
    }

    // --- Ações Específicas ---

    ativarTurbo() {
        if (!this.ligado) return alert("Ligue o carro esportivo primeiro!");
        if (this.turboAtivado) return; // Já está ativado
        if (this.combustivel < 20) return alert("Combustível baixo demais para ativar o turbo!");

        this.turboAtivado = true;
        console.log('Turbo Ativado!');
        alert('Turbo Ativado!');
        this.atualizarInfoDisplay(); // Mostra na UI
        this.atualizarStatus(); // Habilita/Desabilita botões
        garagem.salvarGaragem();
    }

    desativarTurbo() {
        if (!this.turboAtivado) return; // Já está desativado

        this.turboAtivado = false;
        console.log('Turbo Desativado!');
        alert('Turbo Desativado!');
        this.atualizarInfoDisplay(); // Mostra na UI
        this.atualizarStatus(); // Habilita/Desabilita botões
        garagem.salvarGaragem();
    }

    // --- Ações Sobrescritas ---

    acelerar() { // Acelera mais, consome mais (especialmente com turbo)
        const prefixoId = this.obterPrefixoIdHtml();
        if (!this.ligado) return alert("Ligue o carro esportivo!");
        if (this.combustivel <= 0) { this.desligar(); return alert("Sem combustível!"); }
        if (this.velocidade >= this.velocidadeMaxima) return;

        const aumento = this.turboAtivado ? 50 : 20;
        const consumo = this.turboAtivado ? 15 : 10;

        this.velocidade = Math.min(this.velocidade + aumento, this.velocidadeMaxima);
        this.combustivel = Math.max(this.combustivel - consumo, 0);

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        this.ativarAnimacao('aceleracao', prefixoId);
        console.log(`Acelerando Esportivo (Turbo: ${this.turboAtivado})! V:${this.velocidade}, C:${this.combustivel.toFixed(0)}%`);
        garagem.salvarGaragem();

        if (this.combustivel <= 0) {
            console.log("Combustível acabou!");
            if (this.turboAtivado) this.desativarTurbo(); // Desativa turbo antes de desligar
            this.desligar();
        }
        // Atualiza status dos botões turbo (pode ter ficado sem comb pro turbo)
        this.atualizarStatus();
    }

    frear(interno = false) { // Freia mais forte
        const prefixoId = this.obterPrefixoIdHtml();
        const frearBtn = document.getElementById(`frear-${prefixoId}-btn`);
        if (this.velocidade === 0) { if (frearBtn) frearBtn.disabled = true; return; }

        this.velocidade = Math.max(this.velocidade - 20, 0); // Redução maior

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        if (frearBtn) frearBtn.disabled = (this.velocidade === 0);

        if (!interno) {
            this.ativarAnimacao('freagem', prefixoId);
            console.log(`Freando Esportivo! V:${this.velocidade}`);
            garagem.salvarGaragem();
        }
        if (this.velocidade === 0 && !this.ligado) {
            this.atualizarStatus();
        }
    }

    // --- UI Sobrescrita ---

    atualizarStatus() {
        super.atualizarStatus(); // Chama o atualizarStatus do Carro (botões comuns)
        const prefixoId = this.obterPrefixoIdHtml();

        // Encontra botões de turbo (assumindo que estão dentro do container de botões)
        const botoesContainer = document.getElementById(`botoes-${prefixoId}`);
        if (!botoesContainer) return;

        const turboOnBtn = botoesContainer.querySelector('button[onclick*="ativarTurbo"]');
        const turboOffBtn = botoesContainer.querySelector('button[onclick*="desativarTurbo"]');

        // Desabilita Ativar Turbo se: desligado, já ativo, ou combustível < 20
        if (turboOnBtn) turboOnBtn.disabled = !this.ligado || this.turboAtivado || this.combustivel < 20;
        // Desabilita Desativar Turbo se: desligado ou não ativo
        if (turboOffBtn) turboOffBtn.disabled = !this.ligado || !this.turboAtivado;
    }

    atualizarInfoDisplay() {
        const infoElem = document.getElementById('infoEsportivo');
        if (infoElem) {
            infoElem.textContent = `Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
        }
    }

    exibirInformacoes() {
        let baseInfo = super.exibirInformacoes(); // Pega infos do Carro (modelo, cor, comb, hist, status, vel)
        return `${baseInfo}\nTurbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
    }
}


// =============================================================================
// === CLASSE Caminhao (Herda de Carro) ========================================
// =============================================================================

class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        // Garante que capacidade seja um número positivo, ou usa default
        this.capacidadeCarga = (!isNaN(capacidadeCarga) && capacidadeCarga > 0) ? capacidadeCarga : 1000;
        this.cargaAtual = 0; // kg
        this.velocidadeMaxima = 120; // Mais lento
    }

    // --- Ações Específicas ---

    carregar(peso) {
        const pesoNumerico = parseInt(peso, 10);
        if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
             alert("Peso inválido para carregar. Use um número positivo.");
             return false;
        }
        if (this.cargaAtual + pesoNumerico > this.capacidadeCarga) {
             alert(`Carga excede a capacidade (${this.capacidadeCarga}kg)! Carga atual: ${this.cargaAtual}kg.`);
             return false;
        }

        this.cargaAtual += pesoNumerico;
        this.atualizarInfoDisplay(); // Atualiza exibição da carga
        console.log(`Caminhão carregado com ${pesoNumerico}kg. Carga atual: ${this.cargaAtual}kg`);
        alert(`Carga atual: ${this.cargaAtual}kg`);
        garagem.salvarGaragem();
        return true;
    }

    descarregar(peso) {
        const pesoNumerico = parseInt(peso, 10);
        if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
             alert("Peso inválido para descarregar. Use um número positivo.");
             return false;
        }
        if (pesoNumerico > this.cargaAtual) {
             alert(`Não é possível descarregar ${pesoNumerico}kg. Carga atual: ${this.cargaAtual}kg.`);
             return false;
        }

        this.cargaAtual -= pesoNumerico;
        this.atualizarInfoDisplay(); // Atualiza exibição da carga
        console.log(`Caminhão descarregado em ${pesoNumerico}kg. Carga atual: ${this.cargaAtual}kg`);
        alert(`Carga atual: ${this.cargaAtual}kg`);
        garagem.salvarGaragem();
        return true;
    }

    // --- Ações Sobrescritas ---

    acelerar() { // Aceleração e consumo dependem da carga
        const prefixoId = this.obterPrefixoIdHtml();
        if (!this.ligado) return alert("Ligue o caminhão!");
        if (this.combustivel <= 0) { this.desligar(); return alert("Sem combustível!"); }
        if (this.velocidade >= this.velocidadeMaxima) return;

        // Fator de carga: 1 (vazio) a ~0.5 (cheio) - afeta aceleração
        const fatorCargaAcel = 1 - (this.cargaAtual / (this.capacidadeCarga * 2));
        // Aumento: Menor quando mais pesado (mínimo 2)
        const aumento = Math.max(2, 8 * fatorCargaAcel);
        // Consumo: Maior quando mais pesado
        const consumo = 8 + (this.cargaAtual / this.capacidadeCarga) * 5;

        this.velocidade = Math.min(this.velocidade + aumento, this.velocidadeMaxima);
        this.combustivel = Math.max(this.combustivel - consumo, 0);

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        this.ativarAnimacao('aceleracao', prefixoId);
        console.log(`Acelerando Caminhão! V:${this.velocidade.toFixed(1)}, C:${this.combustivel.toFixed(1)}%, Carga:${this.cargaAtual}kg`);
        garagem.salvarGaragem();

        if (this.combustivel <= 0) {
            console.log("Combustível acabou!");
            this.desligar();
        }
    }

    frear(interno = false) { // Frenagem também depende da carga
        const prefixoId = this.obterPrefixoIdHtml();
        const frearBtn = document.getElementById(`frear-${prefixoId}-btn`);
        if (this.velocidade === 0) { if (frearBtn) frearBtn.disabled = true; return; }

        // Fator de carga: 1 (vazio) a 2 (cheio) - dificulta frear
        const fatorCargaFren = 1 + (this.cargaAtual / this.capacidadeCarga);
        // Redução: Menor quando mais pesado (mínimo 1)
        const reducao = Math.max(1, 10 / fatorCargaFren);

        this.velocidade = Math.max(this.velocidade - reducao, 0);

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        if (frearBtn) frearBtn.disabled = (this.velocidade === 0);

        if (!interno) {
            this.ativarAnimacao('freagem', prefixoId);
            console.log(`Freando Caminhão! V:${this.velocidade.toFixed(1)}`);
           garagem.salvarGaragem();
        }
         if (this.velocidade === 0 && !this.ligado) {
            this.atualizarStatus();
        }
    }

    // --- UI Sobrescrita ---

    atualizarStatus() {
        super.atualizarStatus(); // Atualiza botões comuns
        const prefixoId = this.obterPrefixoIdHtml();
        const botoesContainer = document.getElementById(`botoes-${prefixoId}`);
        if (!botoesContainer) return;

        // Habilita/Desabilita botão de descarregar
        const descarregarBtn = botoesContainer.querySelector('button[onclick*="descarregar"]');
        if (descarregarBtn) descarregarBtn.disabled = (this.cargaAtual === 0);

        // Mantém botão carregar sempre habilitado (poderia desabilitar se cheio)
        const carregarBtn = botoesContainer.querySelector('button[onclick*="carregar"]');
        if (carregarBtn) carregarBtn.disabled = false;
    }

    // atualizarDetalhes() não precisa mais mostrar carga aqui, vai para infoDisplay

    atualizarInfoDisplay() {
        const infoElem = document.getElementById('infoCaminhao');
        if (infoElem) {
            infoElem.textContent = `Carga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
        }
    }

    exibirInformacoes() {
        let baseInfo = super.exibirInformacoes(); // Pega infos do Carro
        return `${baseInfo}\nCarga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
    }
}


// =============================================================================
// === CLASSE Moto (Herda de Carro) ============================================
// =============================================================================

class Moto extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.velocidadeMaxima = 180; // Velocidade diferente
    }

    // --- Ações Sobrescritas (com pequenas variações) ---

    ligar() { // Pode ter log/som diferente
        if (this.ligado) return;
        if (this.combustivel > 0) {
            this.ligado = true;
            this.atualizarStatus();
            console.log("Moto ligada! Vrumm!");
            garagem.salvarGaragem();
        } else {
            alert("Sem combustível!");
        }
    }

    acelerar() { // Acelera mais rápido? Consome menos?
        const prefixoId = this.obterPrefixoIdHtml();
        if (!this.ligado) return alert("Ligue a moto!");
        if (this.combustivel <= 0) { this.desligar(); return alert("Sem combustível!"); }
        if (this.velocidade >= this.velocidadeMaxima) return;

        this.velocidade = Math.min(this.velocidade + 15, this.velocidadeMaxima); // Aumento maior
        this.combustivel = Math.max(this.combustivel - 4, 0); // Consumo menor?

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        this.ativarAnimacao('aceleracao', prefixoId);
        console.log(`Acelerando Moto! V:${this.velocidade}, C:${this.combustivel.toFixed(0)}%`);
        garagem.salvarGaragem();

        if (this.combustivel <= 0) {
            console.log("Combustível acabou!");
            this.desligar();
        }
    }

    frear(interno = false) { // Freia mais rápido?
        const prefixoId = this.obterPrefixoIdHtml();
        const frearBtn = document.getElementById(`frear-${prefixoId}-btn`);
        if (this.velocidade === 0) { if (frearBtn) frearBtn.disabled = true; return; }

        this.velocidade = Math.max(this.velocidade - 15, 0); // Redução maior

        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        if (frearBtn) frearBtn.disabled = (this.velocidade === 0);

        if (!interno) {
            this.ativarAnimacao('freagem', prefixoId);
            console.log(`Freando Moto! V:${this.velocidade}`);
           garagem.salvarGaragem();
        }
         if (this.velocidade === 0 && !this.ligado) {
            this.atualizarStatus();
        }
    }

    // --- UI Sobrescrita ---

    atualizarStatus() {
        super.atualizarStatus(); // Chama Carro
        // Muda texto específico para "Ligada"/"Desligada"
        const prefixoId = this.obterPrefixoIdHtml();
        const statusElem = document.getElementById(`${prefixoId}-status`);
        if (statusElem) {
            statusElem.textContent = this.ligado ? 'Ligada' : 'Desligada';
        }
    }

    atualizarInfoDisplay() {
        // Moto não tem info extra por padrão
        const infoElem = document.getElementById('infoMoto');
        if (infoElem) infoElem.textContent = '';
    }

    // exibirInformacoes() usa a implementação herdada de Carro.
}


// =============================================================================
// === CLASSE Garagem (Gerenciador Principal) ==================================
// =============================================================================

/**
 * Gerencia a coleção de veículos, a persistência e a interação com a UI.
 */
class Garagem {
    constructor() {
        this.veiculos = {}; // Objeto para armazenar instâncias: { nomeInterno: Veiculo }
        this.localStorageKey = 'dadosGaragemCompleta_v6'; // Chave para localStorage
        this.carregarGaragem(); // Tenta carregar dados ao inicializar
    }

    // --- Persistência (LocalStorage) ---

    /**
     * Converte uma instância de Manutencao em um objeto simples para JSON.
     * @param {Manutencao} manutencao - A instância a ser serializada.
     * @returns {object} Objeto simples com os dados.
     */
    _serializarManutencao(manutencao) {
        return {
            data: manutencao.data, tipo: manutencao.tipo, custo: manutencao.custo,
            descricao: manutencao.descricao, hora: manutencao.hora, status: manutencao.status
        };
    }

    /**
     * Converte um objeto simples (do JSON) em uma instância de Manutencao.
     * @param {object} data - Objeto com os dados lidos do JSON.
     * @returns {Manutencao | null} A instância criada ou null se os dados forem inválidos.
     */
    _deserializarManutencao(data) {
        if (!data || typeof data.data === 'undefined' || typeof data.tipo === 'undefined') {
            console.warn("Tentando deserializar dados de manutenção inválidos:", data);
            return null;
        }
        // Recria a instância usando o construtor
        return new Manutencao(data.data, data.tipo, data.custo, data.descricao, data.hora, data.status);
    }

    /** Salva o estado atual de todos os veículos no LocalStorage. */
    salvarGaragem() {
        const dadosParaSalvar = {};
        // Itera sobre os veículos na garagem
        for (const nomeVeiculo in this.veiculos) {
            const veiculo = this.veiculos[nomeVeiculo];
            // Monta um objeto simples com os dados do veículo
            dadosParaSalvar[nomeVeiculo] = {
                tipo: veiculo.constructor.name, // Salva o nome da classe (Carro, Moto, etc.)
                modelo: veiculo.modelo,
                cor: veiculo.cor,
                combustivel: veiculo.combustivel,
                ligado: veiculo.ligado,
                velocidade: veiculo.velocidade,
                velocidadeMaxima: veiculo.velocidadeMaxima,
                // Serializa o histórico de manutenção usando o helper
                historicoManutencao: veiculo.historicoManutencao.map(this._serializarManutencao),
                // Adiciona propriedades específicas de cada tipo, se existirem
                ...(veiculo instanceof CarroEsportivo && { turboAtivado: veiculo.turboAtivado }),
                ...(veiculo instanceof Caminhao && { capacidadeCarga: veiculo.capacidadeCarga, cargaAtual: veiculo.cargaAtual }),
            };
        }
        try {
            // Converte o objeto para JSON e salva no localStorage
            localStorage.setItem(this.localStorageKey, JSON.stringify(dadosParaSalvar));
            console.log(`Garagem salva (v${this.localStorageKey.split('_v')[1]}).`);
        } catch (error) {
            console.error("Erro ao salvar garagem:", error);
            // Informa o usuário em caso de erro de quota (limite de espaço)
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("Erro: Limite de armazenamento local excedido! Não foi possível salvar.");
            }
        }
    }

    /** Carrega o estado dos veículos do LocalStorage. */
    carregarGaragem() {
        const dadosSalvos = localStorage.getItem(this.localStorageKey);
        // Se não houver dados salvos, não faz nada
        if (!dadosSalvos) {
            console.log(`Nenhum dado salvo encontrado (key: ${this.localStorageKey}).`);
            return false;
        }

        try {
            // Parseia o JSON lido do localStorage
            const dadosParseados = JSON.parse(dadosSalvos);
            this.veiculos = {}; // Limpa a garagem atual antes de carregar

            // Itera sobre os dados de cada veículo salvo
            for (const nomeVeiculo in dadosParseados) {
                const d = dadosParseados[nomeVeiculo]; // Dados do veículo atual
                let veiculoInstancia = null;

                // Recria a instância da classe correta baseado no 'tipo' salvo
                switch (d.tipo) {
                    case 'Carro':           veiculoInstancia = new Carro(d.modelo, d.cor); break;
                    case 'CarroEsportivo':  veiculoInstancia = new CarroEsportivo(d.modelo, d.cor); break;
                    case 'Caminhao':        veiculoInstancia = new Caminhao(d.modelo, d.cor, d.capacidadeCarga); break;
                    case 'Moto':            veiculoInstancia = new Moto(d.modelo, d.cor); break;
                    default:
                        console.warn(`Tipo de veículo desconhecido "${d.tipo}" encontrado para ${nomeVeiculo}. Pulando.`);
                        continue; // Pula para o próximo veículo no loop
                }

                // Se a instância foi criada com sucesso, restaura suas propriedades
                if (veiculoInstancia) {
                    veiculoInstancia.combustivel = d.combustivel ?? 100; // Usa valor salvo ou 100%
                    veiculoInstancia.ligado = d.ligado || false;
                    veiculoInstancia.velocidade = d.velocidade || 0;
                    veiculoInstancia.velocidadeMaxima = d.velocidadeMaxima || veiculoInstancia.velocidadeMaxima; // Usa salva ou padrão da classe

                    // Restaura propriedades específicas
                    if (veiculoInstancia instanceof CarroEsportivo) veiculoInstancia.turboAtivado = d.turboAtivado || false;
                    if (veiculoInstancia instanceof Caminhao) veiculoInstancia.cargaAtual = d.cargaAtual || 0;

                    // Deserializa o histórico de manutenção usando o helper
                    if (Array.isArray(d.historicoManutencao)) {
                        veiculoInstancia.historicoManutencao = d.historicoManutencao
                            .map(this._deserializarManutencao) // Converte obj simples para instância Manutencao
                            .filter(m => m !== null); // Remove entradas que falharam na deserialização
                    } else {
                        veiculoInstancia.historicoManutencao = []; // Garante que seja um array
                    }

                    veiculoInstancia.nomeNaGaragem = nomeVeiculo; // Define o nome interno
                    this.veiculos[nomeVeiculo] = veiculoInstancia; // Adiciona à garagem
                }
            }
            console.log(`Garagem carregada (v${this.localStorageKey.split('_v')[1]}) com ${Object.keys(this.veiculos).length} veículo(s).`);
            return true; // Indica sucesso no carregamento

        } catch (error) {
            console.error(`Erro ao carregar/parsear garagem (v${this.localStorageKey.split('_v')[1]}):`, error);
            // Se houver erro no parse, remove os dados corrompidos e informa o usuário
            localStorage.removeItem(this.localStorageKey);
            alert("Erro ao carregar dados da garagem. Os dados podem estar corrompidos e foram removidos.");
            this.veiculos = {}; // Reseta a garagem
            return false; // Indica falha no carregamento
        }
    }

    // --- Helpers de Exibição de Manutenção ---

    /**
     * Formata um array de manutenções concluídas em uma string de histórico.
     * @param {Manutencao[]} historicoConcluido - Array de instâncias de Manutencao com status 'concluida'.
     * @returns {string} String formatada do histórico, ordenada por data (mais recente primeiro).
     */
    _renderizarHistoricoConcluido(historicoConcluido) {
        if (!historicoConcluido || historicoConcluido.length === 0) {
            return "\nNenhuma manutenção realizada registrada.";
        }
        // Ordena por data (mais recente primeiro), tratando datas inválidas
        historicoConcluido.sort((a, b) => (b.getDateTime()?.getTime() || 0) - (a.getDateTime()?.getTime() || 0));
        // Formata cada item usando o método formatar da Manutencao
        return historicoConcluido
            .map(m => `\n${m.formatar()}`)
            .join('');
    }

    /**
     * Popula o elemento UL da lista de agendamentos no HTML com os itens fornecidos.
     * @param {HTMLElement} listaElement - O elemento `<ul>` onde a lista será renderizada.
     * @param {object[]} agendamentosOrdenados - Array de objetos {veiculoNome, manutencao, dataObj} já ordenado.
     */
    _renderizarListaAgendamentos(listaElement, agendamentosOrdenados) {
        listaElement.innerHTML = ''; // Limpa a lista atual no HTML
        if (agendamentosOrdenados.length === 0) {
            listaElement.innerHTML = '<li class="nenhum">Nenhum agendamento futuro encontrado.</li>';
        } else {
            // Cria um item `<li>` para cada agendamento
            agendamentosOrdenados.forEach(item => {
                const li = document.createElement('li');
                // Formato: [Modelo Veículo] Agendado: Tipo em DD/MM/AAAA às HH:MM (Obs: ...)
                li.textContent = `[${item.veiculoNome}] ${item.manutencao.formatar()}`; // Usa formatar da Manutencao
                listaElement.appendChild(li);
            });
        }
    }

    // --- Atualização da UI ---

    /**
     * Atualiza a área de informações do veículo exibido e a lista geral de agendamentos.
     * Chamado após adicionar/registrar uma manutenção.
     * @param {string} nomeVeiculoAtualizado - O nome interno do veículo que teve a manutenção adicionada.
     * @param {string} modeloVeiculoAtualizado - O modelo do veículo.
     */
    atualizarDisplaysManutencao(nomeVeiculoAtualizado, modeloVeiculoAtualizado) {
        const infoArea = document.getElementById('informacoesVeiculo');
        // Se a área de info estiver mostrando o veículo que foi atualizado, recarrega as infos dele
        if (infoArea && infoArea.textContent.includes(`Modelo: ${modeloVeiculoAtualizado}`)) {
            this.exibirInformacoes(nomeVeiculoAtualizado);
        }
        // Sempre atualiza a lista de agendamentos, pois pode ter mudado
        this.atualizarListaAgendamentos();
    }

    /** Atualiza *toda* a interface gráfica com base no estado atual dos veículos na garagem. */
    atualizarUICompleta() {
        console.log("Atualizando UI completa...");
        // Itera por todos os veículos carregados/criados
        for (const nomeVeiculo in this.veiculos) {
            const veiculo = this.veiculos[nomeVeiculo];
            // Chama os métodos de atualização da UI de cada veículo
            veiculo.atualizarDetalhes();
            veiculo.atualizarStatus();
            veiculo.atualizarVelocidadeDisplay();
            veiculo.atualizarPonteiroVelocidade();
            veiculo.atualizarInfoDisplay();
            // Preenche os inputs de criação (modelo, cor, capacidade) com os dados atuais
            this.preencherInputsVeiculo(nomeVeiculo, veiculo);
        }

        // Exibe informações do primeiro veículo ou uma mensagem padrão
        const primeiroNome = Object.keys(this.veiculos)[0];
        const infoArea = document.getElementById('informacoesVeiculo');
        if (primeiroNome && infoArea) {
            this.exibirInformacoes(primeiroNome);
        } else if (infoArea) {
            infoArea.textContent = "Nenhum veículo na garagem. Crie ou atualize um veículo acima.";
        }

        // Atualiza a lista de agendamentos futuros
        this.atualizarListaAgendamentos();
    }

    /** Preenche os inputs de Modelo/Cor/Capacidade com os dados atuais do veículo. */
    preencherInputsVeiculo(nome, veiculo) {
        // Determina o sufixo dos IDs dos inputs de criação
        const suffix = nome === 'meuCarro' ? 'Carro' :
                       nome === 'carroEsportivo' ? 'Esportivo' :
                       nome === 'caminhao' ? 'Caminhao' :
                       nome === 'moto' ? 'Moto' : null;
        if (!suffix) return; // Sai se o nome for desconhecido

        const modeloInput = document.getElementById(`modelo${suffix}`);
        const corInput = document.getElementById(`cor${suffix}`);

        // Preenche se o input existe e o valor não é o default "Não definido"
        if (modeloInput && veiculo.modelo !== "Não definido") modeloInput.value = veiculo.modelo;
        if (corInput && veiculo.cor !== "Não definida") corInput.value = veiculo.cor;

        // Preenche capacidade específica do caminhão
        if (nome === 'caminhao' && veiculo instanceof Caminhao) {
            const capacidadeInput = document.getElementById('capacidadeCarga');
            if (capacidadeInput && veiculo.capacidadeCarga) {
                capacidadeInput.value = veiculo.capacidadeCarga;
            }
        }
    }

    // --- Criação e Atualização de Veículos ---

    /**
     * Método interno para criar um novo veículo ou atualizar um existente.
     * @param {string} nomeInterno - O identificador ('meuCarro', 'carroEsportivo', etc.).
     * @param {Function} ClasseVeiculo - A classe a ser instanciada (Carro, Moto, etc.).
     * @param {string} modelo - Modelo do veículo.
     * @param {string} cor - Cor do veículo.
     * @param {any[]} [argsExtras=[]] - Argumentos adicionais para construtores específicos (ex: capacidade do caminhão).
     */
    _criarOuAtualizarVeiculo(nomeInterno, ClasseVeiculo, modelo, cor, argsExtras = []) {
        let veiculo = this.veiculos[nomeInterno];
        const ehNovo = !veiculo;

        if (ehNovo) {
            // Cria nova instância
            veiculo = new ClasseVeiculo(modelo, cor, ...argsExtras);
            veiculo.nomeNaGaragem = nomeInterno; // Define o nome interno
            this.veiculos[nomeInterno] = veiculo; // Adiciona à garagem
            console.log(`${ClasseVeiculo.name} "${modelo}" criado!`);
        } else {
            // Atualiza instância existente
            veiculo.modelo = modelo;
            veiculo.cor = cor;
            // Lógica específica para atualizar capacidade do caminhão
            if (ClasseVeiculo === Caminhao && argsExtras.length > 0) {
                const novaCapacidade = argsExtras[0];
                if (veiculo.capacidadeCarga !== novaCapacidade) {
                    veiculo.capacidadeCarga = novaCapacidade > 0 ? novaCapacidade : 1000; // Atualiza
                    // Ajusta carga atual se exceder a nova capacidade
                    if (veiculo.cargaAtual > veiculo.capacidadeCarga) {
                        veiculo.cargaAtual = veiculo.capacidadeCarga;
                    }
                    console.log(`Capacidade do caminhão ${veiculo.modelo} atualizada para ${veiculo.capacidadeCarga}kg.`);
                }
            }
            console.log(`${ClasseVeiculo.name} "${veiculo.modelo}" atualizado.`);
        }

        // Atualiza a UI para o veículo criado/atualizado
        veiculo.atualizarDetalhes();
        veiculo.atualizarStatus();
        veiculo.atualizarVelocidadeDisplay();
        veiculo.atualizarPonteiroVelocidade();
        veiculo.atualizarInfoDisplay();

        // Se for novo, mostra as informações dele na área principal
        if (ehNovo) {
            this.exibirInformacoes(nomeInterno);
        }
        this.salvarGaragem(); // Salva o estado da garagem
    }

    // Métodos públicos chamados pelos botões "Criar/Atualizar"
    criarCarro() { const m = document.getElementById('modeloCarro').value.trim() || "Civic"; const c = document.getElementById('corCarro').value.trim() || "Branco"; this._criarOuAtualizarVeiculo('meuCarro', Carro, m, c); }
    criarCarroEsportivo() { const m = document.getElementById('modeloEsportivo').value.trim() || "Pagani"; const c = document.getElementById('corEsportivo').value.trim() || "Rosa"; this._criarOuAtualizarVeiculo('carroEsportivo', CarroEsportivo, m, c); }
    criarCaminhao() { const m = document.getElementById('modeloCaminhao').value.trim() || "Actros"; const c = document.getElementById('corCaminhao').value.trim() || "Cinza"; const cap = parseInt(document.getElementById('capacidadeCarga').value, 10) || 5000; this._criarOuAtualizarVeiculo('caminhao', Caminhao, m, c, [cap]); }
    criarMoto() { const m = document.getElementById('modeloMoto').value.trim() || "Ninja"; const c = document.getElementById('corMoto').value.trim() || "Preta/Rosa"; this._criarOuAtualizarVeiculo('moto', Moto, m, c); }

    // --- Interação com Veículos ---

    /**
     * Executa uma ação em um veículo específico.
     * @param {string} nomeVeiculo - O identificador interno do veículo.
     * @param {string} acao - A ação a ser executada ('ligar', 'acelerar', 'carregar', etc.).
     */
    interagirComVeiculo(nomeVeiculo, acao) {
        const veiculo = this.veiculos[nomeVeiculo];
        // Verifica se o veículo existe
        if (!veiculo) {
            alert(`Veículo "${nomeVeiculo}" ainda não existe. Crie ou atualize primeiro.`);
            // Tenta focar no botão de criação correspondente
            try {
                let btnSelector = `button[onclick*="criar${nomeVeiculo.replace('meuC', 'C')}"]`;
                document.querySelector(btnSelector)?.focus();
            } catch (e) { /* Ignora erro se não achar o botão */ }
            return;
        }

        try {
            let sucessoAcao = true; // Flag para ações que podem falhar (carregar/descarregar)
            // Executa a ação correspondente no objeto veículo
            switch (acao) {
                case 'ligar':           veiculo.ligar(); break;
                case 'desligar':        veiculo.desligar(); break;
                case 'acelerar':        veiculo.acelerar(); break;
                case 'frear':           veiculo.frear(); break;
                // Ações específicas de tipos
                case 'ativarTurbo':     if (veiculo instanceof CarroEsportivo) veiculo.ativarTurbo(); else alert("Ação inválida para este veículo."); break;
                case 'desativarTurbo':  if (veiculo instanceof CarroEsportivo) veiculo.desativarTurbo(); else alert("Ação inválida para este veículo."); break;
                case 'carregar':
                    const pesoCarregarInput = document.getElementById('pesoCarga');
                    if (veiculo instanceof Caminhao && pesoCarregarInput) {
                        sucessoAcao = veiculo.carregar(pesoCarregarInput.value);
                        if (sucessoAcao) pesoCarregarInput.value = ''; // Limpa input se sucesso
                    } else { alert("Ação inválida ou input não encontrado."); }
                    break;
                case 'descarregar':
                    const pesoDescargaInput = document.getElementById('pesoDescarga');
                    if (veiculo instanceof Caminhao && pesoDescargaInput) {
                        sucessoAcao = veiculo.descarregar(pesoDescargaInput.value);
                        if (sucessoAcao) pesoDescargaInput.value = ''; // Limpa input se sucesso
                    } else { alert("Ação inválida ou input não encontrado."); }
                    break;
                default:
                    alert("Ação desconhecida: " + acao);
                    break;
            }

            // Atualiza a área de informações principal SE este veículo estiver sendo exibido
            const infoArea = document.getElementById('informacoesVeiculo');
            if (infoArea && infoArea.textContent.includes(`Modelo: ${veiculo.modelo}`)) {
                this.exibirInformacoes(nomeVeiculo);
            }
            // Nota: salvarGaragem() é chamado DENTRO dos métodos do veículo que alteram estado.

        } catch (error) {
            console.error(`Erro ao interagir (${acao}) com ${nomeVeiculo}:`, error);
            alert(`Ocorreu um erro durante a ação "${acao}".`);
        }
    }

    /** Pinta um veículo usando o valor do input de cor correspondente. */
    pintarVeiculo(nomeVeiculo) {
        const veiculo = this.veiculos[nomeVeiculo];
        if (!veiculo) return alert(`Veículo "${nomeVeiculo}" não existe.`);

        // Determina o sufixo do ID do input de pintura ('', 'Esportivo', 'Caminhao', 'Moto')
        const suffix = nomeVeiculo === 'meuCarro' ? '' :
                       nomeVeiculo === 'carroEsportivo' ? 'Esportivo' :
                       nomeVeiculo === 'caminhao' ? 'Caminhao' :
                       nomeVeiculo === 'moto' ? 'Moto' : null;

        if (suffix === null && nomeVeiculo !== 'meuCarro') return alert("Erro interno: Mapeamento de ID de pintura falhou.");

        const corInput = document.getElementById(`corPintura${suffix}`);
        if (corInput) {
            // Chama o método pintar do veículo, que já salva e atualiza detalhes
            const sucesso = veiculo.pintar(corInput.value);
            if (sucesso) {
                // Atualiza a área de info se o veículo pintado estiver sendo exibido
                const infoArea = document.getElementById('informacoesVeiculo');
                if (infoArea && infoArea.textContent.includes(`Modelo: ${veiculo.modelo}`)) {
                    this.exibirInformacoes(nomeVeiculo);
                }
                corInput.value = ''; // Limpa o input
            }
        } else {
             alert(`Erro interno: Input de pintura "corPintura${suffix}" não encontrado.`);
        }
    }

    /** Abastece um veículo usando o valor do input de combustível correspondente. */
    abastecerVeiculo(nomeVeiculo) {
        const veiculo = this.veiculos[nomeVeiculo];
        if (!veiculo) return alert(`Veículo "${nomeVeiculo}" não existe.`);

        // Determina o sufixo do ID do input de combustível
        const suffix = nomeVeiculo === 'meuCarro' ? '' :
                       nomeVeiculo === 'carroEsportivo' ? 'Esportivo' :
                       nomeVeiculo === 'caminhao' ? 'Caminhao' :
                       nomeVeiculo === 'moto' ? 'Moto' : null;

        if (suffix === null && nomeVeiculo !== 'meuCarro') return alert("Erro interno: Mapeamento de ID de combustível falhou.");

        const combustivelInput = document.getElementById(`combustivel${suffix}`);
        if (combustivelInput) {
            const quantidade = parseInt(combustivelInput.value, 10);
            // Chama o método abastecer do veículo, que valida, salva e alerta
            const sucesso = veiculo.abastecer(quantidade);
            if (sucesso) {
                // Atualiza a área de info se o veículo abastecido estiver sendo exibido
                const infoArea = document.getElementById('informacoesVeiculo');
                if (infoArea && infoArea.textContent.includes(`Modelo: ${veiculo.modelo}`)) {
                    this.exibirInformacoes(nomeVeiculo);
                }
                combustivelInput.value = ''; // Limpa o input
            }
            // O próprio método abastecer já alerta sobre quantidade inválida
        } else {
             alert(`Erro interno: Input de combustível "combustivel${suffix}" não encontrado.`);
        }
    }

    // --- Métodos de Manutenção ---

    /**
     * Registra uma manutenção concluída a partir dos dados do formulário.
     * Valida os dados antes de adicionar.
     * @param {string} nomeVeiculo - O identificador interno do veículo.
     */
    registrarManutencao(nomeVeiculo) {
        const veiculo = this.veiculos[nomeVeiculo];
        if (!veiculo) return alert(`Veículo "${nomeVeiculo}" não criado.`);

        const idSuffix = veiculo.obterIdHtmlSufixoFormulario(); // Ex: 'Carro', 'Esportivo'
        if (!idSuffix) return alert("Erro interno: Sufixo de ID do formulário não encontrado.");

        // Busca os elementos do formulário
        const dataInput = document.getElementById(`dataManutencao${idSuffix}`);
        const tipoInput = document.getElementById(`tipoManutencao${idSuffix}`);
        const custoInput = document.getElementById(`custoManutencao${idSuffix}`);
        const descInput = document.getElementById(`descManutencao${idSuffix}`);

        if (!dataInput || !tipoInput || !custoInput || !descInput) {
            return alert(`Erro interno: Campos de registro de manutenção (${idSuffix}) não encontrados no HTML.`);
        }

        // Cria uma instância de Manutencao com os dados do formulário para validação
        const manutencao = new Manutencao(
            dataInput.value,
            tipoInput.value,
            custoInput.value, // Construtor trata string/null
            descInput.value,
            null, // Hora não se aplica a concluída
            'concluida'
        );

        // Valida os dados usando o método da própria Manutencao
        const erros = manutencao.validar();
        if (erros.length > 0) {
            // Se houver erros, mostra alerta e não adiciona
            alert("Erro ao registrar manutenção:\n- " + erros.join("\n- "));
            return;
        }

        // Se os dados são válidos, adiciona ao veículo (método já salva e atualiza UI)
        if (veiculo.adicionarManutencaoValidada(manutencao)) {
            // Limpa o formulário após sucesso
            dataInput.value = '';
            tipoInput.value = '';
            custoInput.value = '';
            descInput.value = '';
        }
    }

    /**
     * Agenda uma manutenção futura a partir dos dados do formulário.
     * Valida os dados (incluindo data futura) antes de adicionar.
     * @param {string} nomeVeiculo - O identificador interno do veículo.
     */
    agendarManutencao(nomeVeiculo) {
        const veiculo = this.veiculos[nomeVeiculo];
        if (!veiculo) return alert(`Veículo "${nomeVeiculo}" não criado.`);

        const idSuffix = veiculo.obterIdHtmlSufixoFormulario(); // Ex: 'Carro', 'Esportivo'
         if (!idSuffix) return alert("Erro interno: Sufixo de ID do formulário não encontrado.");

        // Busca os elementos do formulário
        const dataInput = document.getElementById(`dataAgendamento${idSuffix}`);
        const horaInput = document.getElementById(`horaAgendamento${idSuffix}`);
        const tipoInput = document.getElementById(`tipoAgendamento${idSuffix}`);
        const obsInput = document.getElementById(`obsAgendamento${idSuffix}`);

        if (!dataInput || !horaInput || !tipoInput || !obsInput) {
            return alert(`Erro interno: Campos de agendamento (${idSuffix}) não encontrados no HTML.`);
        }

        // Cria instância de Manutencao com status 'agendada' para validação
        const agendamento = new Manutencao(
            dataInput.value,
            tipoInput.value,
            null, // Custo é sempre null para agendado
            obsInput.value,
            horaInput.value || null, // Passa hora ou null se vazia
            'agendada'
        );

        // Valida (inclui checagem de data futura)
        const erros = agendamento.validar();
        if (erros.length > 0) {
            alert("Erro ao agendar manutenção:\n- " + erros.join("\n- "));
            return;
        }

        // Adiciona se válido (método já salva e atualiza UI)
        if (veiculo.adicionarManutencaoValidada(agendamento)) {
            // Limpa formulário
            dataInput.value = '';
            horaInput.value = '';
            tipoInput.value = '';
            obsInput.value = '';
        }
    }

    // --- Atualização e Exibição da Lista de Agendamentos ---

    /** Coleta, ordena e renderiza a lista de agendamentos futuros na UI. */
    atualizarListaAgendamentos() {
        const listaElement = document.getElementById('listaAgendamentos');
        if (!listaElement) {
             console.error("Elemento 'listaAgendamentos' não encontrado no HTML.");
             return;
        }

        const agora = new Date();
        agora.setSeconds(0, 0); // Ignora segundos para comparação
        let todosAgendamentosFuturos = [];

        // 1. Coleta e Filtra dados de todos os veículos
        for (const nomeVeiculo in this.veiculos) {
            const veiculo = this.veiculos[nomeVeiculo];
            if (Array.isArray(veiculo.historicoManutencao)) {
                veiculo.historicoManutencao.forEach(manutencao => {
                    // Garante que temos uma instância (pode vir do localStorage como obj)
                     // const m = (manutencao instanceof Manutencao) ? manutencao : this._deserializarManutencao(manutencao); // Deserializar já faz isso
                     const m = manutencao; // Assumindo que carregarGaragem já criou instâncias corretas
                    if (!m) return; // Pula se deserialização falhou

                    const dataM = m.getDateTime();
                    // Filtra: status 'agendada', dados válidos (sem erros), data/hora no futuro
                    if (m.status === 'agendada' && m.validar().length === 0 && dataM && dataM >= agora) {
                        todosAgendamentosFuturos.push({
                            veiculoNome: veiculo.modelo, // Usa modelo para exibição
                            manutencao: m,
                            dataObj: dataM // Guarda objeto Date para ordenação
                        });
                    }
                });
            }
        }

        // 2. Ordena os agendamentos coletados pela data (mais próximo primeiro)
        todosAgendamentosFuturos.sort((a, b) => a.dataObj - b.dataObj);

        // 3. Renderiza a lista no HTML usando o helper
        this._renderizarListaAgendamentos(listaElement, todosAgendamentosFuturos);
    }

    // --- Exibição de Informações do Veículo Selecionado ---

    /** Exibe as informações completas (incluindo histórico concluído) de um veículo na área designada. */
    exibirInformacoes(nomeVeiculo) {
        const veiculo = this.veiculos[nomeVeiculo];
        const infoArea = document.getElementById('informacoesVeiculo');
        if (!infoArea) {
             console.error("Elemento 'informacoesVeiculo' não encontrado.");
             return;
        }

        if (veiculo) {
            try {
                // Chama o método exibirInformacoes do veículo, que por sua vez usa helpers
                infoArea.textContent = veiculo.exibirInformacoes();
             } catch (error) {
                 console.error(`Erro ao gerar informações para ${nomeVeiculo}:`, error);
                 infoArea.textContent = `Erro ao obter informações para ${veiculo.modelo || nomeVeiculo}.`;
            }
        } else {
            // Mensagem se o veículo solicitado não existe na garagem
            infoArea.textContent = `Veículo "${nomeVeiculo}" não existe na garagem.`;
        }
    }

    // --- Lembretes de Agendamento ---

    /** Verifica e exibe um alerta com agendamentos para hoje ou amanhã. */
    verificarAgendamentosProximos() {
        console.log("Verificando agendamentos próximos...");
        const agora = new Date();
        // Calcula início de hoje, amanhã e depois de amanhã para comparação de datas
        const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const amanhaInicio = new Date(hojeInicio.getTime() + 24 * 60 * 60 * 1000); // +1 dia
        const depoisDeAmanhaInicio = new Date(amanhaInicio.getTime() + 24 * 60 * 60 * 1000); // +2 dias

        const lembretes = []; // Array para guardar as mensagens de lembrete

        // Itera por todos os veículos e suas manutenções
        for (const nomeVeiculo in this.veiculos) {
            const veiculo = this.veiculos[nomeVeiculo];
            if (Array.isArray(veiculo.historicoManutencao)) {
                veiculo.historicoManutencao.forEach(manutencao => {
                    const m = manutencao; // Já deve ser instância
                    if (!m) return;

                    const dataM = m.getDateTime();
                    // Verifica se é agendada, válida e tem data válida
                    if (m.status === 'agendada' && m.validar().length === 0 && dataM) {
                        let quando = '';
                        // Verifica se a data/hora está entre agora e o início de amanhã
                        if (dataM >= agora && dataM < amanhaInicio) {
                            quando = "hoje";
                        }
                        // Verifica se a data/hora está entre o início de amanhã e o início de depois de amanhã
                        else if (dataM >= amanhaInicio && dataM < depoisDeAmanhaInicio) {
                            quando = "amanhã";
                        }

                        // Se for hoje ou amanhã, cria a mensagem de lembrete
                        if (quando) {
                            let horaFormatada = m.hora ? ` às ${m.hora}` : ''; // Adiciona hora se existir
                            lembretes.push(`- ${m.tipo} (${veiculo.modelo}) agendado para ${quando}${horaFormatada}.`);
                        }
                    }
                });
            }
        }

        // Se houver lembretes, mostra um alerta único
        if (lembretes.length > 0) {
            console.log("Lembretes encontrados:", lembretes);
            alert("🔔 Lembretes de Agendamento:\n\n" + lembretes.join("\n\n"));
        } else {
            // Se não houver, apenas loga no console
            console.log("Nenhum lembrete de agendamento para hoje ou amanhã.");
        }
    }
}


// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================

// Cria a instância da Garagem (o construtor já chama carregarGaragem)
const garagem = new Garagem();

// Executa quando o HTML da página estiver completamente carregado
window.onload = () => {
    // Verifica se a garagem foi carregada vazia (nenhum dado no localStorage)
    if (Object.keys(garagem.veiculos).length === 0) {
        console.log("Garagem vazia. Criando veículos padrão...");
        // Cria os veículos padrão (os métodos _criarOuAtualizarVeiculo já salvam e atualizam UI parcial)
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
        garagem.atualizarUICompleta();
    }

    // Após carregar ou criar os veículos, verifica se há lembretes próximos
    garagem.verificarAgendamentosProximos();
};