import { Router } from 'express';
import { atualizarItem, buscarItem, criarItem, excluirItem, listarItens, registrarConsumo } from '../controllers/itensController.js';

const router = Router();

// Entrega 2: rotas ainda abertas. Na Entrega 3 entram os middlewares de JWT e de nível:
// consultar e registrar consumo para quem estiver logado; alterar o cadastro só para o responsável.
router.get('/', listarItens);
router.get('/:id', buscarItem);
router.post('/', criarItem);
router.put('/:id', atualizarItem);
router.delete('/:id', excluirItem);
router.patch('/:id/consumo', registrarConsumo);

export default router;
