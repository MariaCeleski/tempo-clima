# Guia de Instalação e Execução Local

Este documento explica como preparar o ambiente e executar o projeto **Temperatura Local** (frontend + API proxy) localmente.

## Pré-requisitos

- **Node.js** >= 18 (recomendado: 20+)
- **npm** >= 9
- **Chave da API OpenWeatherMap** (gratuita)

Para verificar se você tem Node.js e npm instalados:

```bash
node --version
npm --version
```

> Caso não tenha o Node.js instalado, baixe em [nodejs.org](https://nodejs.org/).

### Obter chave da API OpenWeatherMap

1. Acesse [openweathermap.org/api](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Vá em "API Keys" no painel e copie sua chave

## Clonar o repositório

```bash
git clone https://github.com/MariaCeleski/tempo-clima.git
```

## Acessar a pasta do projeto

```bash
cd tempo-clima
```

A estrutura do projeto é:

```text
tempo-clima/
├── temperatura-local-react/   # Frontend (React + Vite)
├── server/                    # Backend API Proxy (Express)
└── docs/                      # Documentação
```

## Configurar variáveis de ambiente

### Frontend

```bash
cd temperatura-local-react
cp .env.example .env
```

Edite o arquivo `.env` e insira sua chave:

```text
VITE_API_KEY=sua_chave_openweathermap_aqui
VITE_API_PROXY_URL=http://localhost:3001
```

> A variável `VITE_API_PROXY_URL` é opcional. Se definida, o frontend direciona as requisições ao backend proxy. Se não definida, o frontend chama a API do OpenWeatherMap diretamente.

> A aplicação suporta 3 idiomas (PT, ES, EN), alternância de tema (claro/escuro), e permite buscar clima arrastando o marcador no mapa.

### Backend (API Proxy)

```bash
cd ../server
cp .env.example .env
```

Edite o arquivo `.env` e insira sua chave:

```text
OPENWEATHERMAP_API_KEY=sua_chave_openweathermap_aqui
PORT=3001
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
SERVE_STATIC=false
```

## Instalar dependências

### Frontend

```bash
cd temperatura-local-react
npm install
```

### Backend

```bash
cd server
npm install
```

## Executar em modo de desenvolvimento

### Frontend (porta 5173)

```bash
cd temperatura-local-react
npm run dev
```

O frontend estará disponível em: `http://localhost:5173/tempo-clima/`

### Backend API Proxy (porta 3001)

Em outro terminal:

```bash
cd server
npm run dev
```

O servidor estará disponível em: `http://localhost:3001`

## Executar em modo padrão (produção)

### Frontend — Build e Preview

```bash
cd temperatura-local-react
npm run build
npm run preview
```

### Backend — Build e Start

```bash
cd server
npm run build
npm start
```

## Validar se a API está funcionando

### Health Check do Backend

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-05-24T20:00:00.000Z"
}
```

### Testar endpoint de clima

```bash
curl "http://localhost:3001/api/weather?q=São Paulo&units=metric&lang=pt_br"
```

Deve retornar um JSON com dados meteorológicos de São Paulo.

### Testar endpoint de previsão

```bash
curl "http://localhost:3001/api/forecast?q=Rio de Janeiro&units=metric&lang=pt_br"
```

### Testar endpoint de CEP

```bash
curl http://localhost:3001/api/cep/01001000
```

Deve retornar os dados do CEP via ViaCEP.

### Verificar o Frontend

Abra `http://localhost:5173/tempo-clima/` no navegador. Busque uma cidade e verifique se os dados de clima aparecem.

## Executar testes

### Frontend

```bash
cd temperatura-local-react
npm test
```

### Backend (type checking)

```bash
cd server
npx tsc --noEmit
```

## Problemas comuns e soluções

### `ENOENT: no such file or directory, open 'package.json'`

**Causa:** Você está no diretório errado.

**Solução:** Certifique-se de estar dentro de `temperatura-local-react/` (para o frontend) ou `server/` (para o backend) antes de rodar `npm` commands.

```bash
cd temperatura-local-react
npm run dev
```

### `Error: OPENWEATHERMAP_API_KEY environment variable is not set`

**Causa:** O arquivo `.env` não foi criado ou a variável está vazia.

**Solução:** Crie o `.env` a partir do `.env.example` e insira sua chave:

```bash
cp .env.example .env
# Edite o .env com sua chave
```

### `Cidade não encontrada` ao buscar

**Causa:** A chave da API pode estar inválida ou expirada.

**Solução:**
1. Verifique se a chave está correta no `.env`
2. Chaves novas do OpenWeatherMap podem levar até 2 horas para ativar
3. Teste a chave diretamente: `curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=SUA_CHAVE"`

### Porta já em uso (`EADDRINUSE`)

**Causa:** Outro processo está usando a porta 3001 ou 5173.

**Solução:**

```bash
# Encontrar o processo na porta
lsof -i :3001
# Matar o processo
kill -9 <PID>
```

Ou altere a porta no `.env` do backend (`PORT=3002`).

### Frontend mostra tela branca

**Causa:** Pode ser um erro de JavaScript no console.

**Solução:**
1. Abra o DevTools (F12) e verifique o console
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se não há extensões do browser interferindo (teste em aba anônima)

### Rate limit (429 Too Many Requests)

**Causa:** Você excedeu 100 requisições em 15 minutos.

**Solução:** Aguarde 15 minutos ou aumente o limite no `.env` do backend:

```text
RATE_LIMIT_MAX=500
```

### CORS error no console

**Causa:** O frontend está em uma origem diferente da configurada no backend.

**Solução:** Ajuste a variável `CORS_ORIGIN` no `.env` do backend:

```text
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```
