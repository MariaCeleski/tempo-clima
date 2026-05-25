# Temperatura Local

[![CI](https://github.com/MariaCeleski/tempo-clima/actions/workflows/ci.yml/badge.svg)](https://github.com/MariaCeleski/tempo-clima/actions/workflows/ci.yml) ![Performance](https://img.shields.io/badge/Performance-90%2B-brightgreen) ![Accessibility](https://img.shields.io/badge/Accessibility-90%2B-brightgreen) ![Best Practices](https://img.shields.io/badge/Best%20Practices-80%2B-green)

Aplicação de clima desenvolvida com React, TypeScript, Vite e Tailwind CSS. Permite consultar condições meteorológicas atuais, previsão estendida e qualidade do ar para qualquer cidade, com interface responsiva e suporte offline via PWA.

## Funcionalidades

- Busca de clima por nome de cidade, CEP ou geolocalização
- Busca por arrastar e soltar marcador no mapa
- Exibição do clima atual com temperatura, umidade, vento e mais
- Índice UV estimado com recomendação de proteção solar
- Informações de qualidade do ar com escala de 1 a 5
- Previsão do tempo para 5 dias com detalhes por hora
- Gráfico de temperatura com máximas e mínimas
- Alertas climáticos automáticos (calor, frio, vento, tempestade)
- Comparação entre duas cidades lado a lado
- Cidades favoritas com persistência local
- Botão de atualizar dados (refresh) com animação
- Indicador de última atualização ("Atualizado há X min")
- Exportar card de clima como imagem PNG
- Notificação automática de mudança de clima (polling 30min)
- Tema claro/escuro
- Internacionalização (Português, Espanhol e Inglês)
- Mapa interativo com marcador arrastável e tooltip detalhado
- Partículas animadas de acordo com a condição climática
- Relógio local da cidade pesquisada
- Histórico de buscas recentes
- Compartilhamento via WhatsApp, Telegram, X, Facebook, Email e clipboard
- Alternância de unidade entre Celsius e Fahrenheit
- Suporte a PWA para instalação e uso offline

## Tecnologias

### Core

- React 19
- TypeScript
- Vite
- Tailwind CSS

### Mapas

- Leaflet
- React-Leaflet

### Gráficos

- Recharts

### Internacionalização

- i18next
- react-i18next
- i18next-browser-languagedetector

### Utilitários

- html2canvas (exportar como imagem)

### Backend (API Proxy)

- Node.js
- Express
- express-rate-limit

### Ferramentas de Desenvolvimento

- Vitest
- Testing Library
- fast-check
- ESLint

## Pré-requisitos e Instalação

### Pré-requisitos

- Node.js >= 18
- npm

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/MariaCeleski/tempo-clima.git
cd tempo-clima
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto com a sua chave da API do OpenWeatherMap. Use o arquivo `.env.example` como referência:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e insira sua chave:

```text
VITE_API_KEY=sua_chave_openweathermap
```

> Para obter uma chave, registre-se gratuitamente em [OpenWeatherMap](https://openweathermap.org/api).

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento Vite
- `npm run build` — executa a compilação TypeScript e gera o build de produção
- `npm run preview` — serve o build de produção localmente para pré-visualização
- `npm run test` — executa a suíte de testes em modo de execução única
- `npm run test:watch` — executa os testes em modo watch para feedback contínuo durante o desenvolvimento
- `npm run lint` — executa o ESLint para verificação de qualidade do código

## Estrutura do Projeto

```text
src/
├── App.css
├── App.tsx
├── main.tsx
├── index.css
├── setup.test.ts
├── setupTests.ts
├── __tests__/                        # Testes de integração da aplicação
│   └── App.integration.test.tsx
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── components/
│   ├── CompareMode.tsx
│   ├── ErrorMessage.tsx
│   ├── ExportButton.tsx
│   ├── FavoriteCities.tsx
│   ├── ForecastCard.tsx
│   ├── LanguageSelector.tsx
│   ├── LastUpdated.tsx
│   ├── LoadingSpinner.tsx
│   ├── LocalClock.tsx
│   ├── SearchForm.tsx
│   ├── SearchHistory.tsx
│   ├── ShareButton.tsx
│   ├── SkeletonCard.tsx
│   ├── TemperatureChart.tsx
│   ├── ThemeToggle.tsx
│   ├── UnitToggle.tsx
│   ├── UVIndex.tsx
│   ├── WeatherAlerts.tsx
│   ├── WeatherCard.tsx
│   ├── WeatherMap.tsx
│   ├── WeatherNotification.tsx
│   ├── WeatherParticles.tsx
│   └── __tests__/                    # Testes unitários e de propriedade dos componentes
│       ├── WeatherCard.property.test.tsx
│       └── components.test.tsx
├── services/
│   ├── weatherApi.ts                 # Serviço de comunicação com a API OpenWeatherMap
│   └── __tests__/                    # Testes de propriedade do serviço de API
│       └── weatherApi.property.test.ts
└── types/
    └── weather.ts                    # Definições de tipos TypeScript para dados meteorológicos
```

## Funcionalidades em Detalhe

### Busca de Cidade

A aplicação oferece três modos de busca:

- **Nome da cidade** — o usuário digita o nome de uma cidade e recebe os dados meteorológicos correspondentes.
- **CEP (código postal brasileiro)** — aceita CEPs no formato `XXXXX-XXX` ou `XXXXXXXX`, com validação de formato antes de realizar a consulta. O CEP é convertido em nome de cidade via API ViaCEP.
- **Geolocalização do navegador** — utiliza a API de geolocalização do browser para detectar automaticamente a posição do usuário e buscar o clima da localidade mais próxima.

### Exibição do Clima

Ao localizar uma cidade, o painel principal exibe os seguintes dados:

- Temperatura atual (°C ou °F)
- Sensação térmica
- Umidade relativa do ar (%)
- Velocidade do vento (m/s)
- Descrição da condição climática (ex.: céu limpo, chuva leve)
- Horários de nascer e pôr do sol
- Relógio local da cidade pesquisada, atualizado em tempo real

### Qualidade do Ar

O índice de qualidade do ar é apresentado em uma escala numérica de 1 a 5, com categorias rotuladas:

| Valor | Categoria  |
|-------|------------|
| 1     | Boa        |
| 2     | Razoável   |
| 3     | Moderada   |
| 4     | Ruim       |
| 5     | Muito Ruim |

Uma barra visual indica o nível atual com cores correspondentes a cada faixa.

### Previsão de 5 Dias

A previsão estendida agrupa os dados por dia, exibindo temperatura máxima, mínima e condição predominante. Cada dia possui um botão expansível que revela os detalhes por período (hora a hora), incluindo temperatura, umidade, vento e descrição. A navegação entre dias é paginada, com 3 dias por página e indicadores de página na parte inferior.

### Mapa Interativo

Um mapa interativo renderizado com Leaflet e React-Leaflet exibe a localização da cidade pesquisada. Um marcador é posicionado nas coordenadas retornadas pela API, e ao clicar no marcador um popup exibe o nome da cidade e a temperatura atual. O mapa utiliza tiles escuros (CARTO Dark) e atualiza a visualização com animação ao trocar de cidade.

### Partículas Animadas

O fundo da aplicação exibe partículas animadas que refletem a condição climática atual. As condições suportadas são:

- ☀️ Sol — brilho pulsante e raios de luz
- 🌧️ Chuva — gotas caindo com velocidades variadas
- ❄️ Neve — flocos descendo suavemente
- ⛈️ Trovoada — gotas de chuva combinadas com flashes de relâmpago
- 🌫️ Neblina — camadas translúcidas em movimento horizontal
- ☁️ Nuvens — formas difusas flutuando lentamente

### Alternância de Unidade

Um botão de alternância permite trocar entre Celsius (°C) e Fahrenheit (°F). A conversão é aplicada a todos os valores de temperatura exibidos na interface, incluindo clima atual, sensação térmica e previsão estendida.

### Histórico de Buscas

As cidades pesquisadas são armazenadas em localStorage, mantendo no máximo 8 entradas recentes. Buscas duplicadas são movidas para o topo da lista em vez de criar entradas repetidas. O usuário pode limpar todo o histórico com um botão dedicado, e clicar em qualquer item do histórico realiza uma nova busca para aquela cidade.

### Compartilhamento

O botão de compartilhamento abre um menu com os seguintes canais:

- WhatsApp
- Telegram
- X (Twitter)
- Facebook
- Email
- Copiar texto para a área de transferência (clipboard)
- Compartilhamento nativo do sistema operacional (via Web Share API, quando disponível)

A mensagem compartilhada inclui cidade, temperatura, descrição do clima, umidade e velocidade do vento.

### Suporte PWA

A aplicação inclui suporte a Progressive Web App:

- **Web App Manifest** — permite a instalação da aplicação como app standalone na tela inicial do dispositivo, com ícone e nome configurados.
- **Service Worker** — implementa cache de assets estáticos (cache-first) e respostas de API (network-first com fallback para cache), possibilitando uso offline com os últimos dados consultados.

### Gráfico de Temperatura

Gráfico de linha exibindo temperaturas máximas (rosa) e mínimas (azul) dos próximos dias, com tooltip interativo ao passar o mouse. Responsivo e adaptado aos temas claro/escuro.

### Alertas Climáticos

Alertas automáticos baseados nas condições atuais: calor extremo (>38°C), frio extremo (<-5°C), ventos fortes (>15 m/s), tempestades e umidade elevada (>90%). Exibidos como banners coloridos por severidade (baixa, moderada, severa).

### Cidades Favoritas

Permite salvar até 10 cidades como favoritas (estrela ★ no card de clima). Persistidas em localStorage com acesso rápido para nova busca.

### Tema Claro/Escuro

Toggle de tema no canto superior direito (sol/lua). Respeita a preferência do sistema operacional na primeira visita. Persistido em localStorage.

### Internacionalização

Suporte a Português (pt-BR), Espanhol (es) e Inglês (en). Seletor de idioma (PT | ES | EN) no canto superior direito. Descrições climáticas da API também são traduzidas via parâmetro `lang`.

### Índice UV

Estimativa do índice UV baseada na posição solar e condição climática. Exibe barra de gradiente colorida (verde→amarelo→laranja→vermelho→violeta), valor numérico, categoria (Baixo/Moderado/Alto/Muito Alto/Extremo) e recomendação de proteção solar. Visível apenas durante o dia.

### Comparação entre Cidades

Botão "Comparar" que permite buscar uma segunda cidade e visualizar os dados lado a lado (desktop) ou empilhados (mobile). Destaca qual cidade é mais quente (▲ laranja) ou mais fria (▼ azul).

### Marcador Arrastável no Mapa

O marcador do mapa pode ser arrastado para qualquer localização. Ao soltar, busca automaticamente o clima das novas coordenadas, atualizando todos os dados da interface.

### Exportar como Imagem

Botão de câmera que captura o card de clima como imagem PNG e faz download automático com nome `clima-{cidade}-{data}.png`.

### Atualizar Dados

Botão de refresh que re-busca os dados da cidade atual sem precisar digitar novamente. Ícone gira durante o carregamento.

### Indicador de Última Atualização

Texto discreto abaixo do card mostrando quando os dados foram buscados pela última vez ("Atualizado agora", "Atualizado há 5 min", etc.).

### Notificação de Mudança de Clima

Polling automático a cada 30 minutos (apenas com aba visível). Se a temperatura mudar mais de 3°C ou a condição climática mudar, exibe um toast informativo no topo da tela.

## Testes

O projeto utiliza **Vitest** como test runner, configurado com ambiente `jsdom` e APIs de teste globais habilitadas (`describe`, `it`, `expect` disponíveis sem importação explícita).

### Bibliotecas de Teste

- **@testing-library/react** — renderização e consulta de componentes React em testes
- **@testing-library/jest-dom** — matchers adicionais para asserções de DOM (ex.: `toBeInTheDocument`, `toHaveTextContent`)
- **@testing-library/user-event** — simulação de interações do usuário (cliques, digitação, etc.)
- **fast-check** — testes baseados em propriedades (property-based testing), gerando entradas aleatórias para validar invariantes do sistema

### Localização dos Arquivos de Teste

Os testes ficam em diretórios `__tests__/` co-localizados com o código-fonte:

- `src/__tests__/` — testes de integração da aplicação
- `src/components/__tests__/` — testes unitários e de propriedade dos componentes
- `src/services/__tests__/` — testes de propriedade do serviço de API

### Comandos

```bash
npm test
```

Executa a suíte de testes em modo de execução única.

```bash
npm run test:watch
```

Executa os testes em modo watch para feedback contínuo durante o desenvolvimento.

### Convenções de Nomenclatura

| Sufixo                      | Tipo de Teste                  |
|-----------------------------|--------------------------------|
| `.test.tsx`                 | Testes unitários e de componente |
| `.property.test.tsx`        | Testes baseados em propriedades  |
| `.integration.test.tsx`     | Testes de integração             |

## Backend (API Proxy)

O projeto inclui um backend opcional no diretório `server/` que atua como proxy para a API do OpenWeatherMap, protegendo a chave de API e evitando sua exposição no frontend.

### Endpoints Disponíveis

| Endpoint                    | Descrição                                      |
|-----------------------------|------------------------------------------------|
| `/api/health`               | Health check do servidor                       |
| `/api/weather`              | Clima atual de uma cidade                      |
| `/api/forecast`             | Previsão estendida de 5 dias                   |
| `/api/air-quality`          | Índice de qualidade do ar                      |
| `/api/geocode/reverse`      | Geocodificação reversa (coordenadas → cidade)  |
| `/api/cep/:cep`             | Busca de cidade por CEP brasileiro             |

### Como Executar

```bash
cd server
cp .env.example .env
# Edite o .env com sua OPENWEATHERMAP_API_KEY
npm install
npm run dev
```

### Integração com o Frontend

Para que o frontend utilize o proxy, defina a variável de ambiente no `.env` do frontend:

```text
VITE_API_PROXY_URL=http://localhost:3001
```

Quando essa variável está configurada, o frontend direciona as requisições ao proxy em vez de chamar a API do OpenWeatherMap diretamente. Caso a variável não esteja definida, o frontend utiliza a chave `VITE_API_KEY` diretamente (fallback).

### Rate Limiting e CORS

O servidor aplica rate limiting de **100 requisições por 15 minutos** por IP, configurável via variáveis de ambiente (`RATE_LIMIT_MAX` e `RATE_LIMIT_WINDOW_MS`). O CORS é configurável pela variável `CORS_ORIGIN` (padrão: `*` em desenvolvimento).
