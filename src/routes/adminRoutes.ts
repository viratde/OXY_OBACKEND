import adminController from "../controllers/admins/controller";
import { Router } from "express";
import adminAuthentication from "../utils/authentication/adminAuthentication";

const adminRouter = Router()

adminRouter.post("/auth",adminController.adminAuthController)
adminRouter.post("/getHotels",adminAuthentication,adminController.adminGetHotelsController)
adminRouter.post("/addHotel",adminAuthentication,adminController.addHotelController)

adminRouter.post("/upload",adminAuthentication,adminController.adminUploadMultipleImages)

adminRouter.post("/updateHotel",adminAuthentication,adminController.adminUpdateHotelController)


adminRouter.post("/getHotel",adminController.adminGetHotelsController)

adminRouter.post("/getAdminHotels",adminAuthentication,adminController.adminGetHotelsForAdminsController)

adminRouter.post("/getAllManagers",adminAuthentication,adminController.getAllManagersController)

adminRouter.post("/updateManager",adminAuthentication,adminController.updateManagerController)

adminRouter.post("/getAllLocations",adminAuthentication,adminController.getAllLocationController)

adminRouter.post("/updateLocation",adminAuthentication,adminController.updateLocationController)

adminRouter.post("/images",adminController.getShowCaseImageController)

adminRouter.post("/showCaseHotels",adminController.getHotelsForShowCaseController)

export default adminRouter