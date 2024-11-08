import axios, { AxiosError } from "axios"

const TaskRequester = async (
    route: string,
    token: string,
    data: any,
    method: "GET" | "POST"
) => {
    try {
        const response = await axios({
            method: method,
            url: route,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            data: data
        })
        return response.data
    } catch (error) {
        const err = error as AxiosError
        return err.response ? (err.response.data ? err.response.data : {}) : {}
    }
}

export default TaskRequester