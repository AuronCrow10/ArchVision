import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listProjectsAdmin,
  createProjectAdmin,
  updateProjectAdmin,
  deleteProjectAdmin,
  getRenderCatalogAdmin,
  saveRenderCatalogAdmin,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', listUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/projects', listProjectsAdmin);
router.post('/projects', createProjectAdmin);
router.put('/projects/:id', updateProjectAdmin);
router.delete('/projects/:id', deleteProjectAdmin);

router.get('/render-catalog', getRenderCatalogAdmin);
router.put('/render-catalog', saveRenderCatalogAdmin);

export default router;
