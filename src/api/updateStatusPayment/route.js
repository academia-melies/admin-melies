import { api } from "../api";

export async function updateInstallmentStatus() {
    try {
        const result = await api.get('/cron/updateInstallment');
        console.log(result)
        return true
    } catch (error) {
        console.log(error)
        return error
    }
}