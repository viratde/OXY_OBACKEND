import Hotel from "../src/models/hotels/hotelModel"
import util from "util"
import findProfitAndLossAnalytics from "../src/utils/profiltAndLoss/findProfitAndLossAnalytics"
import findExpenseAnalytics from "../src/utils/expense/analytics/findExpenseAnalytics"


const profitAndLoss = async () => {

    const hotels = await Hotel.find({ hotelName: "Oxy Corporations" })
    let isTable = false

    const data = await findExpenseAnalytics(
        "01-01-2024",
        2,
        true,
        hotels.map(h => h._id)
    )

    console.log(util.inspect(data,{depth:null}))
}

export default profitAndLoss