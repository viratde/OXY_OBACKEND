import { Router } from "express";
import managerAuthentication from "../utils/authentication/managerAuthentication";
import taskController from "../controllers/taskManager/taskController";

const taskRouter = Router()


taskRouter.get("/company",managerAuthentication,taskController.managerGetCompanyController)

taskRouter.post("/company",managerAuthentication,taskController.managerCreateCompanyController)

taskRouter.get("/users",managerAuthentication,taskController.managerGetUsersController)

taskRouter.post("/users",managerAuthentication,taskController.managerCreateUserController)

taskRouter.post("/notifier",taskController.managerHandleNotifications)

export default taskRouter