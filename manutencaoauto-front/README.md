# ManutençãoAuto Front

Front-end SPA do projeto usando HTML5, CSS3 e JavaScript puro.

## Estrutura

- `index.html`: página única da SPA.
- `css/styles.css`: estilização customizada e responsiva.
- `js/`: scripts de configuração, API, roteamento e views.

## Como visualizar a estrutura estática

1. Abra o arquivo `index.html` diretamente no navegador.
2. A navegação entre seções (`Manutenções`, `Serviços`, `Associações`) funciona sem backend.
3. Sem API ativa, as listas aparecem vazias e o front exibe mensagens de conexão quando tentar buscar/salvar dados.

## Como integrar com a API

1. Inicie a API backend (exemplo local: `http://localhost:5000`).
2. No topo da tela, ajuste o campo **API base URL** se necessário.
3. Use os formulários para criar e excluir registros.

## Observações

- Não há uso de frameworks SPA (Angular, Vue, React).
- Não há dependência de Bootstrap nesta versão: o CSS é totalmente customizado.
- O módulo de associações usa chave composta em query params (`id_manutencao` e `id_servico`) conforme a API.
