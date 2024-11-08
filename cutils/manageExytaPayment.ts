import HotelExpense from "../src/models/expenses/hotelExpenses"

const manageEPayment = async () => {

    const expenses = await HotelExpense.find({isPaid:false})

    for (let i = 0; i < expenses.length; i++) {
        const exp = expenses[i]
        exp.isPaid = Object.values(exp.breakup).reduce((acc, cur) => { return acc + cur }, 0) -
            exp.payment.reduce((acc, cur) => { return acc + cur.value }, 0) < 1
        await exp.save()
        console.log(i)
    }
    console.log("Done")

}

export default manageEPayment