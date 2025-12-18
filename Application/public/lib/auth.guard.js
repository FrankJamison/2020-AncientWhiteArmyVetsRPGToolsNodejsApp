(() => {
    if (!authService.isAuth() || authService.isTokenExpired()) {
        alert('Log in to use the website.');
        authService.logout();
    }
})();