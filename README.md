# 🫙 Despensa em Dia

Aplicativo mobile para **organizar o estoque doméstico da família**: o que existe
em casa, o que está vencendo, o que está acabando e o que precisa ser comprado.

> **Problema:** alimentos vencem esquecidos, a família compra o que já tinha e
> esquece o que acabou. Cerca de 60% do desperdício de alimentos no mundo acontece
> nos domicílios (PNUMA, *Food Waste Index 2024*).
> **Solução:** um estoque compartilhado no celular, com alertas de validade e de
> estoque baixo e uma lista de compras da família.

## Documentação

- **[docs/PROPOSTA.md](docs/PROPOSTA.md):** problema, público, justificativa e fluxo de navegação (Entrega 1).
- **[docs/PLANEJAMENTO_TECNICO.md](docs/PLANEJAMENTO_TECNICO.md):** requisitos atualizados, banco de dados,
  entidades, rotas da API e permissões (Entrega 2).

## Status das entregas

| Entrega | Conteúdo                                                        | Status |
| ------- | --------------------------------------------------------------- | ------ |
| 1       | Proposta, projeto Expo, telas, React Navigation, repositório     | ✅ concluída |
| 2       | MySQL, API Node.js/Express, integração com `fetch()`            | ✅ concluída |
| 3       | Cadastro, bcrypt, JWT, Bearer Token, níveis, rotas protegidas, CRUD | ⏳ |
| 4       | Testes, correções, APK e apresentação                            | ⏳ |

### O que já usa dados reais

| Parte                                   | Situação                                    |
| --------------------------------------- | ------------------------------------------- |
| Itens do estoque (CRUD e consumo)       | ✅ App → `fetch()` → API → MySQL             |
| Login, criar conta e família            | Simulados em memória até a Entrega 3         |
| Lista de compras                        | Tabela pronta; a tela usa memória até a Entrega 3 |

> ⚠️ As rotas da API ainda **não exigem login** (isso chega na Entrega 3). Use a API só em
> desenvolvimento e sem dados reais.

## Tecnologias

- React Native com **Expo** (SDK 58), em JavaScript
- **React Navigation** (Native Stack)
- API REST com **Node.js + Express**
- **MySQL** com `mysql2/promise`, sem ORM
- `fetch()` no aplicativo, sem Axios
- *Próxima entrega:* `bcryptjs` e `jsonwebtoken`

## Como executar

Pré-requisitos: Node.js 22.13 ou mais recente (exigido pelo Expo SDK 58), MySQL e, para testar no
celular, o app **Expo Go**.

### 1. Instalar as dependências

```bash
npm ci
```

O aplicativo e a API usam o mesmo `package.json`, na raiz do projeto.

### 2. Configurar o acesso ao MySQL

Copie o modelo para criar o seu arquivo local. No PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Abra `backend/.env` e preencha os dados do **seu** MySQL:

| Variável      | Significado                                                       |
| ------------- | ----------------------------------------------------------------- |
| `PORT`        | Porta da API (padrão 3000)                                        |
| `DB_HOST`     | Endereço do MySQL, normalmente `localhost`                        |
| `DB_PORT`     | Porta do MySQL: o padrão é 3306, mas a sua instalação pode usar outra |
| `DB_USER`     | Usuário do MySQL                                                  |
| `DB_PASSWORD` | Senha desse usuário                                               |
| `DB_NAME`     | `despensa_em_dia`                                                 |

`backend/.env` fica fora do Git. Nunca coloque senhas nos arquivos versionados.

### 3. Criar o banco de dados

```bash
npm run db:criar
```

Se preferir, abra `database/despensa_em_dia.sql` no MySQL Workbench e execute o arquivo inteiro.
Executar de novo não duplica nem apaga dados.

### 4. Ligar a API (terminal 1)

```bash
npm run api
```

A mensagem esperada é `API executando em http://localhost:3000`. Para conferir a conexão com o banco,
abra <http://localhost:3000/status> no navegador. Se algo estiver errado, o terminal explica o que
conferir (serviço desligado, porta, senha ou banco ainda não criado).

### 5. Ligar o aplicativo (terminal 2)

```bash
npm run web
```

### Testar no celular

No celular, `localhost` é o próprio celular. Por isso, o aplicativo precisa saber o endereço do computador:

1. Rode `ipconfig` e anote o **IPv4** da conexão ativa.
2. Na raiz do projeto, crie o arquivo `.env` (use `.env.example` como modelo) com
   `EXPO_PUBLIC_API_URL=http://SEU-IP:3000`.
