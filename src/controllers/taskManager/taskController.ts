
import managerGetUsersController from "./managerGetUsersController";
import managerCreateUserController from "./managerCreateUserController";
import managerGetCompanyController from "./managerGetComapnyController";
import managerCreateCompanyController from "./managerCreateCompanyController";
import managerHandleNotifications from "./managerHandleNotifications";

const taskController = {
    managerCreateCompanyController,
    managerCreateUserController,
    managerGetCompanyController,
    managerGetUsersController,
    managerHandleNotifications
}

export default taskController