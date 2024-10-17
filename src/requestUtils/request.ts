import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * 错误处理器
 * @param status 错误状态码
 * @param info 错误信息
 */
const errorHander = (status: any, info: any) => {
    console.log(status, info);
};

// 创建 axios 实例
const instance = axios.create({
    timeout: 500000,
    baseURL: 'http://127.0.0.1:8000/api',
});

// 刷新 token 函数
async function refreshToken() {
    try {
        const res = await instance.get('/user/refreshToken', {
            headers: {
                'l-access': localStorage.getItem('refresh_token') || '',
            },
        });
        localStorage.setItem('access_token', res.data.data.token);
        localStorage.setItem('refresh_token', res.data.data.l_token);
        return res;
    } catch (e) {
        console.log('登录过期，刷新 token 失败');
        return Promise.reject(e); // 抛出异常
    }
}

interface PendingTask {
    config: AxiosRequestConfig;
    resolve: Function;
    reject: Function;
}

// token 刷新状态和请求队列
let refreshing = false;
const queue: PendingTask[] = [];

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.access = token; // 设置 token
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => (response.status === 200 ? Promise.resolve(response) : Promise.reject(response)),
    async error => {
        const { config, response } = error;
        if (!response) return Promise.reject(error); // 确保有响应

        // 如果当前请求是刷新 token 请求
        if (response.status === 401 && config.url.includes('/refreshToken')) {
            console.log('刷新 token 失败，登录过期');
            alert('登录过期，请重新登录'); // 显示登录过期提示
            queue.forEach(({ reject }) => reject(error)); // 取消队列中的所有请求
            queue.length = 0; // 清空队列
            return Promise.reject(error); // 抛出异常
        }

        // 如果是其他请求的 401 错误
        if (response.status === 401 && !config.url.includes('/refreshToken')) {
            if (!refreshing) {
                refreshing = true; // 标记刷新中
                try {
                    const res = await refreshToken();
                    if (res.status === 200) {
                        // 重新执行队列中的请求
                        queue.forEach(({ config, resolve }) => {
                            resolve(instance(config));
                        });
                        queue.length = 0; // 清空队列
                        refreshing = false;
                        return instance(config); // 重新执行原始请求
                    }
                } catch (err) {
                    queue.forEach(({ reject }) => reject(err)); // 取消队列中的所有请求
                    queue.length = 0; // 清空队列
                    refreshing = false;
                    return Promise.reject(err); // 抛出异常
                }
            }

            // 将当前请求加入队列
            return new Promise((resolve, reject) => {
                queue.push({ config, resolve, reject });
            });
        }

        return Promise.reject(error); // 处理其他错误
    }
);

export default instance;
