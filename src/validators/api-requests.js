import { api } from "../api/api";

export const getUsersPerfil = async (perfil) => {

    let query = `?perfil=${perfil}`;

    try {
       const response = await api.get(`/users/perfil${query}`)
       console.log(response)
       return response
    } catch (error) {
       return error
    }
 }