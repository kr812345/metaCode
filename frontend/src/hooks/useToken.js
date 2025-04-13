import { useCookies } from 'react-cookie';

const useToken = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['token']);

    const getToken = () => {
        return cookies.token || null;
    };

    const setToken = (token) => {
        setCookie('token', token, { 
            path: '/', 
            maxAge: 7200, // 2 hours expiry
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
    };

    const removeToken = () => {
        removeCookie('token', { 
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
    };

    return {
        getToken,
        setToken,
        removeToken
    };
};

export default useToken;
