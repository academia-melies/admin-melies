import axios from 'axios'

//LOCAL
export const api = axios.create({
    baseURL: 'http://localhost:3000',
})

//QUENTE
// export const api = axios.create({
//     baseURL: 'https://melies-api.onrender.com',
// })

