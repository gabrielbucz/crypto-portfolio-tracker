/**
 * login.js — Controlador da página de login/cadastro
 * Gerencia: estado do formulário, feedback visual, troca de modo (login/register)
 */

import {
    login,
    register,
    validateEmail,
    validatePassword,
    validateName,
    getCurrentUser,
} from "./auth.js";

// ─── Redirect se já estiver logado ────────────────────────────────────────
if (getCurrentUser()) {
    window.location.href = "../index.html";
}

// ─── Elementos do DOM ─────────────────────────────────────────────────────
const form = document.getElementById("authForm");
const btnSubmit = document.getElementById("btnSubmit");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const toggleMode = document.getElementById("toggleMode");
const toggleLink = document.getElementById("toggleLink");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const nameGroup = document.getElementById("nameGroup");
const forgotLink = document.getElementById("forgotLink");
const globalError = document.getElementById("globalError");
const globalSuccess = document.getElementById("globalSuccess");

const inputName = document.getElementById("inputName");
const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// ─── Estado ───────────────────────────────────────────────────────────────
let isRegisterMode = false;

// ─── Inicialização ────────────────────────────────────────────────────────
// Checa se URL tem ?mode=register
if (new URLSearchParams(window.location.search).get("mode") === "register") {
    switchToRegister();
}

// ─── Alternar modo Login / Cadastro ───────────────────────────────────────
function switchToRegister() {
    isRegisterMode = true;
    formTitle.textContent = "Criar conta";
    formSubtitle.textContent = "Comece a rastrear seus ativos agora.";
    btnText.textContent = "Criar conta";
    toggleMode.innerHTML = 'Já tem uma conta? <a id="toggleLink" href="#">Entrar</a>';
    nameGroup.classList.remove("hidden");
    forgotLink.classList.add("hidden");
    reattachToggle();
    clearAll();
}

function switchToLogin() {
    isRegisterMode = false;
    formTitle.textContent = "Entrar na conta";
    formSubtitle.textContent = "Acompanhe o mercado crypto em tempo real.";
    btnText.textContent = "Entrar";
    toggleMode.innerHTML = 'Não tem conta? <a id="toggleLink" href="#">Criar agora</a>';
    nameGroup.classList.add("hidden");
    forgotLink.classList.remove("hidden");
    reattachToggle();
    clearAll();
}

function reattachToggle() {
    document.getElementById("toggleLink").addEventListener("click", (e) => {
        e.preventDefault();
        isRegisterMode ? switchToLogin() : switchToRegister();
    });
}

toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isRegisterMode ? switchToLogin() : switchToRegister();
});

// ─── Mostrar / Ocultar senha ─────────────────────────────────────────────
togglePasswordBtn.addEventListener("click", () => {
    const isPassword = inputPassword.type === "password";
    inputPassword.type = isPassword ? "text" : "password";
    eyeIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
});

// ─── Validação em tempo real ───────────────────────────────────────────────
function setFieldState(input, isValid, message = "") {

    const errorEl = input.closest(".field-group")?.querySelector(".field-error");

    input.classList.toggle("is-invalid", !isValid);
    input.classList.toggle("is-valid", isValid);

    if (errorEl) {
        errorEl.textContent = isValid ? "" : message;
        errorEl.style.display = isValid ? "none" : "block";
    }
}

function clearFieldState(input) {
    input.classList.remove("is-invalid", "is-valid");
    const errorEl = input.closest(".field-group")?.querySelector(".field-error");
    if (errorEl) { errorEl.textContent = ""; errorEl.style.display = "none"; }
}

function clearAll() {
    [inputName, inputEmail, inputPassword].forEach(clearFieldState);
    hideGlobalMessages();
    updateSubmitState();
}

function hideGlobalMessages() {
    globalError.classList.add("hidden");
    globalSuccess.classList.add("hidden");
}

function showGlobalError(msg) {
    globalError.querySelector("span").textContent = msg;
    globalError.classList.remove("hidden");
    globalSuccess.classList.add("hidden");
}

