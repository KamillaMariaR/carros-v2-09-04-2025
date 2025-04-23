// js/garagem.js

/**
 * Gerencia a coleção de veículos, a persistência e a interação com a UI.
 * Depende: Manutencao, Carro, CarroEsportivo, Caminhao, Moto (devem ser carregados antes)
 */
class Garagem {
    constructor() {
        this.veiculos = {}; // Objeto para armazenar instâncias: { nomeInterno: Veiculo }
        this.localStorageKey = 'dadosGaragemCompleta_v6'; // Chave para localStorage
        // carregarGaragem() será chamado no main.js após instanciar
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