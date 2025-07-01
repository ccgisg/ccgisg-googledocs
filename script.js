// Uygulama State'i
const appState = {
    db: new Database(),
    currentUser: null,
    currentWorkplace: null,
    currentEmployees: [],
    currentEmployeeIndex: null,
    currentFileUploadIndex: null,
    isEditingWorkplace: false
};

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await appState.db.initDB();
        initLogin();
        checkAuth();
    } catch (error) {
        console.error('Başlatma hatası:', error);
        document.getElementById('loginError').textContent = 'Uygulama başlatılırken bir hata oluştu';
        document.getElementById('loginError').style.display = 'block';
    }
});

// Giriş İşlemleri
function initLogin() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}

async function login() {
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorElement = document.getElementById('loginError');

        errorElement.textContent = '';
        
        if (!username || !password) {
            throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        if (username === 'hekim' && password === 'Sifre123!') {
            localStorage.setItem('authToken', 'demo-token');
            appState.currentUser = { username, role: 'doctor' };
            showMainView();
        } else {
            throw new Error('Geçersiz kullanıcı adı veya şifre!');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError(error.message);
    }
}

function showMainView() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('welcomeText').textContent = `Hoş geldiniz, ${appState.currentUser.username}`;
}

function checkAuth() {
    if (localStorage.getItem('authToken')) {
        appState.currentUser = { username: 'hekim', role: 'doctor' };
        showMainView();
    }
}
