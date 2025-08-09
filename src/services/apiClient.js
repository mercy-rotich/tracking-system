import axios from 'axios'
import authService from './authService'


const apiClient = axios.create({
    baseURL:import.meta.env.VITE_BASE_URL,
    timeout:3000,
    headers:{
        'Content-Type': 'application/json',
    },
});


apiClient.interceptors.request.use(
    async(config) =>{
        try{
            const token = authService.getToken();

            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }

            console.log('API Request',{
                method:config.method?.toUpperCase(),
                url:config.url,
                data:config.data instanceof FormData ? 'FormData' : config.data
            });
            return config;
        }catch(error){
            console.error('Request interceptor error:',error);
            return Promise.reject(error);
        }
    },
    (error)=>{
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

//response interceptor for handling responses and errors
apiClient.interceptors.response.use(
    (response)=>{
        console.log('API Response:',{
            status:response.status,
            url:response.config.url,
            data:response.data
        });
        return response;
    },
    async(error)=>{
        const originalRequest = error.config;

        if(error.response?.status === 401 & !originalRequest._retry){
            originalRequest._retry = true;
            try{
                const newToken = await authService.refreshToken();

                if(newToken){
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            }catch(refreshError){
                console.error('Token refresh failed:', refreshError);

                return Promise.reject(refreshError);
            }
        }

        const errorResponse ={
            message: 'An unexpected error occured',
            status:error.response?.status,
            data:error.response?.data
        }

        if(error.response){
            const {status,data} = error.response;

            switch(status){
                case 400:
          errorResponse.message = data?.message || 'Bad request - please check your input';
          break;
        case 401:
          errorResponse.message = 'Unauthorized - please log in again';
          break;
        case 403:
          errorResponse.message = 'Forbidden - you don\'t have permission for this action';
          break;
        case 404:
          errorResponse.message = 'Resource not found';
          break;
        case 422:
          errorResponse.message = data?.message || 'Validation error - please check your input';
          break;
        case 500:
          errorResponse.message = 'Server error - please try again later';
          break;
        default:
          errorResponse.message = data?.message || `Request failed with status ${status}`;
            }
        }else if(error.request){
            //newtwork error
            errorResponse.data.message = 'Network error - please check your connection';

        }console.error('API Error: ',errorResponse);
        return Promise.reject(errorResponse);
    }
);
export default apiClient;