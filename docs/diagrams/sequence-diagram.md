# Diagrama de Sequência — Temperatura Local

## Fluxo: Buscar clima por cidade (sucesso)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)
    participant Cache as Dados em memória (Rate Limiter)

    User->>Frontend: Digita "São Paulo" e clica Buscar
    Frontend->>API: GET /api/weather?q=São Paulo&units=metric&lang=pt_br
    API->>Cache: Verifica rate limit do IP
    Cache-->>API: OK (requisições restantes: 99)
    API->>API: Valida parâmetros (q: 1-100 chars, sem controle)
    API->>API: Anexa API key e encaminha para OpenWeatherMap
    Note over API: Timeout: 15s
    API-->>Frontend: 200 OK + JSON (dados meteorológicos)
    Frontend->>Frontend: Transforma resposta em WeatherData
    Frontend->>Frontend: Gera alertas climáticos
    Frontend-->>User: Exibe card de clima, mapa, gráfico e previsão
```

## Fluxo: Buscar clima por cidade (erro — campo obrigatório ausente)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)
    participant Cache as Dados em memória (Rate Limiter)

    User->>Frontend: Clica Buscar sem digitar cidade
    Frontend->>Frontend: validateInput("") retorna erro
    Frontend-->>User: Exibe alerta "Digite o nome de uma cidade"
    Note over Frontend,API: Requisição NÃO é enviada ao backend
```

## Fluxo: Buscar clima por coordenadas (erro — parâmetro inválido)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)
    participant Cache as Dados em memória (Rate Limiter)

    User->>Frontend: Envia coordenadas inválidas (lat=999)
    Frontend->>API: GET /api/weather?lat=999&lon=-46.63&units=metric
    API->>Cache: Verifica rate limit do IP
    Cache-->>API: OK
    API->>API: Valida parâmetros
    API-->>Frontend: 400 Bad Request + {"message": "Parameter \"lat\" must be a valid number between -90 and 90"}
    Frontend->>Frontend: Fallback para chamada direta (transparente)
    Frontend-->>User: Exibe mensagem de erro
```

## Fluxo: Rate limit excedido

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)
    participant Cache as Dados em memória (Rate Limiter)

    User->>Frontend: Busca cidade
    Frontend->>API: GET /api/weather?q=Tokyo&units=metric
    API->>Cache: Verifica rate limit do IP
    Cache-->>API: LIMITE EXCEDIDO (0 restantes)
    API-->>Frontend: 429 Too Many Requests + Retry-After: 540
    Frontend->>Frontend: Fallback para chamada direta (transparente)
    Frontend-->>User: Exibe dados normalmente (fallback bem-sucedido)
```

## Fluxo: Buscar CEP (sucesso)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)
    participant Cache as Dados em memória (Rate Limiter)

    User->>Frontend: Digita CEP "01001000" e clica Buscar
    Frontend->>API: GET /api/cep/01001000
    API->>Cache: Verifica rate limit do IP
    Cache-->>API: OK
    API->>API: Valida CEP (8 dígitos)
    API->>API: Encaminha para ViaCEP
    API-->>Frontend: 200 OK + {"localidade": "São Paulo", "uf": "SP", ...}
    Frontend->>Frontend: Extrai cidade "São Paulo"
    Frontend->>API: GET /api/weather?q=São Paulo&units=metric&lang=pt_br
    API-->>Frontend: 200 OK + dados meteorológicos
    Frontend-->>User: Exibe clima de São Paulo
```

## Fluxo: Buscar CEP (erro — formato inválido)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Frontend React
    participant API as API Express (Proxy)

    User->>Frontend: Digita CEP "123" e clica Buscar
    Frontend->>Frontend: validateCep("123") retorna erro
    Frontend-->>User: Exibe alerta "CEP incompleto. Digite os 8 dígitos"
    Note over Frontend,API: Requisição NÃO é enviada ao backend
```