3. Deixe o celular e o computador na mesma rede. Se a conexão falhar, libere o Node e a porta 3000 no firewall.
4. Com a API ligada, rode `npx expo start --clear` e leia o QR Code com o Expo Go.

Redes de escolas e empresas costumam bloquear a comunicação entre aparelhos. O modo `--tunnel` do
Expo só ajuda a abrir o aplicativo: ele **não** torna a API acessível.

### Contas de teste

Nesta entrega o login ainda é **simulado**: qualquer senha é aceita.

| Conta               | Nível        | O que pode fazer                                            |
| ------------------- | ------------ | ----------------------------------------------------------- |
| `ana@familia.com`   | Responsável  | Tudo: cadastrar, editar e excluir itens, gerenciar família   |
| `pedro@familia.com` | Membro       | Ver estoque, registrar consumo, usar a lista de compras      |

O script SQL já cria essas contas com a senha de demonstração `123456`, guardada como hash. Ela será
usada no login real da Entrega 3 e serve apenas para estudo.

Também é possível criar uma conta pela tela **Criar conta**: ela sempre começa como *membro*.
Contas criadas e a lista de compras ficam em memória e voltam ao estado inicial quando o app é
recarregado. Já os **itens do estoque ficam salvos no MySQL**.

## API

| Método e rota              | O que faz                     |
| -------------------------- | ----------------------------- |
| `GET /status`              | Confere a conexão com o banco |
| `GET /itens`               | Lista os itens                |
| `GET /itens/:id`           | Busca um item                 |
| `POST /itens`              | Cadastra um item              |
| `PUT /itens/:id`           | Atualiza um item              |
| `DELETE /itens/:id`        | Exclui um item                |
| `PATCH /itens/:id/consumo` | Desconta 1 da quantidade      |

Detalhes, exemplos e as rotas previstas estão em [docs/PLANEJAMENTO_TECNICO.md](docs/PLANEJAMENTO_TECNICO.md).

## Telas

| Tela             | Quem acessa  | O que faz                                                       |
| ---------------- | ------------ | --------------------------------------------------------------- |
| Login            | Público      | Entrar com e-mail e senha; atalhos para contas de teste          |
| Criar conta      | Público      | Cadastro com validação de nome, e-mail e senha                   |
| Início           | Todos        | Resumo: vencidos/vencendo, estoque baixo, lista de compras      |
| Estoque          | Todos        | Lista de itens com busca, filtro por categoria e atualização     |
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
├── .env.example           # Modelo do endereço da API para testar no celular
├── assets/                # Ícones e splash (identidade visual)
├── components/
│   ├── ui.js              # Cores e componentes visuais (Botao, Campo, Painel, Selo…)
│   └── CartaoItem.js      # Cartão de item usado nas listas
├── data/
│   └── estoque.js         # Opções, regras de validade e dados ainda em memória
├── screens/               # Uma tela por arquivo
│   ├── Login.js
│   ├── CadastroUsuario.js
│   ├── Inicio.js
│   ├── Estoque.js
│   ├── DetalhesItem.js
│   ├── FormularioItem.js
│   ├── ListaCompras.js
│   └── Familia.js
├── services/
│   └── api.js             # Chamadas à API com fetch()
├── backend/
│   ├── server.js          # Inicia a API depois de conferir o banco
│   ├── app.js             # Configura o Express, as rotas e os erros
│   ├── .env.example       # Modelo das configurações (backend/.env fica fora do Git)
│   ├── config/ambiente.js # Lê e confere o .env
│   ├── database/conexao.js # Pool de conexões com o MySQL
│   ├── routes/itensRoutes.js
│   ├── controllers/itensController.js
│   ├── utils/validacoes.js
│   ├── scripts/criarBanco.js
│   └── tests/api.mysql.test.js
├── database/
│   └── despensa_em_dia.sql # Tabelas e dados de exemplo
└── docs/
    ├── PROPOSTA.md            # Entrega 1
    └── PLANEJAMENTO_TECNICO.md # Entrega 2
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

| Comando              | Descrição                                                   |
| -------------------- | ----------------------------------------------------------- |
| `npm start`          | Inicia o Expo                                               |
| `npm run android`    | Abre no Android                                             |
| `npm run web`        | Abre no navegador                                           |
| `npm run api`        | Inicia a API                                                |
| `npm run api:dev`    | Inicia a API e reinicia ao salvar os arquivos               |
| `npm run db:criar`   | Cria o banco, as tabelas e os dados de exemplo              |
| `npm run test:mysql` | Testa a API em um MySQL temporário, sem usar o seu banco    |
| `npm run lint`       | Verifica o código (ESLint)                                  |
| `npm run typecheck`  | Checagem dos arquivos JS                                    |
