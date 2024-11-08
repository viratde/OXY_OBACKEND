import HotelExpense from "../src/models/expenses/hotelExpenses"
import HotelTransction from "../src/models/expenses/transactionModel"
import IEntityTransTypes from "../src/types/expenses/transactions/EntityTransTypes"
import managePayable from "../src/utils/expense/expenses/managePayable"



const findAllPaybales = async () => {

    const hotelExpenses = await HotelExpense.find({
        isAdvance: false,
        isExchange: false,
        isParentCompanyPayment: false,
        isExpenserToBusinessLoan: false,
        isNotApproved: false,
        isApproved: true
    })

    console.log(hotelExpenses.length)

    for (let i = 0; i < hotelExpenses.length; i++) {

        const expense = hotelExpenses[i]

        const transaction =await managePayable(expense)

        if(transaction){
            console.log(i,"Yes")
        }else{
            console.log(i,"Noy")
        }
        
    }
}

export default findAllPaybales