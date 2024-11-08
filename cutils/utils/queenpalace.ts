import ItemFlow from "../../expense/src/utils/itemflow/ItemFlow"
import Bookings from "../../src/models/bookings/bookingModel"

const queenPalace = async () => {

    const bookings = await Bookings.find({
        userId: "653bf395a94c9e325e85716f",
        hasCheckedIn: true,
        checkIn: {
            $gt: new Date("2023-12-31T18:30:00.000Z")
        }
    })

    for(let i=0;i<bookings.length;i++){

        let book = bookings[i]
        await Promise.all(
            book.collections.map(async c => {
                return ItemFlow.deleteCollection(book.hotelId.toString(),c.colId)
            })
        )
        book.collections = []
        await book.save()
    }
    // console.log("done")

    



}

export default queenPalace