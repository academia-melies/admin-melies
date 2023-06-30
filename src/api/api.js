import axios from 'axios'

//LOCAL
export const api = axios.create({
   // baseURL: 'http://localhost:3000',
   baseURL: process.env.NEXT_PUBLIC_API_URL
})

//QUENTE

//  export const api = axios.create({
//      baseURL: 'https://melies-api.onrender.com',
//  })

