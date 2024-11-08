import Source from "../src/models/expenses/sourceModel"


const migrateSource = async () => {


    const sources = await Source.find()

    for (let i = 0; i < sources.length; i++) {

        let id = sources[i].id

        console.log(id)

        sources[i].id = [sources[i].id[0]]
        console.log("Migrated")
        await sources[i].save()

        console.log(i)

    }


}

export default migrateSource