import moment from "moment"
import HotelTransction from "../src/models/expenses/transactionModel"
import Hotel from "../src/models/hotels/hotelModel"
import IEntityTransTypes from "../src/types/expenses/transactions/EntityTransTypes"
import Source from "../src/models/expenses/sourceModel"


const createOpeningBalance = async (
    amount: number,
    hotelId: string,
    sourceName:string,
    date:string
) => {

    const hotel = await Hotel.findById(hotelId)

    if (hotel) {

        const source = await Source.findOne({
            name: sourceName,
            id: hotel._id
        })

        if (source) {

            const trans = await HotelTransction.create({
                type: IEntityTransTypes.IncomingOthers,
                entityRefId: hotel._id,
                expenseRefId: hotel._id,
                expenseId: "OPENING",
                date: moment.tz(date, "DD-MM-YYYY", "Asia/Kolkata").toDate(),
                sourceRef: source._id,
                amount:amount
            })

        }

    }else{
        console.log("hotel not found")
    }



    // if(!emm){

    // }else if(){

    // }
}

export const openingBalanceManager =async () => {

}

export default createOpeningBalance