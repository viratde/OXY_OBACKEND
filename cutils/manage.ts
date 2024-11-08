
import HotelTransction from "../src/models/expenses/transactionModel";

const manageTransaction = async (

) => {

    const transactions = await HotelTransction.aggregate([
        {
            $match: {
                type: {
                    $nin: ["IncomingService"]
                },
                expenseId: {
                    $ne: "OPENING"
                }
            }
        },
        {
            $lookup: {
                localField: "expenseId",
                foreignField: "id",
                from: "hotelexpenses",
                as: "expenses"
            }
        },
        {
            $match: {
                expenses: []
            }
        }
    ])

    const t = await HotelTransction.deleteMany({
        _id: {
            $in: transactions.map(t => t._id)
        }
    })
    console.log(t)
    console.log(transactions.length)

}

export default manageTransaction