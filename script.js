// Giriş İşlemleri (Yenilenmiş)
function initLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('password');
    
    if (loginBtn && passwordInput) {
        loginBtn.addEventListener('click', login);
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    } else {
        console.error('Giriş elementi bulunamadı!');
    }
}

async function login() {
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorElement = document.getElementById('loginError');

        // Hata mesajını temizle
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // Validasyon
        if (!username || !password) {
            throw new Error('Lütfen kullanıcı adı ve şifre giriniz');
        }

        // Demo giriş bilgileri - Gerçek uygulamada sunucu doğrulaması yapılmalı
        if (username === 'hekim' && password === 'Sifre123!') {
            localStorage.setItem('authToken', 'demo-token');
            appState.currentUser = { 
                username, 
                role: 'doctor',
                name: 'Demo Kullanıcı'
            };
            showMainView();
            await loadWorkplaces();
        } else {
            throw new Error('Geçersiz kullanıcı adı veya şifre!');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError(error.message);
    }
}

function showMainView() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        document.getElementById('welcomeText').textContent = `Hoş geldiniz, ${appState.currentUser.name}`;
    } else {
        console.error('Ana görünüm elementleri bulunamadı!');
    }
}
