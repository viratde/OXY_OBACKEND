import moment from "moment-timezone"
import HotelTransction from "../src/models/expenses/transactionModel"


const deleteOldTransactions = async () => {

    const date = moment.tz("01-04-2024-00-00-00", "DD-MM-YYYY-HH-mm-ss", "Asia/Kolkata").toDate()

    console.log(date)
    const transactions = await HotelTransction.deleteMany({
        date: {
            $lt: date
        }
    })

    console.log(transactions.deletedCount)
}

export default deleteOldTransactions