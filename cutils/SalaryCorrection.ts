import HotelExpense from "../src/models/expenses/hotelExpenses"
import IExpense from "../src/types/expenses/expenses/expense"



const SalaryCorrections = async () => {

    const expenses: any[] = await HotelExpense.aggregate(
        [
            {
                $match: {
                    category: "Salary"
                }
            },
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            date: "$createdAt",
                            format: "%Y-%m-%d",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            {
                $match: {
                    date: "2024-04-30",
                    category: "Salary"
                }
            }
        ]
    )

    for (let i = 0; i < expenses.length; i++) {
        const expense = await HotelExpense.findOne({
            _id: expenses[i]._id
        })
        if (expense) {
            expense.isAdvance = false
            expense.wasAdvance = false
            expense.isPayable = true
            await expense.save()
        }
        console.log(i)
    }
}

export default SalaryCorrections