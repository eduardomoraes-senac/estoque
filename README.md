# 🫙 Despensa em Dia

Aplicativo mobile para **organizar o estoque doméstico da família**: o que existe
em casa, o que está vencendo, o que está acabando e o que precisa ser comprado.

> **Problema:** alimentos vencem esquecidos, a família compra o que já tinha e
> esquece o que acabou. Cerca de 60% do desperdício de alimentos no mundo acontece
> nos domicílios (PNUMA, *Food Waste Index 2024*).
> **Solução:** um estoque compartilhado no celular, com alertas de validade e de
> estoque baixo e uma lista de compras da família.

A proposta completa (problema, público, justificativa, níveis de usuário,
permissões, telas e fluxo de navegação) está em **[docs/PROPOSTA.md](docs/PROPOSTA.md)**.

## Status das entregas

| Entrega | Conteúdo                                                        | Status |
| ------- | --------------------------------------------------------------- | ------ |
| 1       | Proposta, projeto Expo, telas, React Navigation, repositório     | ✅ concluída |
| 2       | MySQL, API Node.js/Express, integração com `fetch()`            | ⏳ |
| 3       | Cadastro, bcrypt, JWT, Bearer Token, níveis, rotas protegidas, CRUD | ⏳ |
| 4       | Testes, correções, APK e apresentação                            | ⏳ |

## Tecnologias

- React Native com **Expo** (SDK 58), em JavaScript
- **React Navigation** (Native Stack)
- *Próximas entregas:* Node.js + Express, MySQL (`mysql2`), `bcryptjs`, `jsonwebtoken`

## Como executar

Pré-requisitos: Node.js 20 ou mais recente e o app **Expo Go** no celular (ou um navegador).

```bash
npm install
npx expo start        # abre o menu do Expo: leia o QR Code com o Expo Go
# ou
npm run web           # abre no navegador
```

### Contas de teste (Entrega 1)

Nesta entrega o login é **simulado** (dados em memória, sem API). Qualquer senha é aceita.

| Conta               | Nível        | O que pode fazer                                            |
| ------------------- | ------------ | ----------------------------------------------------------- |
| `ana@familia.com`   | Responsável  | Tudo: cadastrar, editar e excluir itens, gerenciar família   |
| `pedro@familia.com` | Membro       | Ver estoque, registrar consumo, usar a lista de compras      |

Também é possível criar uma conta pela tela **Criar conta**: ela sempre começa como *membro*.
Como os dados ficam em memória, eles voltam ao estado inicial quando o app é recarregado.

## Telas

| Tela             | Quem acessa  | O que faz                                                       |
| ---------------- | ------------ | --------------------------------------------------------------- |
| Login            | Público      | Entrar com e-mail e senha; atalhos para contas de teste          |
| Criar conta      | Público      | Cadastro com validação de nome, e-mail e senha                   |
| Início           | Todos        | Resumo: vencidos/vencendo, estoque baixo, lista de compras      |
| Estoque          | Todos        | Lista de itens com busca e filtro por categoria                  |
| Detalhes do item | Todos        | Dados do item, "Usei 1", colocar na lista de compras             |
| Novo/Editar item | Responsável  | Formulário com validação (quantidade, mínimo e validade)        |
| Lista de compras | Todos        | Adicionar, marcar comprado, sugestões de itens que estão acabando |
| Família          | Responsável  | Ver membros e alterar o nível de acesso                          |

## Estrutura de pastas

```text
despensa-em-dia/
├── App.js                 # Navegação (Native Stack) + estado da sessão e dos dados
├── index.js               # Ponto de entrada do Expo
├── app.json               # Nome, ícone, splash e configurações do app
├── assets/                # Ícones e splash (identidade visual)
├── components/
│   ├── ui.js              # Cores e componentes visuais (Botao, Campo, Painel, Selo…)
│   └── CartaoItem.js      # Cartão de item usado nas listas
├── data/
│   └── estoque.js         # Dados de exemplo e funções (validade, estoque baixo, datas)
├── screens/               # Uma tela por arquivo
│   ├── Login.js
│   ├── CadastroUsuario.js
│   ├── Inicio.js
│   ├── Estoque.js
│   ├── DetalhesItem.js
│   ├── FormularioItem.js
│   ├── ListaCompras.js
│   └── Familia.js
└── docs/
    └── PROPOSTA.md        # Proposta do projeto (Entrega 1)
```

## Navegação

O `App.js` usa **dois grupos de telas** no Native Stack:

- **público** (`Login`, `CadastroUsuario`): aparece quando não há usuário logado;
- **sessão** (`Inicio`, `Estoque`, `DetalhesItem`, `ListaCompras` e, só para o
  responsável, `FormularioItem` e `Familia`).

Ao entrar ou sair, o grupo inteiro é trocado, então o botão Voltar não volta para uma
sessão encerrada. O `id` do item é passado entre telas por `route.params`
(`navigation.navigate('DetalhesItem', { id })`).

> ⚠️ Esconder telas e botões é apenas visual. A partir da Entrega 3, as permissões serão
> garantidas no **back-end**, com JWT e middleware.

## Scripts

| Comando             | Descrição                    |
| ------------------- | ---------------------------- |
| `npm start`         | Inicia o Expo                |
| `npm run android`   | Abre no Android              |
| `npm run web`       | Abre no navegador            |
| `npm run lint`      | Verifica o código (ESLint)   |
| `npm run typecheck` | Checagem dos arquivos JS     |
