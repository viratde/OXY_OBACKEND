import mongoose, { Types } from "mongoose";
import Manager from "../../src/models/managers/managerSchema";
import Hotel from "../../src/models/hotels/hotelModel";


// const run = async () => {
//     let connection = await mongoose.connect(
//         // "mongodb://127.0.0.1:27018/OxyTsTestDatabase"
//         "mongodb+srv://OxyHotels:710OxyHotels7029@oxy.rx2qy6q.mongodb.net/OxyTsTestDatabase"
//     );
//     console.log(
//         "Database Connected Successfully at",
//         connection.connection.host,
//         connection.connection.port
//     );
// };


// run()

// async function ssst() {

//     const managers = await Manager.find()

//     for (let i = 0; i < managers.length; i++) {
//         let man = managers[i]

//         man.permissions = man.permissions.map(perm => {
//             return {
//                 hotel: perm.hotel,
//                 canCancelBooking: true,
//                 canCheckInBooking: true,
//                 canNoShowBooking: true,
//                 canAssignRoom: true,
//                 canUpdatePayment: true,
//                 canShiftRoom: true,
//                 canAddExtraPrice: true,
//                 canCheckOutBooking: true,
//                 canDeleteCollection: true,
//                 canCreateBooking: true,
//                 canViewAnalytics: true,
//                 canViewBooking: true,
//                 canViewBookingDetail: true,
//                 canViewPricing: true,
//                 canUpdatePricing: true,

//                 canModifyAmount: false,
//                 canModifyConvenienceFee:false,
//                 canDeleteExtraCharge: false,
//                 canPutCustomDate: false,
//                 isTimeBounded: true,

//                 canAddExpenser: true,
//                 canApproveApproval: true,
//                 canApprovePayment: true,
//                 canViewExpenses: true,
//                 canViewExpenser: true,
//                 canViewCode:false,
//             }
//         })

//         await man.save()

//     }

// }



// async function work() {

//     const manager = await Manager.findOne({_id:"6520e6cb9869f7e12b5c51a2"})
//     if(!manager){
//         return
//     }
//     manager.permissions = manager.permissions.map(perm => {
//         return {
//             hotel:perm.hotel,
//             canCancelBooking: true,
//             canCheckInBooking: true,
//             canNoShowBooking: true,
//             canAssignRoom: true,
//             canUpdatePayment: true,
//             canShiftRoom: true,
//             canAddExtraPrice: true,
//             canCheckOutBooking: true,
//             canDeleteCollection:true,
//             canCreateBooking: true,
//             canViewAnalytics: true,
//             canViewBooking: true,
//             canViewBookingDetail: true,
//             canViewPricing: true,
//             canUpdatePricing: true,
//             canModifyAmount:true,
//             canModifyConvenienceFee:true,
//             canDeleteExtraCharge:true,
//             canPutCustomDate:true,
//             isTimeBounded:false,
//             canAddExpenser:true,
//             canApproveApproval:true,
//             canApprovePayment:true,
//             canViewExpenses:true,
//             canViewExpenser:true,
//             canViewCode:true,
//         }
//     })

//     await manager.save()


// }

async function allowManagerToExpense(

) {

    const managers = await Manager.find()

    console.log(managers.length)
    if (!managers) {
        return
    }

    for (let i = 0; i < managers.length; i++) {

        const manager = managers[i]
        manager.permissions = manager.permissions.map(perm => {
            return {
                ...perm,
                hotel:new Types.ObjectId(perm.hotel as Types.ObjectId)
            }
        })
        await manager.save()
        console.log(manager.name,i)
    }

}

export async function disablePropertyOwners(

) {

    const managers = await Manager.find()

    console.log(managers.length)
    if (!managers) {
        return
    }

    for (let i = 0; i < managers.length; i++) {

        const manager = managers[i]
        manager.permissions = manager.permissions.map(perm => {
            return {
                ...perm,
                hotel:new Types.ObjectId(perm.hotel as Types.ObjectId),
                isPropertyOwner:false
            }
        })
        await manager.save()
        console.log(manager.name,i)
    }

}

// work()
export default allowManagerToExpense

// ssst()