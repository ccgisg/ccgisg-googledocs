// VERİTABANI SINIFI (TAM)
class Database {
    constructor() {
        this.dbName = 'isyeriHekimligiDB';
        this.version = 12; // Güncellendi
        this.db = null;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error("Veritabanı hatası:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Tüm objectStore tanımları...
                if (!db.objectStoreNames.contains('workplaces')) {
                    db.createObjectStore('workplaces', { keyPath: 'id' });
                }
                
                // ... Diğer tablo tanımları ...
                
                // Yeni: EK-2 geçmişi için
                if (!db.objectStoreNames.contains('ek2History')) {
                    const historyStore = db.createObjectStore('ek2History', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('employeeId', 'employeeId', { unique: false });
                }
            };
        });
    }

    // ... Diğer veritabanı metodları (tam liste) ...

    async addEk2History(historyItem) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ek2History'], 'readwrite');
            const store = transaction.objectStore('ek2History');
            const request = store.add(historyItem);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getEk2HistoryByEmployee(employeeId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ek2History'], 'readonly');
            const store = transaction.objectStore('ek2History');
            const index = store.index('employeeId');
            const request = index.getAll(employeeId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
}

// UYGULAMA STATE'İ (TAM)
const appState = {
    db: new Database(),
    currentUser: null,
    currentWorkplace: null,
    currentEmployees: [],
    currentEmployeeIndex: null,
    currentFileUploadIndex: null,
    isEditingWorkplace: false,
    isEditingEmployee: false,
    currentEk2FormData: null
};

// TÜM FONKSİYONLAR (TAM)

// 1. Giriş İşlemleri
function initLogin() { /* ... */ }
async function login() { /* ... */ }

// 2. İşyeri İşlemleri
async function loadWorkplaces() { /* ... */ }
function renderWorkplaces(workplaces) { /* ... */ }

// 3. Çalışan İşlemleri
async function loadEmployees(workplaceId) { /* ... */ }
function renderEmployees(employees) { 
    // ... Çalışan listesi oluşturma ...
    // YENİ: EK-2 Geçmişi butonu eklendi
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${emp.name || ''}</td>
        <td>${emp.tckn || ''}</td>
        <td>${emp.examDate ? formatDate(emp.examDate) : ''}</td>
        <td>${emp.nextExamDate ? formatDate(emp.nextExamDate) : ''}</td>
        <td>
            <div class="employee-actions">
                <button class="btn btn-sm btn-primary ek2-btn">EK-2</button>
                <button class="btn btn-sm btn-secondary upload-btn">EK-2 Yükle</button>
                <button class="btn btn-sm btn-info show-files-btn">EK-2 Göster</button>
                <button class="btn btn-sm btn-warning ek2-history-btn">EK-2 Geçmişi</button>
                <button class="btn btn-sm btn-info edit-employee">Düzenle</button>
                <button class="btn btn-sm btn-danger delete-employee">Sil</button>
            </div>
        </td>
    `;
    // ... Buton event listener'ları ...
    tr.querySelector('.ek2-history-btn').addEventListener('click', () => {
        showEk2HistoryModal(index);
    });
}

// 4. EK-2 Form İşlemleri (GÜNCELLENDİ)
async function showEk2Modal(employeeIndex) {
    // ... Önceki kodlar ...
    
    // YENİ TARİH HESAPLAMA
    document.getElementById('ek2ExamDate').addEventListener('change', function() {
        const examDate = new Date(this.value);
        if (isNaN(examDate.getTime())) return;
        
        const nextExamDate = new Date(examDate);
        nextExamDate.setFullYear(nextExamDate.getFullYear() + 5);
        
        if (examDate.getMonth() === 1 && examDate.getDate() === 29) {
            if (new Date(nextExamDate.getFullYear(), 1, 29).getMonth() !== 1) {
                nextExamDate.setDate(28);
            }
        }
        
        document.getElementById('ek2NextExamDate').value = nextExamDate.toISOString().split('T')[0];
    });

    // ... Sonraki kodlar ...
}

// 5. YENİ: EK-2 Geçmişi Fonksiyonları
async function showEk2HistoryModal(employeeIndex) {
    const employee = appState.currentEmployees[employeeIndex];
    if (!employee) return;

    document.getElementById('ek2HistoryEmployeeName').textContent = employee.name;
    const historyContent = document.getElementById('ek2HistoryContent');
    historyContent.innerHTML = '<div class="text-center py-4"><div class="spinner-border" role="status"><span class="visually-hidden">Yükleniyor...</span></div></div>';

    try {
        const history = await appState.db.getEk2HistoryByEmployee(employee.id);
        historyContent.innerHTML = '';

        if (history.length === 0) {
            historyContent.innerHTML = '<div class="alert alert-info">Henüz EK-2 geçmişi bulunamadı</div>';
        } else {
            history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            const listGroup = document.createElement('div');
            listGroup.className = 'list-group';
            
            history.forEach((item, index) => {
                const date = new Date(item.timestamp);
                const listItem = document.createElement('button');
                listItem.className = 'list-group-item list-group-item-action';
                listItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">EK-2 Kaydı #${index + 1}</h6>
                            <small class="text-muted">${formatDateForDisplay(date)}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary view-history-btn">
                                <i class="fas fa-eye"></i> Görüntüle
                            </button>
                        </div>
                    </div>
                `;
                
                listItem.querySelector('.view-history-btn').addEventListener('click', () => {
                    viewHistoricalEk2Form(item.formData, employee);
                });
                
                listGroup.appendChild(listItem);
            });
            
            historyContent.appendChild(listGroup);
        }
    } catch (error) {
        console.error('EK-2 geçmişi yüklenirken hata:', error);
        historyContent.innerHTML = '<div class="alert alert-danger">Geçmiş yüklenirken hata oluştu</div>';
    }

    const historyModal = new bootstrap.Modal(document.getElementById('ek2HistoryModal'));
    historyModal.show();
}

function viewHistoricalEk2Form(formData, employee) {
    bootstrap.Modal.getInstance(document.getElementById('ek2HistoryModal')).hide();
    
    appState.currentEk2FormData = formData;
    appState.currentEmployeeIndex = appState.currentEmployees.findIndex(e => e.id === employee.id);
    
    showEk2Modal(appState.currentEmployeeIndex);
    
    // Formu salt okunur yap
    const ek2Form = document.getElementById('ek2FormContent');
    ek2Form.querySelectorAll('input, textarea, select').forEach(el => {
        el.disabled = true;
    });
    
    document.getElementById('saveEk2Btn').style.display = 'none';
    document.querySelector('#ek2Modal .modal-title').textContent = 'EK-2 Formu (Geçmiş)';
    
    // Yeni kapatma butonu
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary';
    closeBtn.textContent = 'Kapat';
    closeBtn.onclick = () => {
        appState.currentEk2FormData = null;
        bootstrap.Modal.getInstance(document.getElementById('ek2Modal')).hide();
    };
    
    document.querySelector('#ek2Modal .modal-footer').prepend(closeBtn);
}

// 6. Yardımcı Fonksiyonlar
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDateForDisplay(date);
}

function formatDateForDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// ... Diğer tüm fonksiyonlar ...

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await appState.db.initDB();
        initLogin();
        checkAuth();
        // ... Diğer başlatma fonksiyonları ...
    } catch (error) {
        console.error('Başlatma hatası:', error);
        alert('Uygulama başlatılırken hata oluştu: ' + error.message);
    }
});
