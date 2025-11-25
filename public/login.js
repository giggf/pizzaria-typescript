document.addEventListener('DOMContentLoaded', () => {
    // Vistas e formulários
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');

    // Links para alternar entre vistas
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Modal "Quem Somos"
    const quemSomosModal = document.getElementById('quem-somos-modal');
    const quemSomosBtn = document.getElementById('quem-somos-btn');
    
    // Verifica se o modal existe antes de buscar o botão de fechar (para evitar erros)
    const closeModal = quemSomosModal ? quemSomosModal.querySelector('.close-button') : null;

    // Garante que o status message comece invisível
    if(statusMessage) {
        statusMessage.style.display = 'none';
        statusMessage.textContent = '';
    }

    // --- NOVA LÓGICA: MÁSCARA DE TELEFONE ---
    const registerTelefoneInput = document.getElementById('register-telefone');
    if (registerTelefoneInput) {
        registerTelefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove letras/símbolos
            if (value.length > 11) value = value.slice(0, 11); // Limita tamanho

            // Cria a formatação (XX) XXXXX-XXXX
            let formattedValue = value;
            if (value.length > 2) {
                formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }
            if (value.length > 7) {
                formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
            
            e.target.value = formattedValue;
        });
    }

    // --- Funções para alternar formulários ---
    if(showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'block';
            statusMessage.style.display = 'none';
            statusMessage.textContent = '';
        });
    }

    if(showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
            statusMessage.style.display = 'none';
            statusMessage.textContent = '';
        });
    }
    
    // --- Lógica do Modal (só adiciona se os elementos existirem) ---
    if(quemSomosBtn && quemSomosModal) {
        quemSomosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            quemSomosModal.style.display = 'flex';
        });
    }
    if(closeModal) {
        closeModal.addEventListener('click', () => {
            quemSomosModal.style.display = 'none';
        });
    }
    if(quemSomosModal) {
        window.addEventListener('click', (e) => {
            if (e.target === quemSomosModal) {
                quemSomosModal.style.display = 'none';
            }
        });
    }

    // Função para exibir mensagem
    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'status-message error' : 'status-message success';
        statusMessage.style.display = 'block';
    }
    
    // --- Lógica do Login ---
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.erro || 'Falha no login.');
                
                localStorage.setItem('authToken', result.token);
                window.location.href = result.usuario.role === 'admin' ? '/admin.html' : '/index.html';

            } catch (error) {
                showStatus(error.message, true);
            }
        });
    }
    
    // --- Lógica de Cadastro ---
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('register-nome').value;
            // Aqui pegamos o valor formatado mesmo, ou limpamos se o backend exigir só números
            // Para garantir que vai só números pro banco: .replace(/\D/g, '')
            const telefone = document.getElementById('register-telefone').value; 
            const endereco = document.getElementById('register-endereco').value;
            const email = document.getElementById('register-email').value;
            const senha = document.getElementById('register-senha').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, telefone, email, senha, endereco })
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.erro || 'Não foi possível cadastrar.');
                }

                showStatus('Cadastro realizado com sucesso! Faça o login.', false);
                registerForm.reset();
                showLoginLink.click();

            } catch (error) {
                showStatus(error.message, true);
                
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os campos
    const cepInput = document.getElementById('cep');
    const logradouroInput = document.getElementById('logradouro');
    const numeroInput = document.getElementById('numero');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const enderecoFinalInput = document.getElementById('register-endereco');

    // Se não achar o campo de CEP (ex: na tela de login), para o script aqui
    if (!cepInput) return;

    // 1. Formata o CEP (adiciona o traço) enquanto digita
    cepInput.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, ""); // Remove letras
        if (valor.length > 5) {
            valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
        }
        e.target.value = valor;
    });

    // 2. Função que preenche o input hidden com o endereço completo
    function atualizarEnderecoFinal() {
        const rua = logradouroInput.value;
        const num = numeroInput.value;
        const bairro = bairroInput.value;
        const cidade = cidadeInput.value;

        // Só monta se tiver rua e número preenchidos
        if (rua && num) {
            enderecoFinalInput.value = `${rua}, ${num}, ${bairro} - ${cidade}`;
            console.log("Endereço salvo:", enderecoFinalInput.value);
        }
    }

    // 3. Busca o CEP na API quando o usuário sai do campo
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');

        if (cep.length === 8) {
            // Visual de "carregando"
            logradouroInput.value = "...";
            
            try {
                const req = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await req.json();

                if (!data.erro) {
                    logradouroInput.value = data.logradouro;
                    bairroInput.value = data.bairro;
                    cidadeInput.value = `${data.localidade}/${data.uf}`;
                    
                    // Vai para o campo número automaticamente
                    numeroInput.focus();
                    
                    // Tenta atualizar (caso o número já estivesse lá)
                    atualizarEnderecoFinal();
                } else {
                    alert("CEP não encontrado!");
                    logradouroInput.value = "";
                }
            } catch (error) {
                console.error(error);
                alert("Erro ao buscar CEP.");
                logradouroInput.value = "";
            }
        }
    });

    // 4. Sempre que digitar o número, atualiza o campo oculto
    numeroInput.addEventListener('input', atualizarEnderecoFinal);
});