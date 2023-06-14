import { api } from "../api/api";

export const getUsersPerfil = async (perfil) => {

    let query = `?perfil=${perfil}`;

    try {
       const response = await api.get(`/users/perfil${query}`)
       return response
    } catch (error) {
       return error
    }
 }

 export const createUser = async (userData) => {
   try {
      const response = await api.post('/user', { userData })
      return response
   } catch (error) {
      return error
   }
}

export const deleteUser = async (id) => {
   try {
      const response = await api.delete(`/user/delete/${id}`)
      return response
   } catch (error) {
      console.log(error.response.data)
      return error
   }
}

export const editeUser = async ({ id, userData }) => {
   try {
      const response = await api.patch(`/user/${id}`, { userData })
      return response
   } catch (error) {
      return error?.response
   }
}