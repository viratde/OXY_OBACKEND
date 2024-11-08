import { Router } from "express";

const portfolioRouter = Router()
import portfolioController from "../controllers/portfolio/portfolioController";

portfolioRouter.post("/",portfolioController.portfolioSaveDataController)


export default portfolioRouter