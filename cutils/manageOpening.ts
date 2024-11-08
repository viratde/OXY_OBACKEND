import HotelExpense from "../src/models/expenses/hotelExpenses"
import HotelTransction from "../src/models/expenses/transactionModel"
import Hotel from "../src/models/hotels/hotelModel"
import IExpense from "../src/types/expenses/expenses/expense"


const manageOpening = async () => {

    const hotel = await Hotel.findOne({hotelName:"OXY PARADISE HARMU"})

    if (hotel) {

        const expenses = await HotelExpense.find({
            entityRefId: hotel._id
        })
        let data: { [key: string]: IExpense[] } = {}
        let gData = expenses.reduce((acc, cur) => {
            let stackName = cur.partnerRefId.toString() + cur.amount + cur.createdAt.toString()
            if (acc[stackName]) {
                acc[stackName] = [
                    ...(acc[stackName]),
                    cur
                ]
            } else {
                acc[stackName] = [cur]
            }
            return acc
        }, { ...data })
        const allPartners = Object.keys(gData)
        for (let i = 0; i < allPartners.length; i++) {

            const expense = gData[allPartners[i]]
            if (expense.length > 1) {
                const paym = expense[0].payment.map(a => a.transId).flat()
                const trasaction = await HotelTransction.deleteMany({
                    _id: {
                        $in:paym
                    }
                })
                const exp = await HotelExpense.deleteOne({ id: expense[0].id })
                console.log(trasaction,exp)
            }
        }

    } else {
        console.log("Hotel not found")
    }

}

export default manageOpening