const form = document.getElementById('formLogin');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('senha').value;

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                senha: senhaDigitada
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem('@padaria:token', dados.token);

            window.location.href = './dashboard.html';
        } else {
            alert(dados.message || "Erro ao fazer login.");
        }
    } catch (err) {
        alert("Erro ao conectar com o servidor backend.");
    }
});