function showGlobalSuccess(msg) {
    globalSuccess.querySelector("span").textContent = msg;
    globalSuccess.classList.remove("hidden");
    globalError.classList.add("hidden");
}

// Validação ao sair do campo (blur)
inputEmail.addEventListener("blur", () => {
    if (!inputEmail.value) return clearFieldState(inputEmail);
    setFieldState(inputEmail, validateEmail(inputEmail.value), "Insira um e-mail válido.");
    updateSubmitState();
});

inputPassword.addEventListener("blur", () => {
    if (!inputPassword.value) return clearFieldState(inputPassword);
    setFieldState(inputPassword, validatePassword(inputPassword.value), "A senha deve ter pelo menos 6 caracteres.");
    updateSubmitState();
});

inputName.addEventListener("blur", () => {
    if (!inputName.value || !isRegisterMode) return clearFieldState(inputName);
    setFieldState(inputName, validateName(inputName.value), "Insira seu nome completo.");
    updateSubmitState();
});

// Validação ao digitar (remove erro imediatamente se corrigido)
[inputEmail, inputPassword, inputName].forEach((input) => {
    input.addEventListener("input", () => {
        hideGlobalMessages();
        if (input.classList.contains("is-invalid")) {
            input.classList.remove("is-invalid");
            const errorEl = input.closest(".field-group")?.querySelector(".field-error");
            if (errorEl) { errorEl.textContent = ""; errorEl.style.display = "none"; }
        }
        updateSubmitState();
    });
});

// ─── Estado do botão submit ────────────────────────────────────────────────
function isFormValid() {
    const emailOk = validateEmail(inputEmail.value);
    const passwordOk = validatePassword(inputPassword.value);
    const nameOk = !isRegisterMode || validateName(inputName.value);
    return emailOk && passwordOk && nameOk;
}

function updateSubmitState() {
    btnSubmit.disabled = !isFormValid();
}

// ─── Submissão do formulário ───────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideGlobalMessages();

    // Valida todos os campos ao submeter
    const emailValid = validateEmail(inputEmail.value);
    const passwordValid = validatePassword(inputPassword.value);

    setFieldState(inputEmail, emailValid, "Insira um e-mail válido.");
    setFieldState(inputPassword, passwordValid, "A senha deve ter pelo menos 6 caracteres.");

    if (isRegisterMode) {
        const nameValid = validateName(inputName.value);
        setFieldState(inputName, nameValid, "Insira seu nome completo.");
        if (!emailValid || !passwordValid || !nameValid) return;
    } else {
        if (!emailValid || !passwordValid) return;
    }

    setLoading(true);

    let result;
    if (isRegisterMode) {
        result = await register(inputName.value, inputEmail.value, inputPassword.value);
    } else {
        result = await login(inputEmail.value, inputPassword.value);
    }

    setLoading(false);

    if (result.success) {
        showGlobalSuccess(
            isRegisterMode
                ? `Conta criada com sucesso! Bem-vindo, ${result.user.name}! Redirecionando...`
                : `Bem-vindo de volta, ${result.user.name}! Redirecionando...`
        );
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1800);
    } else {
        showGlobalError(result.error);
        if (!isRegisterMode) {
            setFieldState(inputEmail, false, "");
            setFieldState(inputPassword, false, "");
        }
    }
});

// ─── Estado de loading ─────────────────────────────────────────────────────
function setLoading(loading) {
    btnSubmit.disabled = loading;
    btnSpinner.classList.toggle("hidden", !loading);
    btnText.textContent = loading
        ? isRegisterMode ? "Criando conta..." : "Entrando..."
        : isRegisterMode ? "Criar conta" : "Entrar";
}

// ─── Link "Esqueci minha senha" ────────────────────────────────────────────
forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    showGlobalError("Give your jumps big boy.");
});

// Inicializa estado do botão
updateSubmitState();