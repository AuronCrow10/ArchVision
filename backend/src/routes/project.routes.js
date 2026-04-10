import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listProjects, createProject, getProject, updateProject, deleteProject } from '../controllers/project.controller.js';

const router = Router();
router.use(authenticate);

router.get('/',      listProjects);
router.post('/',     createProject);
router.get('/:id',   getProject);
router.put('/:id',   updateProject);
router.delete('/:id', deleteProject);

export default router;
