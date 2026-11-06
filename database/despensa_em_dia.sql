-- Despensa em Dia: estrutura do banco e dados de exemplo.
-- Execute no MySQL Workbench ou com: npm run db:criar
-- IF NOT EXISTS e INSERT IGNORE permitem executar de novo sem apagar o que já existe.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS despensa_em_dia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE despensa_em_dia;

-- Moradores da casa. O nível define o que cada um pode fazer.
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  -- Guarda somente o hash do bcrypt, nunca a senha original (usado a partir da Entrega 3).
  senha VARCHAR(255) NOT NULL,
  nivel ENUM('responsavel', 'membro') NOT NULL DEFAULT 'membro',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Entidade principal: cada produto guardado em casa.
CREATE TABLE IF NOT EXISTS itens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  categoria ENUM('Alimentos', 'Bebidas', 'Limpeza', 'Higiene') NOT NULL,
  local ENUM('Armário', 'Geladeira', 'Freezer', 'Lavanderia', 'Banheiro') NOT NULL,
  unidade ENUM('un', 'pacote', 'caixa', 'kg', 'litro', 'garrafa') NOT NULL,
  quantidade INT NOT NULL DEFAULT 0,
  -- Abaixo deste número o item aparece como "estoque baixo".
  estoque_minimo INT NOT NULL DEFAULT 0,
  -- NULL significa que o item não tem validade (ex.: produtos de limpeza).
  validade DATE NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_itens_quantidade CHECK (quantidade >= 0),
  CONSTRAINT chk_itens_estoque_minimo CHECK (estoque_minimo >= 0)
) ENGINE=InnoDB;

-- Lista de compras da família. O nome é livre porque nem tudo que se compra já está no estoque.
CREATE TABLE IF NOT EXISTS itens_lista_compras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  comprado BOOLEAN NOT NULL DEFAULT FALSE,
  -- Se a conta de quem adicionou for removida, o produto continua na lista.
  adicionado_por INT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lista_usuario FOREIGN KEY (adicionado_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Contas de demonstração. O hash corresponde à senha pública 123456, citada no README.
-- Elas são usadas no login real da Entrega 3; não use essas contas com dados reais.
INSERT IGNORE INTO usuarios (id, nome, email, senha, nivel) VALUES
  (1, 'Ana Souza', 'ana@familia.com', '$2b$10$AbAjwCr.ymP11qmkFOX5wu0a.SPbWGaJ/4z1rKvJqZYivC8FH/qty', 'responsavel'),
  (2, 'Pedro Souza', 'pedro@familia.com', '$2b$10$AbAjwCr.ymP11qmkFOX5wu0a.SPbWGaJ/4z1rKvJqZYivC8FH/qty', 'membro'),
  (3, 'Lia Souza', 'lia@familia.com', '$2b$10$AbAjwCr.ymP11qmkFOX5wu0a.SPbWGaJ/4z1rKvJqZYivC8FH/qty', 'membro');

-- As validades são relativas à data de hoje para que os alertas apareçam na demonstração.
INSERT IGNORE INTO itens (id, nome, categoria, local, unidade, quantidade, estoque_minimo, validade) VALUES
  (1, 'Leite integral', 'Bebidas', 'Geladeira', 'litro', 2, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
  (2, 'Arroz', 'Alimentos', 'Armário', 'kg', 4, 2, DATE_ADD(CURDATE(), INTERVAL 180 DAY)),
  (3, 'Feijão carioca', 'Alimentos', 'Armário', 'kg', 1, 2, DATE_ADD(CURDATE(), INTERVAL 120 DAY)),
  (4, 'Iogurte natural', 'Alimentos', 'Geladeira', 'un', 4, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (5, 'Peito de frango', 'Alimentos', 'Freezer', 'kg', 2, 1, DATE_ADD(CURDATE(), INTERVAL 40 DAY)),
  (6, 'Pão de forma', 'Alimentos', 'Armário', 'pacote', 1, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
  (7, 'Detergente', 'Limpeza', 'Lavanderia', 'un', 1, 2, NULL),
  (8, 'Sabão em pó', 'Limpeza', 'Lavanderia', 'caixa', 1, 1, NULL),
  (9, 'Papel higiênico', 'Higiene', 'Banheiro', 'un', 12, 8, NULL),
  (10, 'Creme dental', 'Higiene', 'Banheiro', 'un', 0, 1, DATE_ADD(CURDATE(), INTERVAL 300 DAY)),
  (11, 'Suco de uva', 'Bebidas', 'Armário', 'garrafa', 3, 1, DATE_ADD(CURDATE(), INTERVAL 90 DAY));

INSERT IGNORE INTO itens_lista_compras (id, nome, comprado, adicionado_por) VALUES
  (1, 'Banana', FALSE, 2),
  (2, 'Café', TRUE, 1);
