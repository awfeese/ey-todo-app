import { Router } from "express";
import taskController from "../controllers/task-controller";
import { authenticate } from "../middleware/auth";
import { validateTask } from "../models/task";

const router = Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/order', taskController.orderTasks);
router.post('/', validateTask, taskController.addTask);
router.get('/:id', taskController.getTask);
router.put('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
