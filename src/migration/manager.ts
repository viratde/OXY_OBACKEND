// import hotels from "./hotel.json";

// import Hotel from "../models/hotels/hotelModel";
// import Room from "../models/hotels/roomSchema";
// import IRoom from "../types/hotels/room";
// import IReview from "../types/hotels/review";
// import Review from "../models/hotels/reviewModel";
// import mongoose from "mongoose";
// import Manager from "../models/managers/managerSchema";

// const run = async () => {
//   let connection = await mongoose.connect(
//     "mongodb://127.0.0.1:27017/OxyTsTestDatabase"
//   );
//   console.log(
//     "Database Connected Successfully at",
//     connection.connection.host,
//     connection.connection.port
//   );
// };

// run();


// async function managerming(){

//     const hotels = await Hotel.find()
//     const managers = await Manager.findOne({phoneNumber:"+916202749693"})
//     if(!managers){
//         return
//     }
//     console.log(managers?.permissions)
//     const perms = hotels.map(hotel => {
//         return {
//             canCancelBooking: true,
//             canCheckInBooking: true,
//             canNoShowBooking: true,
//             canAssignRoom: true,
//             canUpdatePayment: true,
//             canShiftRoom: false,
//             canAddExtraPrice: true,
//             canCheckOutBooking: false,
//             canCreateBooking: false,
//             canViewAnalytics: true,
//             canViewBooking: true,
//             canViewBookingDetail: false,
//             canViewPricing: false,
//             canUpdatePricing: false,
//             canAddExpenser:true,
//             canApprovePayment: true,
//             canApproveApproval: true,
//             canMarkMetered: true,
//             canViewExpenser:true,
//             canViewExpenses:true,
//             hotel:hotel._id
//         }
//     })

//     managers.permissions = perms
//     await managers.save()
// }


// managerming()