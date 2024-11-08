import { Router } from "express";
import whatsappController from "../controllers/whatsapp/whatsappController";


const whatsappRouter = Router()


whatsappRouter.get("/whatsappWebhook",whatsappController.verifyWhatsappTokenController)

whatsappRouter.post("/whatsappWebhook",whatsappController.processWhatsappMessageController)

export default whatsappRouter