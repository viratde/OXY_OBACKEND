import Entity from "../../expense/src/models/entity/entityModel"
import Transction from "../../expense/src/models/entity/transctionModel"
import AdvanceExpense from "../../expense/src/models/expenses/advanceExpense"
import FixedExpense from "../../expense/src/models/expenses/fixedExpenses"
import RecurringMetered from "../../expense/src/models/expenses/recurringMeteredExpense"
import RecurringNonMeteredExpense from "../../expense/src/models/expenses/recurringNonMeteredExpense"
import IEntityTransTypes from "../../expense/src/types/EntityItems/EntityTransTypes"
import IApprovalMethod from "../../expense/src/types/ExpenseCommon/ApprovalMethod"
import ApprovalStatus from "../../expense/src/types/ExpenseCommon/ApprovalStatus"
import roundTwoDecimalPlaces from "../../expense/src/utils/common/roundTwoDecimalPlaces"


const automaticPayment = async (
    entityId: string,
) => {


    const fExpense = await FixedExpense.deleteMany({
        expenseEntityId: entityId,
        expenseCreatedAt: {
            $gte: new Date("2023-12-31T18:30:00.000Z"),
            $lte: new Date("2024-01-19T18:30:00.000Z")
        },
        expenseStatus: {
            $in: [ApprovalStatus.APPROVED,]
        }
    })

    const advExpense = await AdvanceExpense.deleteMany({
        expenseEntityId: entityId,
        expenseCreatedAt: {
            $gte: new Date("2023-12-31T18:30:00.000Z"),
            $lte: new Date("2024-01-19T18:30:00.000Z")
        },
        expenseStatus: {
            $in: [ApprovalStatus.APPROVED,]
        }
    })

    const rExpense = await RecurringMetered.deleteMany({
        expenseEntityId: entityId,
        expenseCreatedAt: {
            $gte: new Date("2023-12-31T18:30:00.000Z"),
            $lte: new Date("2024-01-19T18:30:00.000Z")
        },
        expenseStatus: {
            $in: [ApprovalStatus.APPROVED,]
        }
    })

    const rMNExpense = await RecurringNonMeteredExpense.deleteMany({
        expenseEntityId: entityId,
        expenseCreatedAt: {
            $gte: new Date("2023-12-31T18:30:00.000Z"),
            $lte: new Date("2024-01-19T18:30:00.000Z")
        },
        expenseStatus: {
            $in: [ApprovalStatus.APPROVED,]
        }
    })


    // for (let i = 0; i < allExpenses.length; i++) {

    //     let exp = allExpenses[i]
    //     exp.expenseStatus = ApprovalStatus.APPROVED
    //     exp.expenseApprovals = []
    //     await exp.save()

    // }

    console.log(fExpense,rExpense,rMNExpense,advExpense)

}

export default automaticPayment