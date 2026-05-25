# Diagrama de Fluxo da Aplicação — Temperatura Local

```mermaid
flowchart TD
    subgraph Frontend["Frontend React (Vite)"]
        UI["Interface do Usuário"]
        API_SERVICE["weatherApi.ts"]
        CACHE["localStorage\n(histórico, favoritos, tema, idioma)"]
        SW["Service Worker\n(cache offline)"]
    end

    subgraph Backend["API Express (server/)"]
        MIDDLEWARE["Middleware Pipeline\n(CORS → Rate Limiter → Validação)"]
        ROUTES["Rotas"]
        PROXY["Proxy Service"]
    end

    subgraph Rotas["Endpoints Disponíveis"]
        R1["/api/weather"]
        R2["/api/forecast"]
        R3["/api/air-quality"]
        R4["/api/geocode/reverse"]
        R5["/api/cep/:cep"]
        R6["/api/health"]
    end

    subgraph Externos["APIs Externas"]
        OWM["OpenWeatherMap API"]
        VIACEP["ViaCEP API"]
    end

    UI -->|"busca cidade/CEP/geoloc"| API_SERVICE
    API_SERVICE -->|"requisição HTTP"| MIDDLEWARE
    MIDDLEWARE --> ROUTES
    ROUTES --> PROXY
    PROXY -->|"+ API Key (server-side)"| OWM
    PROXY -->|"busca CEP"| VIACEP
    OWM -->|"dados meteorológicos"| PROXY
    VIACEP -->|"dados de endereço"| PROXY
    PROXY -->|"resposta JSON"| ROUTES
    ROUTES -->|"resposta"| API_SERVICE
    API_SERVICE -->|"atualiza UI"| UI
    UI -->|"persiste dados"| CACHE
    SW -->|"cache de respostas"| API_SERVICE

    API_SERVICE -.->|"fallback direto\n(se proxy indisponível)"| OWM
    API_SERVICE -.->|"fallback direto"| VIACEP
```

## Fluxo de Requisição

1. O usuário interage com a interface (busca, geolocalização, favoritos)
2. O `weatherApi.ts` tenta enviar a requisição ao backend proxy
3. O backend aplica CORS, rate limiting e validação de parâmetros
4. A rota correspondente encaminha ao Proxy Service
5. O Proxy Service adiciona a API Key e faz a requisição à API externa
6. A resposta retorna ao frontend sem expor a chave
7. Se o proxy estiver indisponível, o frontend faz a chamada diretamente (fallback)

## Dados em Memória (Frontend)

| Dado | Armazenamento | Chave |
|------|---------------|-------|
| Histórico de buscas | localStorage | `temperatura-local-history` |
| Cidades favoritas | localStorage | `temperatura-local-favorites` |
| Tema (claro/escuro) | localStorage | `temperatura-local-theme` |
| Idioma selecionado | localStorage | `temperatura-local-lang` |
| Cache de API | Service Worker | Cache API (stale-while-revalidate) |
| Tiles do mapa | Service Worker | Cache API (24h TTL) |
