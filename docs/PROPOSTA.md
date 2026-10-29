# Despensa em Dia — Proposta do Projeto (Entrega 1)

> Aplicação mobile para organizar o estoque doméstico da família, reduzir o
> desperdício de alimentos e evitar compras repetidas ou esquecidas.

## 1. Problema atual identificado

Em muitas casas, ninguém sabe ao certo **o que existe na despensa, na geladeira
e no armário de limpeza**. O resultado aparece no dia a dia:

- alimentos vencem esquecidos no fundo do armário ou da geladeira;
- a família compra produtos que já tinha em casa e esquece o que realmente acabou;
- cada pessoa faz a sua própria lista de compras (ou nenhuma), sem combinar com
  os outros moradores;
- quem consome o último item raramente avisa os demais.

## 2. Contexto e público afetado

- **Contexto:** o desperdício de alimentos acontece, em grande parte, dentro das
  residências. Segundo o *Food Waste Index Report 2024* do PNUMA (ONU), cerca de
  **60% do desperdício de alimentos no mundo vem dos domicílios**. No Brasil, uma
  pesquisa da Embrapa com a FGV (2018, 1.764 famílias) estimou cerca de
  **41 kg de comida desperdiçada por pessoa por ano**, ou cerca de 128 kg por família.
- **Público afetado:** famílias e pessoas que dividem a mesma casa (pais, filhos,
  avós, estudantes que dividem moradia), especialmente quem precisa controlar o
  orçamento doméstico.

## 3. Justificativa

Desperdiçar alimentos significa perder dinheiro, comida e recursos naturais. A
maior parte desse prejuízo vem da **falta de informação compartilhada**: quem
compra não sabe o que acabou, e quem consome não avisa. Um aplicativo no celular,
que todos os moradores já carregam, pode centralizar essa informação e avisar
**antes** de o problema acontecer (item perto de vencer ou abaixo da quantidade
mínima).

## 4. Proposta de solução

O **Despensa em Dia** é um aplicativo em que a família cadastra os itens da casa
com **quantidade, local, categoria, estoque mínimo e validade**. O aplicativo:

1. mostra um **painel** com o que está vencido, vencendo nos próximos 7 dias e
   abaixo do estoque mínimo;
2. permite que qualquer morador **registre o consumo** de um item ("usei 1");
3. mantém uma **lista de compras compartilhada**, com sugestões automáticas a
   partir dos itens que estão acabando;
4. permite que o **responsável** pela casa gerencie os itens e os membros da família.

## 5. Nome da aplicação

**Despensa em Dia** — o nome remete à despensa organizada e às validades "em dia".

## 6. Tipos de usuário e permissões iniciais

| Funcionalidade                                  | Responsável | Membro |
| ----------------------------------------------- | :---------: | :----: |
| Criar conta e entrar                            |      ✅      |   ✅    |
| Ver painel e estoque                            |      ✅      |   ✅    |
| Ver detalhes de um item                         |      ✅      |   ✅    |
| Registrar consumo ("usei 1")                    |      ✅      |   ✅    |
| Usar a lista de compras (adicionar / marcar)    |      ✅      |   ✅    |
| Cadastrar, editar e excluir itens do estoque    |      ✅      |   ❌    |
| Gerenciar membros e alterar níveis de acesso    |      ✅      |   ❌    |

- **Responsável:** organiza a casa. Pode tudo, inclusive mudar o nível dos membros.
- **Membro:** usa o estoque no dia a dia, sem poder apagar ou alterar o cadastro dos itens.
- Toda conta criada pelo cadastro público começa como **membro**. Nas próximas
  entregas, essa regra e as permissões serão garantidas **no back-end** (JWT +
  middleware), e não apenas escondendo botões no aplicativo.

## 7. Principais funcionalidades

- Cadastro e login de usuários (com hash de senha e JWT na Entrega 3).
- Painel com alertas de validade e estoque baixo.
- CRUD de itens do estoque (entidade principal).
- Filtro do estoque por categoria e busca por nome.
- Registro de consumo.
- Lista de compras compartilhada com sugestões automáticas.
- Gerenciamento de membros da família e níveis de acesso.

## 8. Telas previstas

| Tela               | Arquivo                    | Acesso      | Situação na Entrega 1           |
| ------------------ | -------------------------- | ----------- | ------------------------------- |
| Login              | `screens/Login.js`         | Pública     | ✅ simulado com contas de teste  |
| Criar conta        | `screens/CadastroUsuario.js` | Pública   | ✅ simulado (dados em memória)   |
| Início (painel)    | `screens/Inicio.js`        | Todos       | ✅                               |
| Estoque            | `screens/Estoque.js`       | Todos       | ✅ busca e filtro por categoria  |
| Detalhes do item   | `screens/DetalhesItem.js`  | Todos       | ✅ registrar consumo             |
| Novo / Editar item | `screens/FormularioItem.js`| Responsável | ✅ em memória                    |
| Lista de compras   | `screens/ListaCompras.js`  | Todos       | ✅ em memória                    |
| Família            | `screens/Familia.js`       | Responsável | ✅ alterar nível (simulado)      |

## 9. Fluxo inicial de navegação

```text
                    ┌──────────────┐
                    │    Login     │◄──────── Sair
                    └──────┬───────┘
          "Criar conta"    │   entrar
        ┌──────────────────┤
        ▼                  ▼
┌───────────────┐   ┌──────────────┐
│ CadastroUsuario│   │    Início    │ (painel com alertas)
└───────────────┘   └──┬────┬───┬──┘
                       │    │   └──────────────► Família (só responsável)
                       │    └──────────────────► Lista de compras
                       ▼
                ┌──────────────┐  "+ Novo item" (só responsável)
                │   Estoque    │──────────────► FormularioItem
                └──────┬───────┘                     ▲
                       ▼                             │ "Editar"
                ┌──────────────┐                     │
                │ DetalhesItem │─────────────────────┘
                └──────────────┘
```

A navegação usa **React Navigation (Native Stack)**. Existem dois grupos de telas:
o grupo **público** (Login e Criar conta) e o grupo **da sessão** (demais telas).
Ao entrar ou sair, o App troca o grupo inteiro, então o botão Voltar não reabre
uma sessão encerrada. As telas exclusivas do responsável nem são registradas
para o membro.

## 10. Planejamento das próximas entregas

| Entrega | Foco                                                                 |
| ------- | -------------------------------------------------------------------- |
| 2       | Modelagem MySQL (`usuarios`, `itens`, `itens_lista_compras`), API Express e integração com `fetch()` |
| 3       | Cadastro com bcrypt, login com JWT, Bearer Token, middleware de níveis, CRUD completo protegido |
| 4       | Testes, correções, README final, APK e apresentação                  |

## Fontes

- PNUMA (ONU Meio Ambiente). *Food Waste Index Report 2024*, divulgado em
  março de 2024 e noticiado pelo Correio Braziliense em
  "População desperdiçou mais de 1 bilhão de refeições por dia em 2022" (abr. 2024).
- Embrapa e FGV. Pesquisa sobre desperdício de alimentos nos lares brasileiros (dados
  de 2018), noticiada pelo Hoje em Dia em "Desperdício de alimentos chega a R$ 1 mil
  por família por ano, diz Embrapa" (mai. 2019).
