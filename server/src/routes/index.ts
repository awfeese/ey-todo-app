import express from "express";
import taskRoutes from './task-routes';
import userRoutes from './user-routes';

const router = express.Router();

router.use('/auth', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
