import Bookings from "../src/models/bookings/bookingModel"
import HotelTransction from "../src/models/expenses/transactionModel"
import IEntityTransTypes from "../src/types/expenses/transactions/EntityTransTypes"


const deleteExtraCollections = async () => {

    const trans = await HotelTransction.find({
        type: IEntityTransTypes.IncomingService
    })

    console.log(trans.length)

    for (let i = 0; i < trans.length; i++) {

        const colId = trans[i].expenseId

        const booking = await Bookings.findOne({
            "collections.colId": colId
        })

        if (!booking) {
            await trans[i].deleteOne()
        }

    }

    console.log("Done")
}

export default deleteExtraCollections