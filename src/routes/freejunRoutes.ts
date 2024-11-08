import { Router } from "express";
import freeJunController from "../controllers/freejun/freeJunController";

const freeJunRouter = Router()

freeJunRouter.post("/webhook",freeJunController.processWebhookController)

export default freeJunRouter
