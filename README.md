# Garagem Interativa com Manutenção e Planejador de Viagem

Este é um projeto de simulação web interativa de uma garagem, desenvolvido com HTML, CSS e JavaScript puro (Vanilla JS). Ele permite criar e interagir com diferentes tipos de veículos, gerenciar o histórico de manutenções realizadas, agendar futuros serviços e até mesmo planejar viagens com uma previsão do tempo interativa. Todos os dados dos veículos e preferências de visualização são persistidos no navegador utilizando LocalStorage.

## Descrição Detalhada

Este projeto simula o gerenciamento de uma garagem pessoal, onde o usuário pode interagir com uma coleção de veículos, manter um registro de sua manutenção e utilizar um planejador de viagem integrado. A aplicação utiliza princípios de Orientação a Objetos em JavaScript para modelar diferentes tipos de veículos (Carro, Carro Esportivo, Caminhão, Moto) e registros de manutenção, com herança para compartilhar funcionalidades comuns.

A interface web intuitiva, construída com HTML e estilizada com CSS, oferece seções dedicadas a cada veículo. Nelas, é possível definir ou atualizar informações como modelo e cor, e executar ações específicas como ligar/desligar, acelerar, frear, pintar ou abastecer. Veículos especializados como o Carro Esportivo incluem ações de turbo e o Caminhão permite carregar e descarregar peso, impactando seu desempenho. Um painel de velocidade visual acompanha a aceleração e frenagem.

Além da interação com os veículos, o projeto incorpora um sistema de gerenciamento de manutenção. O usuário pode registrar serviços já realizados, detalhando data, tipo e custo, ou agendar manutenções futuras com data e hora específicas. Uma seção dedicada exibe todos os agendamentos futuros e é possível visualizar o histórico completo (incluindo manutenções concluídas) de um veículo específico em uma área de detalhes.

**Uma novidade significativa é o Planejador de Viagem**, que permite ao usuário verificar a previsão do tempo para uma cidade de destino. Esta funcionalidade é interativa, permitindo escolher o número de dias da previsão (1, 3 ou 5 dias), destacar condições climáticas específicas (chuva, temperaturas extremas) e alternar a unidade de temperatura entre Celsius e Fahrenheit. Ao clicar em um card de previsão diária, detalhes horários são expandidos.

Todos os dados dos veículos, seu estado atual (ligado/desligado, velocidade, combustível), histórico/agendamentos de manutenção, e as preferências do planejador de viagem (como unidade de temperatura) são salvos automaticamente no LocalStorage do navegador, garantindo que as informações persistam entre as sessões.

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
*   **Planejador de Viagem com Previsão do Tempo Interativa:**
    *   **Busca de Previsão:** Digitar o nome de uma cidade para obter a previsão do tempo.
    *   **Seleção de Período:** Escolher visualizar a previsão para 1, 3 ou 5 dias.
    *   **Expansão de Detalhes Diários:** Clicar em um card de previsão diária para expandir e ver uma previsão horária simplificada (hora, ícone, temperatura) para aquele dia.
    *   **Destaque de Condições:** Utilizar checkboxes para destacar visualmente nos cards diários:
        *   Dias com previsão de chuva.
        *   Dias com temperatura mínima abaixo de um valor configurável pelo usuário.
        *   Dias com temperatura máxima acima de um valor configurável pelo usuário.
    *   **Alternador de Unidade de Temperatura:** Um botão permite alternar a exibição das temperaturas entre Celsius (°C) e Fahrenheit (°F). A preferência é salva.
*   **API de Detalhes Extras:** Para cada veículo, um botão permite buscar e exibir informações adicionais (simuladas, como Valor FIPE, recalls, dicas de manutenção) que seriam tipicamente obtidas de uma API externa.
*   **Persistência de Dados:** Salvar e carregar o estado completo da garagem (veículos, manutenções) e preferências do usuário (unidade de temperatura) utilizando LocalStorage.
*   **Lembretes de Agendamento:** Ao carregar a página, a aplicação verifica se há agendamentos para hoje ou amanhã e exibe um alerta.
*   **Atualização Visual:** A interface reflete o estado atual dos veículos (Ligado/Desligado, Velocidade) e exibe animações simples durante aceleração e frenagem.

## Como Interagir com as Novas Funcionalidades da Previsão do Tempo

1.  **Buscar Previsão:**
    *   Vá até a seção "Planejar Viagem (Previsão do Tempo)".
    *   Digite o nome da cidade desejada no campo "Digite a cidade de destino".
    *   Use os botões de rádio ("Ver para:") para selecionar se deseja a previsão para "1 dia", "3 dias" ou "5 dias".
    *   Clique no botão "Verificar Clima".
2.  **Alternar Unidade de Temperatura:**
    *   Acima do campo de busca da cidade, você encontrará um botão (ex: "Mudar para °F"). Clique nele para alternar a exibição de todas as temperaturas entre Celsius e Fahrenheit. Sua escolha será lembrada.
3.  **Destaques Visuais:**
    *   Abaixo do formulário de busca, na seção "Destaques Visuais":
        *   Marque "Destacar Chuva" para que dias com chuva na previsão recebam um destaque visual.
        *   Marque "Temp. Abaixo de:" e ajuste o valor em °C no campo numérico para destacar dias com temperaturas mínimas iguais ou inferiores a esse valor.
        *   Marque "Temp. Acima de:" e ajuste o valor em °C no campo numérico para destacar dias com temperaturas máximas iguais ou superiores a esse valor.
    *   Após configurar os destaques, clique em "Verificar Clima" para que a nova previsão reflita essas escolhas. Os destaques são aplicados no momento da renderização.
