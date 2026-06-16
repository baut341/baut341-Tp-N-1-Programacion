const Auth = {
    getUser: () => JSON.parse(localStorage.getItem('lyl_user') || 'null'),
    getToken: () => localStorage.getItem('lyl_token') || '',
    isLoggedIn: () => !!localStorage.getItem('lyl_token'),
    isAdmin: () => {
        const user = Auth.getUser();
        return user && user.rol === 'admin';
    },
    login: (user, token) => {
        localStorage.setItem('lyl_user', JSON.stringify(user));
        localStorage.setItem('lyl_token', token);
    },
    logout: () => {
        localStorage.removeItem('lyl_user');
        localStorage.removeItem('lyl_token');
    }
};
