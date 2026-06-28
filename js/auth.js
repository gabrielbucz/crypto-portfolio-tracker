/**
 * auth.js — Módulo de autenticação do CryptoTracker
 * Responsável por:
 * - Login
 * - Cadastro
 * - Validação
 * - Comunicação com API
 */

// ─────────────────────────────────────────────
// Configuração da API
// ─────────────────────────────────────────────

const API_CONFIG = {
    baseURL: 'http://localhost:3000',

    endpoints: {
        users: '/users'
    }
};

// ─────────────────────────────────────────────
// API Layer
// ─────────────────────────────────────────────

/**
 * Busca todos os usuários cadastrados.
 * @returns {Promise<Array>}
 */
async function fetchUsers() {
    const response = await fetch(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.users}`
    );

    if (!response.ok) {
        throw new Error('Falha ao buscar usuários.');
    }

    return response.json();
}

/**
 * Cria um novo usuário.
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<Object>}
 */
async function createUser(userData) {
    const response = await fetch(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.users}`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                ...userData,
                createdAt: new Date().toISOString()
            })
        }
    );

    if (!response.ok) {
        throw new Error('Falha ao criar usuário.');
    }

    return response.json();
}

// ─────────────────────────────────────────────
// Validações
// ─────────────────────────────────────────────

/**
 * Valida e-mail.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email.trim());
}

/**
 * Valida senha.
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
    return password.length >= 6;
}

/**
 * Valida nome completo.        
 * @param {string} name
 * @returns {boolean}
 */
function validateName(name) {
    return name.trim().split(/\s+/).length >= 2;
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

/**
 * Faz login do usuário.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
 */
async function login(email, password) {
    try {
        const users = await fetchUsers();

        const user = users.find(
            (u) =>
                u.email.toLowerCase() === email.toLowerCase().trim() &&
                u.password === password
        );

        if (!user) {
            return {
                success: false,
                error: 'E-mail ou senha incorretos.'
            };
        }

        // Remove dados sensíveis
        const safeUser = { ...user };

        delete safeUser.password;
        delete safeUser.email;

        sessionStorage.setItem(
            'cryptotracker_user',
            JSON.stringify(safeUser)
        );

        return {
            success: true,
            user: safeUser
        };
    } catch (err) {
        console.error('[Auth] Erro ao fazer login:', err);

        return {
            success: false,
            error:
                'Não foi possível conectar ao servidor. Verifique se o json-server está rodando.'
        };
    }
}

// ─────────────────────────────────────────────
// Cadastro
// ─────────────────────────────────────────────

/**
 * Registra um novo usuário.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
 */
async function register(name, email, password) {
    try {
        const users = await fetchUsers();

        const alreadyExists = users.some(
            (u) =>
                u.email.toLowerCase() === email.toLowerCase().trim()
        );

        if (alreadyExists) {
            return {
                success: false,
                error: 'Este e-mail já está cadastrado.'
            };
        }

        const newUser = await createUser({
            name: name.trim(),
            email: email.trim(),
            password
        });

        // Remove senha antes de salvar sessão
        const safeUser = { ...newUser };

        delete safeUser.password;
        delete safeUser.email;

        sessionStorage.setItem(
            'cryptotracker_user',
            JSON.stringify(safeUser)
        );

        return {
            success: true,
            user: safeUser
        };
    } catch (err) {
        console.error('[Auth] Erro ao cadastrar:', err);

        return {
            success: false,
            error:
                'Não foi possível conectar ao servidor. Verifique se o json-server está rodando.'
        };
    }
}

// ─────────────────────────────────────────────
// Sessão
// ─────────────────────────────────────────────

/**
 * Retorna usuário logado.
 * @returns {Object|null}
 */
function getCurrentUser() {
    const data = sessionStorage.getItem(
        'cryptotracker_user'
    );

    return data ? JSON.parse(data) : null;
}

/**
 * Encerra sessão.
 */
function logout() {
    sessionStorage.removeItem('cryptotracker_user');
}

export {
    login,
    register,
    validateEmail,
    validatePassword,
    validateName,
    getCurrentUser,
    logout
};