import express from "express";
import logRoutes from './log-routes';
import taskRoutes from './task-routes';
import userRoutes from './user-routes';

const router = express.Router();

router.use('/auth', userRoutes);
router.use('/logs', logRoutes);
router.use('/tasks', taskRoutes);

export default router;
