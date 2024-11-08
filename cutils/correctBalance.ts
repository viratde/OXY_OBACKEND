import Source from "../src/models/expenses/sourceModel"
import HotelTransction from "../src/models/expenses/transactionModel"



const correctBalance = async () => {

    const trans = await HotelTransction.aggregate([
        {
            $addFields: {
                amount: {
                    $cond: {
                        if: { $regexMatch: { input: "$type", regex: /^Incoming/ } },
                        then: "$amount",
                        else: {
                            $subtract: [0, "$amount"]
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: "$sourceRef",
                amount: {
                    $sum: "$amount"
                }
            }
        }
    ])

    


    for (let j = 0; j < trans.length; j++) {
        console.log(trans[j].amount)
        const sr = await Source.findOne({_id:trans[j]._id})
        if(sr){
            sr.value = Math.round(trans[j].amount * 100)/100
            await sr.save()
        }

    }
    console.log("done")


    // const allTrans = await HotelTransction.aggregate([
    //     {
    //         $lookup: {
    //             from: "sources",
    //             localField: "sourceRef",
    //             foreignField: "_id",
    //             as: "sources"
    //         }
    //     },
    //     {
    //         $unwind: "$sources"
    //     },
    //     {
    //         $match: {
    //             $expr: {
    //                 $ne: [{ $toString: "$sources.id" },{ $toString: "$entityRefId" }]
    //             }
    //         }
    //     },
    //     {
    //         $addFields:{
    //             name:"$sources.name"
    //         }
    //     }
    // ])

    // for (let i = 0; i < allTrans.length; i++) {
    //     const trans = allTrans[i]
    //     const source = await Source.findOne({name:trans.name,id:trans.entityRefId})
    //     const atrans = await HotelTransction.findOne({_id:trans._id})
    //     if(source && atrans){
    //         atrans.sourceRef = source._id
    //         await atrans.save()
    //     }


    // }

    

    console.log("Done")

}

export default correctBalance