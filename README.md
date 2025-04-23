Garagem Interativa com Manutenção

Este é um projeto de simulação web interativa de uma garagem, desenvolvido com HTML, CSS e JavaScript puro (Vanilla JS). Ele permite criar e interagir com diferentes tipos de veículos, gerenciar o histórico de manutenções realizadas e agendar futuros serviços, persistindo todos os dados no navegador utilizando LocalStorage.

## Descrição Detalhada

Este projeto simula o gerenciamento de uma garagem pessoal, onde o usuário pode interagir com uma coleção de veículos e manter um registro de sua manutenção. A aplicação utiliza princípios de Orientação a Objetos em JavaScript para modelar diferentes tipos de veículos (Carro, Carro Esportivo, Caminhão, Moto) e registros de manutenção, com herança para compartilhar funcionalidades comuns.

A interface web intuitiva, construída com HTML e estilizada com CSS, oferece seções dedicadas a cada veículo. Nelas, é possível definir ou atualizar informações como modelo e cor, e executar ações específicas como ligar/desligar, acelerar, frear, pintar ou abastecer. Veículos especializados como o Carro Esportivo incluem ações de turbo e o Caminhão permite carregar e descarregar peso, impactando seu desempenho. Um painel de velocidade visual acompanha a aceleração e frenagem.

Além da interação com os veículos, o projeto incorpora um sistema de gerenciamento de manutenção. O usuário pode registrar serviços já realizados, detalhando data, tipo e custo, ou agendar manutenções futuras com data e hora específicas. Todos os dados dos veículos, incluindo seu estado atual (ligado/desligado, velocidade, combustível) e histórico/agendamentos de manutenção, são salvos automaticamente no LocalStorage do navegador, garantindo que as informações persistam entre as sessões. Uma seção dedicada exibe todos os agendamentos futuros e é possível visualizar o histórico completo (incluindo manutenções concluídas) de um veículo específico em uma área de detalhes.

## Funcionalidades

O projeto oferece as seguintes funcionalidades principais:

*   **Criação/Atualização de Veículos:** Definir ou atualizar o modelo e a cor dos veículos (Carro, Carro Esportivo, Moto) e, para o Caminhão, também a capacidade de carga.
*   **Interação com Veículos:**
    *   **Geral para todos:** Ligar, Desligar, Acelerar, Frear, Pintar (mudar cor), Abastecer (adicionar combustível).
    *   **Carro Esportivo:** Ativar e Desativar o Turbo (influencia aceleração e consumo).
    *   **Caminhão:** Carregar e Descarregar Carga (influencia aceleração e frenagem, respeitando a capacidade).
*   **Gerenciamento de Manutenção:**
    *   **Registrar Manutenção Concluída:** Adicionar um registro ao histórico informando data, tipo de serviço, custo e descrição (opcional).
    *   **Agendar Manutenção Futura:** Agendar um serviço informando data, hora (opcional), tipo e observações (opcional). A data do agendamento deve ser no futuro.
    *   **Visualizar Agendamentos Futuros:** Uma lista centralizada exibe todos os agendamentos futuros pendentes de todos os veículos, ordenados por data.
    *   **Visualizar Histórico Concluído:** Ao selecionar um veículo na área de exibição de informações, seu histórico completo de manutenções *concluídas* é exibido.
*   **Persistência de Dados:** Salvar e carregar o estado completo da garagem (veículos e manutenções) utilizando LocalStorage, mantendo as informações salvas mesmo após fechar o navegador (até que o LocalStorage seja limpo).
*   **Lembretes de Agendamento:** Ao carregar a página, a aplicação verifica se há agendamentos para hoje ou amanhã e exibe um alerta.
*   **Atualização Visual:** A interface reflete o estado atual dos veículos (Ligado/Desligado, Velocidade) e exibe animações simples durante aceleração e frenagem.

## Tecnologias Utilizadas

*   **HTML5:** Estrutura da página e elementos de interface.
*   **CSS3:** Estilização e layout da aplicação, incluindo algumas animações simples.
*   **JavaScript (Vanilla JS):** Lógica de negócio, interação com a UI, manipulação do DOM e persistência de dados.
*   **Orientação a Objetos (Classes):** Modelagem dos veículos e manutenções com herança e encapsulamento.
*   **LocalStorage API:** Armazenamento e recuperação dos dados da garagem diretamente no navegador do usuário.

## Como Rodar o Projeto

Este é um projeto front-end simples que não requer servidor web.

1.  **Clone o Repositório:**
    ```bash
    https://github.com/KamillaMariaR/carros-v2-09-04-2025
    ```
2.  **Navegue até a Pasta do Projeto:**
    ```bash
    cd carros-v2-09-04-2025
    ```
3.  **Abra o Arquivo `index.html`:**
    Simplesmente abra o arquivo `index.html` no seu navegador de preferência (Chrome, Firefox, Edge, etc.). Você pode fazer isso clicando duas vezes no arquivo ou usando o comando `open index.html` no terminal (em macOS/Linux) ou `start index.html` (em Windows).

A aplicação será carregada diretamente no navegador. Se houver dados salvos anteriormente no LocalStorage, eles serão carregados; caso contrário, veículos padrão serão criados.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:


Os arquivos JavaScript na pasta `js/` são carregados em uma ordem específica (`manutencao.js` -> `veiculo.js` -> subclasses -> `garagem.js` -> `main.js`) para garantir que as dependências e a herança entre as classes funcionem corretamente.

## Documentação

O código JavaScript possui comentários internos e utiliza a sintaxe [JSDoc](https://jsdoc.app/) para documentar classes, métodos e suas funcionalidades. Isso facilita a compreensão do código e a identificação dos parâmetros esperados e valores de retorno.

## Melhorias Futuras

Existem diversas possibilidades para expandir e aprimorar este projeto:

*   **Gerenciamento Dinâmico de Veículos:** Permitir que o usuário adicione ou remova veículos da garagem dinamicamente, em vez de usar apenas veículos pré-definidos.
*   **Novos Tipos de Veículos:** Adicionar outras classes de veículos com funcionalidades únicas (ônibus, bicicleta, barco, etc.).
*   **Funcionalidades de Manutenção Aprimoradas:**
    *   Calcular o custo total das manutenções por veículo ou geral.
    *   Opção para marcar um agendamento como "concluído" diretamente da lista de agendamentos.
    *   Sistema de lembretes mais robusto (notificações visuais na tela, não apenas `alert`).
    *   Possibilidade de editar ou excluir registros de manutenção e agendamentos.
*   **Interface do Usuário:**
    *   Melhorar a responsividade para diferentes tamanhos de tela.
    *   Adicionar mais feedback visual ou sonoro para ações dos veículos e manutenção.
    *   Uma interface mais organizada para a área de informações detalhadas.
*   **Sistemas de Veículo Mais Complexos:** Simular consumo de combustível mais realista com base na velocidade, carga (para caminhão) ou uso do turbo (para esportivo). Introduzir "quilometragem" para registrar a distância percorrida.
*   **Validações e Testes:** Implementar validações mais robustas nos inputs e adicionar testes unitários para as classes JavaScript.
*   **Exportação/Importação:** Permitir exportar/importar os dados da garagem (ex: para um arquivo JSON) para backup ou migração.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contribuições

Contribuições são bem-vindas! Se você encontrar um bug ou tiver uma ideia de melhoria, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Contato

Se você tiver dúvidas ou sugestões, pode abrir uma issue neste repositório ou entrar em contato através do meu perfil no GitHub: [KamillaMariaR](https://github.com/KamillaMariaR).
