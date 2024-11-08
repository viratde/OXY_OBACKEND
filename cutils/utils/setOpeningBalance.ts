import moment from "moment"
import Entity from "../../expense/src/models/entity/entityModel"
import Transction from "../../expense/src/models/entity/transctionModel"
import IEntityTransTypes from "../../expense/src/types/EntityItems/EntityTransTypes"
import findOpeingBalanceByDate from "../../expense/src/utils/transctions/findOpeingBalanceByDate"

let data: (string | number)[][] = [
    // ['OxyHotels', 0, 0, 0],
    ['OXY RUDRA INN', 0, 0, 0],
    ['OXY PARADISE HARMU', 0, 0, 0],
    ['OXY KINGS INN', 0, 0, 0],
    // ['OXY DREAM INN', 2034, 0, 0],
    // ['OXY SHIVANI', 45, 0, 0],
    ['OXY HERITAGE ', 559, 0, 0],
    // ['OXY PRASHANT', 509, 0, 0],
    ['OXY DELIGHT', 22, 0, 0],
    ['OXY RITZ', 0, 0, 0],
    // ['OXY RR RESIDENCY', 0, 0, 0],
    ['OXY QUEEN PALACE', 43658, 0, 0],
    // ['Oxy Corporations', 56435, 35175.36, 0],
    // ['Oxy Consultancy Services', 0, 0, 0]
]

const setClosingBalance = async (
    date: string
) => {

    for (let i = 0; i < data.length; i++) {


        const entity = await Entity.findOne({ entityName: data[i][0] })
        const tDate = moment.tz(date, "DD-MM-YYYY", "Asia/Kolkata").subtract(1, "day").toDate()
        if (!entity) {
            continue
        }

        const openingBalance = await findOpeingBalanceByDate(
            date,
            [entity.entityId]
        )
        console.log(openingBalance, entity.entityName)

        var cashDiff = openingBalance[0].cash - (data[i][1] as number)
        var bankDiff = openingBalance[0].bank - (data[i][2] as number)

        if (cashDiff != 0) {

            await Transction.create({
                entityId: entity.entityId,
                entityRefId: entity._id,
                transction: {
                    type: cashDiff > 0 ? IEntityTransTypes.OutgoingOthers : IEntityTransTypes.IncomingOthers,
                    payment: {
                        cash: cashDiff > 0 ? cashDiff : -cashDiff,
                        bank: 0,
                        ota: 0
                    },
                    date: tDate
                },
                date: tDate
            })
            
        }
        if (bankDiff != 0) {



            await Transction.create({
                entityId: entity.entityId,
                entityRefId: entity._id,
                transction: {
                    type: bankDiff > 0 ? IEntityTransTypes.OutgoingOthers : IEntityTransTypes.IncomingOthers,
                    payment: {
                        cash: 0,
                        bank: bankDiff > 0 ? bankDiff : -bankDiff,
                        ota: 0
                    },
                    date: tDate
                },
                date: tDate
            })
        
        }
        // if (data[i][3] as number > 0) {
        //     await Transction.create({
        //         entityId: entity.entityId,
        //         entityRefId: entity._id,
        //         transction: {
        //             type: IEntityTransTypes.IncomingOthers,
        //             payment: {
        //                 cash: 0,
        //                 bank: 0,
        //                 ota: data[i][3]
        //             },
        //             date: tDate
        //         },
        //         date: tDate
        //     })
        // }

        entity.entityCash = entity.entityCash - cashDiff
        entity.entityBank = entity.entityBank - bankDiff

        // entity.entityOta = entity.entityOta + (data[i][3] as number)
        await entity.save()
    }

}

export default setClosingBalance