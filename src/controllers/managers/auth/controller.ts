import managerAuthController from "./authController"
import verifyTokenController from "./verifyTokenController"
import managerGetPermissionController from "./managerGetPermissions"

const managerBookingAuthController = {
    managerAuthController,
    verifyTokenController,
    managerGetPermissionController,
}

export default managerBookingAuthController