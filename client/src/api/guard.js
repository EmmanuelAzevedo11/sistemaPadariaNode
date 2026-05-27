(function verificarAcesso() {
    const token = localStorage.getItem('@padaria:token');

    if (!token) {
        alert("Acesso neg Dropped! Por favor, faça login para acessar o sistema. 🔒");
        window.location.href = './index.html';
    }
})();