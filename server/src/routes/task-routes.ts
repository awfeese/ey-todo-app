import { Router } from "express";
import taskController from "../controllers/task-controller";
import { authenticate } from "../middleware/auth";
import { validateTask, validateTaskOrder } from "../models/task";

const router = Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/order', validateTaskOrder, taskController.orderTasks);
router.post('/', validateTask, taskController.addTask);
router.get('/:id', taskController.getTask);
router.put('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
