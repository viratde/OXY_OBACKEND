import { Router } from "express";

const nUserRoutes = Router()
import nUserActionController from "../controllers/nUserActions/nUserActionController";
import userAuthentication from "../utils/authentication/userAuthentication";


nUserRoutes.get("/hotels",nUserActionController.getHotelsController)

nUserRoutes.get("/hotel/:hotelId",nUserActionController.getHotelDetailsController)

nUserRoutes.get("/price/:hotelId",nUserActionController.getHotelPriceController)

nUserRoutes.get("/search",nUserActionController.getSearchResultsController)

nUserRoutes.get("/bookings",userAuthentication,nUserActionController.getBookingsController)

nUserRoutes.get("/hero",nUserActionController.getHeroImageController)

nUserRoutes.get("/mostVisitedHotels",nUserActionController.getMostVisitedHotelController)

export default nUserRoutes