/**
 * Axios customized types
 */
import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        /**
         * 约定的老接口 ontent-Type=application/x-www-form-urlencoded
         */
        CONTENT_TYPE?: string;
    }
}