import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../utils/upload.js';
import {
  getRenderCatalog,
  listRenders,
  getRender,
  uploadFiles,
  getCleanupPreview,
  runComposite,
  runGenerate,
  deleteRender,
} from '../controllers/render.controller.js';

const router = Router();
router.use(authenticate);

router.get('/catalog',             getRenderCatalog);
router.get('/',                  listRenders);
router.get('/:id',               getRender);
router.post('/upload',           upload.fields([{ name: 'prospetto', maxCount: 1 }, { name: 'location', maxCount: 1 }]), uploadFiles);
router.post('/:id/cleanup-preview', getCleanupPreview);
router.post('/:id/composite',    runComposite);
router.post('/:id/generate',     runGenerate);
router.delete('/:id',            deleteRender);

export default router;
