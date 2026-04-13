# ManutencaoAuto Front-end

Aplicação web em HTML, CSS e JavaScript para consumo da API do projeto ManutencaoAuto.

## Instalação

### Pre-requisitos
- Navegador web moderno (Chrome, Edge ou Firefox)
- API do projeto em execução para uso completo das funcionalidades

### Configuração do ambiente local
1. Acesse a pasta do projeto:
   cd manutencaoauto-front
2. Certifique-se de que a API esteja em execução (padrão: http://localhost:5000) para uso completo das funcionalidades.

## Inicialização

### Executar o front-end
1. Abra o arquivo abaixo no navegador:
   manutencaoauto-front/index.html
2. No campo de URL da API da interface, confirme a base URL:
   http://localhost:5000
3. Clique em Aplicar para salvar a configuração, se necessário.

## Estrutura

- manutencaoauto-front/index.html: página única da SPA.
- manutencaoauto-front/css/styles.css: estilização customizada e responsiva.
- manutencaoauto-front/js/: scripts de configuração, API, utilitários e views.

## Como visualizar a estrutura estática

1. Abra manutencaoauto-front/index.html diretamente no navegador.
2. A navegação entre seções (Manutenções, Serviços e Associações) funciona sem backend.
3. Sem API ativa, as listas ficam vazias e o front exibe mensagens de conexão ao tentar buscar ou salvar dados.

## Como integrar com a API

1. Inicie a API backend (exemplo local: http://localhost:5000).
2. No topo da tela, ajuste o campo API base URL, se necessário.
3. Use os formulários para criar e excluir registros.

## Fluxo recomendado
1. Inicie primeiro a API (projeto manutencaoauto-api).
2. Em seguida, abra o front-end no navegador.

## Observações

- O projeto não usa frameworks SPA (Angular, Vue ou React).
- Não há dependência de Bootstrap nesta versão; o CSS é totalmente customizado.
- O módulo de associações usa chave composta em query params (id_manutencao e id_servico), conforme a API.
