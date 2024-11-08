import Hotel from "../../src/models/hotels/hotelModel";
import Manager from "../../src/models/managers/managerSchema";

async function manageManager() {



    let ids = [
        "651a534993c668d6ebcbdb31",
        "650d4033f6ba8b434faa8560",
        ""
    ]
    const managers = await Manager.find({
        $expr: {
            $gt: [{ $size: "$permissions" }, 2]
        }
    })

    const hotels = await Hotel.find({})

    for (let i = 0; i < managers.length; i++) {

        // managers[i].permissions = hotels.map(hot => {
        //     return {
        //         "canCancelBooking": true,
        //         "canCheckInBooking": true,
        //         "canNoShowBooking": true,
        //         "canAssignRoom": true,
        //         "canUpdatePayment": true,
        //         "canShiftRoom": true,
        //         "canAddExtraPrice": true,
        //         "canCheckOutBooking": true,
        //         "canDeleteCollection": true,
        //         "canCreateBooking": true,
        //         "canViewAnalytics": true,
        //         "canViewBooking": true,
        //         "canViewBookingDetail": true,
        //         "canViewPricing": true,
        //         "canUpdatePricing": true,
        //         "canModifyAmount": true,
        //         "canModifyConvenienceFee": true,
        //         "canDeleteExtraCharge": true,
        //         "canPutCustomDate": true,
        //         "isTimeBounded": false,
        //         "canAddExpenser": true,
        //         "canApproveApproval": true,
        //         "canApprovePayment": true,
        //         "canViewExpenses": true,
        //         "canViewExpenser": true,
        //         "canViewCode": true,
        //         "canManageBanksAndPartners": true,
        //         hotel: hot._id
        //     }
        // })
        // await managers[i].save()
    }


}

export default manageManager