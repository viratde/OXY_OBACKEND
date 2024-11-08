import managerCreateBookingController from "./createBookingController"
import checkInAndCheckOutController from "./checkInAndCheckOutController"
import managerAssignRoom from "./managerAssignRoomController"
import managerCollectPayment from "./managerCollectPayment"
import managerAddExtraCharge from "./managerAddExtraChargeController"
import managerNoShowBooking from "./managerNoShowController"
import managerCancelBooking from "./managerCancelBookingController"
import managerGetUserData from "./managerGetUserData"
import managerDeleteCollectionController from "./managerDeleteCollectionController"
import managerDeleteExtraChargeController from "./managerDeleteExtraCharge"
import managerModifyAmount from "./managerModifyAmount"

const managerBookingActionController = {
    managerAssignRoom,
    managerCollectPayment,
    managerAddExtraCharge,
    managerNoShowBooking,
    managerCancelBooking,
    managerGetUserData,
    checkInAndCheckOutController,
    managerCreateBookingController,
    managerDeleteCollectionController,
    managerDeleteExtraChargeController,
    managerModifyAmount
}
export default managerBookingActionController