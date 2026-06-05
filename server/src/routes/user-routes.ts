import { Router } from 'express';
import userController from '../controllers/user-controller';
import { validateLogin } from '../models/user';

const router = Router();

router.post('/login', validateLogin, userController.login);

export default router;
