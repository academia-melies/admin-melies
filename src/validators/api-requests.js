import { api } from "../api/api";

export const getUsersPerfil = async (perfil) => {

   let query = `?perfil=${perfil}`;

   try {
      if (perfil === 'todos') {
         const response = await api.get(`/users`)
         return response
      }
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
      const response = await api.patch(`/user/update/${id}`, { userData })
      return response
   } catch (error) {
      return error?.response
   }
}

export const editeEnrollment = async ({ id, enrollmentData }) => {

   try {
      const response = await api.patch(`/enrollment/update/${id}`, { enrollmentData })
      return response
   } catch (error) {
      return error?.response
   }
}

export const editContract = async ({ id, contract }) => {

   try {
      const response = await api.patch(`/contract/update/${id}`, { contract })
      return response
   } catch (error) {
      return error?.response
   }
}

export const createContract = async (id, contract) => {
   try {
      const response = await api.post(`/contract/create/${id}`, { contract })
      return response
   } catch (error) {
      return error
   }
}

export const createEnrollment = async (id, enrollmentData) => {
   try {
      const response = await api.post(`/enrollment/create/${id}`, { enrollmentData })
      return response
   } catch (error) {
      return error
   }
}

