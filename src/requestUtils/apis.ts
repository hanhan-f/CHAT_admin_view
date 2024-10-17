import axios from './request'

const api = {
    login(data:any){
        return axios.post('/user/login',data)
    },
    getCode(data:any){
        return axios.post('/user/getCode',data)
    },
    enroll(data:any){
        return axios.post('/user/register',data)
    },
    searchUser(data:any){
        return axios.post('/user/searchUser',data)
    }
}

export default api;