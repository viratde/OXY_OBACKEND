import axios from "axios";

const BearerToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOWUzMTJkMC1lZGQzLTRjZWUtYmYzOS04M2YzM2RkMjQ3NzQiLCJ1bmlxdWVfbmFtZSI6InNlcnZpY2VAb3h5aG90ZWxzLmluIiwibmFtZWlkIjoic2VydmljZUBveHlob3RlbHMuaW4iLCJlbWFpbCI6InNlcnZpY2VAb3h5aG90ZWxzLmluIiwiYXV0aF90aW1lIjoiMTAvMDUvMjAyMyAwNzowODoyMSIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJ0ZW5hbnRfaWQiOiIyMDAxMzMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.FKRP35-tmHFLGDtTwpI_ValOa2y8uOr5Yd5P3rhu-jw"
const API_END_POINT = "https://live-mt-server.wati.io/200133"

const sendOwnerMessages = async (
    datas: {
        hotelName: string,
        revenue: {
            Oxy: string,
            Ota: string,
            CFEE: string,
            XCR: string,
            GST: string,
            Total: string
        },
        collection: {
            Cash: string,
            Ota: string,
            Bank: string,
            Total: string,
        },
        expense: string,
        date: string,
        phoneNumber: string,
    }[]
) => {

    await Promise.all(datas.map(async (data) => {
        const url = `${API_END_POINT}/api/v1/sendTemplateMessage?whatsappNumber=${data.phoneNumber}`;
        try {
            await axios({
                url: url,
                method: "POST",
                headers: {
                    "Authorization": BearerToken
                },
                data: {
                    template_name: 'oxyhotels_expense_and_revenue_deatils',
                    broadcast_name: 'Owner Expense Details',
                    parameters: [
                        { name: "2", value: data.hotelName },
                        { name: "15", value: data.date },
                        { name: "3", value: data.revenue.Oxy },
                        { name: "4", value: data.revenue.Ota },
                        { name: "5", value: data.revenue.CFEE },
                        { name: "6", value: data.revenue.XCR },
                        { name: "7", value: data.revenue.GST },
                        { name: "8", value: data.revenue.Total },
                        { name: "9", value: data.collection.Cash },
                        { name: "10", value: data.collection.Bank },
                        { name: "11", value: data.collection.Ota },
                        { name: "12", value: data.collection.Total },
                        { name: "14", value: data.expense },
                    ]
                }
            })
            return
        } catch (err) {
            console.log(err)
            return
        }
    }))

}

export default sendOwnerMessages;