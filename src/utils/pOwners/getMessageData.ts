import { Types } from "mongoose"
import calculateRevenueCollectionAndExpense from "./calculateRevenueCollectionAndExpense"
import decideDefaultDate from "./decideDefaultDate"
import getAllOwnersWithPhoneNumebersAndProperty from "./getAllOwnersWithPhoneNumebersAndProperty"
import Hotel from "../../models/hotels/hotelModel"
import sendOwnerMessages from "./sendOwnerMessages"
import moment from "moment"



const getMessageData = async () => {

    const allManagers = await getAllOwnersWithPhoneNumebersAndProperty()
    const date = decideDefaultDate()
    const allHotelIds = allManagers.reduce((acc, cur) => {
        return [...acc, ...cur.hotelIds]
    }, [] as Types.ObjectId[])
    const data = await calculateRevenueCollectionAndExpense(
        allHotelIds,
        date
    )
    const hotelDetails = await Hotel.find(
        {
            _id: {
                $in: allHotelIds
            },

        },
        "hotelName"
    )

    let dataToSend: {
        hotelName: string,
        revenue: {
            Oxy: string,
            Ota: string,
            CFEE: string,
            XCR: string,
            GST: string,
            Total: string
        },
        collection: {
            Cash: string,
            Ota: string,
            Bank: string,
            Total: string,
        },
        expense: string,
        date: string,
        phoneNumber: string,
    }[] = []

    for (let i = 0; i < allManagers.length; i++) {
        const manager = allManagers[i]
        for (let j = 0; j < manager.hotelIds.length; j++) {
            const hotelId = manager.hotelIds[j].toString()
            const hotel = hotelDetails.find(hotel => hotel._id.toString() === hotelId)
            if (!hotel) {
                continue
            }
            const revenue = data.revenue[hotelId][date][0] as { [key: string]: any }
            const collection = data.collection[hotelId][date][0] as { [key: string]: number }
            const expense = data.expense[hotelId][date] as number

            dataToSend.push({
                hotelName: hotel.hotelName,
                revenue: {
                    Oxy: revenue.XBR.toFixed(2),
                    Ota: revenue.OBR.toFixed(2),
                    CFEE: revenue.CFEE.toFixed(2),
                    XCR: (revenue.OECR + revenue.XECR).toFixed(2),
                    GST: revenue.GST.toFixed(2),
                    Total: (revenue.XBR + revenue.OBR + revenue.CFEE + revenue.OECR + revenue.XECR + revenue.GST).toFixed(2)
                },
                collection: {
                    Cash: collection.Cash.toFixed(2),
                    Ota: collection.Ota.toFixed(2),
                    Bank: collection.Bank.toFixed(2),
                    Total: (collection.Cash + collection.Ota + collection.Bank).toFixed(2),
                },
                expense: expense.toFixed(2),
                date: moment(date, "DD-MM-YYYY").format("DD MMM YYYY"),
                phoneNumber: manager.phoneNumber
            })
        }
    }

    sendOwnerMessages(dataToSend)

    console.log("Sent All Messages")
}

export default getMessageData;