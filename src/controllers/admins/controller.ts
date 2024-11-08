import adminAuthController from "./authController"
import adminGetHotelsController from "./getHotelsController"
import addHotelController from "./addHotelController"
import adminUploadMultipleImages from "./imageUploader"
import adminUpdateHotelController from "./updateHotelController"
import getAllManagersController from "./getAllManagersController"
import adminGetHotelsForAdminsController from "./getHotelsForAdminsController"
import updateManagerController from "./updateManagerController"
import updateLocationController from "./updateLocationController"
import getAllLocationController from "./getAllLocationController"
import getShowCaseImageController from "./getShowCaseImageController"
import getHotelsForShowCaseController from "./getHotelsForShowCaseController"

const adminController = {
    adminAuthController,
    adminGetHotelsController,
    addHotelController,
    adminUploadMultipleImages,
    adminUpdateHotelController,
    getAllManagersController,
    adminGetHotelsForAdminsController,
    updateManagerController,
    updateLocationController,
    getAllLocationController,
    getShowCaseImageController,
    getHotelsForShowCaseController
}

export default adminController