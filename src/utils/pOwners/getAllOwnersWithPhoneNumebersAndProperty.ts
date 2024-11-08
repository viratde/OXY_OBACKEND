import { Types } from "mongoose"
import Manager from "../../models/managers/managerSchema"


const getAllOwnersWithPhoneNumebersAndProperty = async () => {

    const managers = await Manager.find(
        {
            "permissions.isPropertyOwner": true
        },
        "phoneNumber permissions name"
    )

    let allManagers: {
        name: string,
        phoneNumber: string,
        hotelIds: Types.ObjectId[]
    }[] = []

    for (let i = 0; i < managers.length; i++) {
        const manager = managers[i]
        allManagers.push({
            name: manager.name,
            phoneNumber: manager.phoneNumber,
            hotelIds: manager.permissions.filter(perm => perm.isPropertyOwner).map(perm => perm.hotel as Types.ObjectId)
        })
    }

    return allManagers
}

export default getAllOwnersWithPhoneNumebersAndProperty;