4.  **Expandir Detalhes Diários:**
    *   Após a previsão ser exibida, cada card de dia mostrará "(clique)" ou similar no título.
    *   Clique em qualquer card de previsão diária. Uma seção com a previsão horária simplificada (hora, ícone, temperatura) para aquele dia específico será exibida abaixo das informações principais do card.
    *   Clique novamente no mesmo card para recolher os detalhes horários.

## Tecnologias Utilizadas

*   **HTML5:** Estrutura da página e elementos de interface.
*   **CSS3:** Estilização e layout da aplicação, incluindo animações e destaques visuais.
*   **JavaScript (Vanilla JS):** Lógica de negócio, interação com a UI, manipulação do DOM, persistência de dados e consumo de API.
*   **Orientação a Objetos (Classes):** Modelagem dos veículos e manutenções.
*   **LocalStorage API:** Armazenamento de dados e preferências no navegador.
*   **OpenWeatherMap API:** Utilizada para buscar dados de previsão do tempo.
    *   **ATENÇÃO:** A chave da API (API Key) está diretamente no código JavaScript (`js/weatherService.js`) para fins didáticos neste projeto. **Em um ambiente de produção, NUNCA exponha sua API Key no código frontend.** Ela deve ser gerenciada por um backend seguro que atue como proxy para as requisições à API. O uso indevido de uma API Key exposta pode levar a custos inesperados ou bloqueio da chave.

## Como Rodar o Projeto

Este é um projeto front-end simples.

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/KamillaMariaR/carros-v2-09-04-2025.git
    ```
2.  **Navegue até a Pasta do Projeto:**
    ```bash
    cd carros-v2-09-04-2025 
    ```
3.  **Abra o Arquivo `index.html`:**
    Abra o arquivo `index.html` no seu navegador.

Se você não tiver uma chave válida da OpenWeatherMap configurada em `js/weatherService.js` (na constante `OPENWEATHER_API_KEY`), a funcionalidade de previsão do tempo não funcionará. Obtenha uma chave gratuita em [OpenWeatherMap](https://openweathermap.org/appid).

## Estrutura do Projeto

*   `index.html`: Arquivo principal da interface.
*   `style.css`: Folha de estilos.
*   `imagens/`: Contém as imagens dos veículos.
*   `js/`: Contém os arquivos JavaScript:
    *   `manutencao.js`: Classe `Manutencao`.
    *   `veiculo.js`: Classe base `Veiculo`.
    *   `carro.js`, `carroEsportivo.js`, `caminhao.js`, `moto.js`: Classes de veículos específicos, herdando de `Carro` ou `Veiculo`.
    *   `garagem.js`: Classe `Garagem` para gerenciar os veículos e a persistência.
    *   `weatherService.js`: Funções para interagir com a API OpenWeatherMap.
    *   `main.js`: Script principal que inicializa a aplicação, gerencia eventos da UI e a lógica da previsão do tempo.

Os arquivos JavaScript na pasta `js/` são carregados em uma ordem específica para garantir que as dependências e a herança funcionem corretamente.

## Documentação e JSDoc

O código JavaScript possui comentários internos. As funções modificadas ou novas no `js/main.js` e `js/weatherService.js` foram atualizadas com JSDoc onde aplicável:

**`js/main.js`:**

*   `celsiusParaFahrenheit(celsius)`: Converte temperatura de Celsius para Fahrenheit.
*   `fahrenheitParaCelsius(fahrenheit)`: Converte temperatura de Fahrenheit para Celsius.
*   `formatarTemperatura(tempCelsius)`: Formata uma temperatura (originalmente em Celsius) para exibição na unidade atual selecionada pelo usuário (°C ou °F), com uma casa decimal.
*   `formatarTemperaturaInteira(tempCelsius)`: Similar a `formatarTemperatura`, mas formata como um inteiro.
*   `renderizarPrevisaoCompleta()`: Responsável por gerar e injetar o HTML da previsão do tempo no DOM, aplicando conversões de unidade e destaques visuais.

**`js/weatherService.js`:**

*   `fetchWeatherData(nomeCidade)`: (Existente, JSDoc relevante) Busca a previsão do tempo *atual* para uma cidade.
*   `fetchForecastData(nomeCidade, numDias)`: (Existente, JSDoc relevante) Busca a previsão do tempo para *múltiplos dias*, processando os dados brutos da API para fornecer um resumo diário e as entradas horárias.

## Melhorias Futuras

*   **Gerenciamento Dinâmico de Veículos:** Adicionar/remover veículos.
*   **Novos Tipos de Veículos.**
*   **Funcionalidades de Manutenção Aprimoradas:** Custo total, marcar agendamento como concluído, editar/excluir registros.
*   **Interface do Usuário:** Melhor responsividade, mais feedback visual.
*   **Validações e Testes.**
*   **Exportação/Importação de Dados.**
*   **Previsão do Tempo:**
    *   Permitir que os valores de destaque de temperatura também sejam alternados entre °C e °F.
    *   Opção para ver mais detalhes horários (vento, umidade) ao expandir um card.
    *   Gráficos de temperatura para a previsão diária ou horária.
    *   Busca de localização automática via Geolocation API.

## Licença

Este projeto está licenciado sob a Licença MIT.

## Contribuições

Contribuições são bem-vindas!

## Contato

[KamillaMariaR](https://github.com/KamillaMariaR)
