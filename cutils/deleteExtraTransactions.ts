import HotelExpense from "../src/models/expenses/hotelExpenses"
import HotelTransction from "../src/models/expenses/transactionModel"


const deleteExtraTransactions = async () => {


    const trans = await HotelExpense.find()


    await Promise.all(
        trans.map(async (trans,index) => {

            for (let j = 0; j < trans.payment.length; j++) {

                for (let k = 0; k < trans.payment[j].transId.length; k++) {
                    let tId = trans.payment[j].transId[k]
                    const transs = await HotelTransction.findById(tId)
                    if (!transs) {
                        trans.deleteOne()
                        break
                    }
                
                }

            }

            console.log(index)
        })
    )

    console.log("Delete Done")



}

export default deleteExtraTransactions