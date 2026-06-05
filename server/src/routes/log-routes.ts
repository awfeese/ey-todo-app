import { Router } from "express";
import logController from "../controllers/log-controller";

const router = Router();

router.post('/', logController.create);

export default router;
