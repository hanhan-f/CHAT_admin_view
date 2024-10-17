import axios, { AxiosError, AxiosRequestConfig } from 'axios'

/**
 * 
 * @param status 错误处理器
 * @param info 
 */
const errorHander = (status: any, info: any) => {
    console.log(status, info)
}


//创建axios实例
const instance = axios.create({
    timeout: 500000,
    baseURL: 'http://127.0.0.1:8000/api'
})

async function refreshToken() {
    let res = null;
    try {
        res = await instance.get('/user/refreshToken', {
            headers: {
                'l-access': localStorage.getItem('refresh_token') || ''
            }
        });
        localStorage.setItem('access_token', res.data.data.token);
        localStorage.setItem('refresh_token', res.data.data.l_token);
    } catch (e) {
        console.log("登录过期");
        return Promise.reject(e); // 抛出异常
    }
    return res;
}

interface PendintTask {
    config: AxiosRequestConfig,
    resolve: Function
}
let refreshing = false
const queue: PendintTask[] = [];

/**
 * 创建拦截器
 */
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.access = token
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    response => response.status === 200 ? Promise.resolve(response) : Promise.reject(response),
    async error => {
        console.log(error)
        const { config, data } = error.response
        //token刷新过程中保存的请求队列
        if (refreshing) {
            return new Promise((resolve) => {
                queue.push({
                    config,
                    resolve
                })
            })
        }

        if (error.response.status === 401 && !config.url.includes('/refreshToken')) {
            refreshing = true;
            try {
                const res = await refreshToken();
                if(res.status === 200)
                // 处理队列中的任务
                queue.forEach(({ config, resolve }) => {
                    resolve(instance(config)); // 重新执行请求
                });
                refreshing = false;

                return instance(config); // 重新执行原始请求
            } catch (err) {
                console.log('登录过期，需重新登录');
                refreshing = false;
                return Promise.reject(err); // 抛出异常
            }
        }

        if (error.response.status === 401 && config.url.includes('/refreshToken')){
            console.log('登录过期')
        }

    }
)

export default instance;
