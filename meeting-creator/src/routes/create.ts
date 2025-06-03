import { Router } from 'express';
import createController from '../controllers/createController';

const router = Router();

router.all('/create', createController.handleRequest);

export default router;
