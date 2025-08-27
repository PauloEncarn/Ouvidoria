console.log("script.js carregado com sucesso");

// Elementos DOM
const homePage = document.getElementById('home-page');
const complaintPage = document.getElementById('complaint-page');
const thankYouPage = document.getElementById('thank-you-page');
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const userPage = document.getElementById('user-page');
const myComplaintsPage = document.getElementById('my-complaints-page');
const ouvidorPage = document.getElementById('ouvidor-page');
const configPage = document.getElementById('config-page');
const adminUsersPage = document.getElementById('admin-users-page');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const configBtn = document.getElementById('config-btn');
const backFromComplaint = document.getElementById('back-from-complaint');
const backFromThankYou = document.getElementById('back-from-thankyou');
const backFromLogin = document.getElementById('back-from-login');
const backFromRegister = document.getElementById('back-from-register');
const backFromMyComplaints = document.getElementById('back-from-my-complaints');
const backFromOuvidor = document.getElementById('back-from-ouvidor');
const backFromConfig = document.getElementById('back-from-config');
const backFromAdminUsers = document.getElementById('back-from-admin-users');
const complaintForm = document.getElementById('complaint-form');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-user-form');
const userOptions = document.getElementById('user-options');
const logoutBtn = document.getElementById('logout-btn');
const filterStatus = document.getElementById('filter-status');
const filterSector = document.getElementById('filter-sector');
const searchInput = document.getElementById('search');
const myComplaintsList = document.getElementById('my-complaints-list');
const ouvidorFilterStatus = document.getElementById('ouvidor-filter-status');
const ouvidorFilterSector = document.getElementById('ouvidor-filter-sector');
const ouvidorSearch = document.getElementById('ouvidor-search');
const ouvidorComplaintsList = document.getElementById('ouvidor-complaints-list');
const usersList = document.getElementById('users-list');
const successAlert = document.getElementById('success-alert');
const errorAlert = document.getElementById('error-alert');
const loginError = document.getElementById('login-error');
const registerSuccess = document.getElementById('register-success');
const registerError = document.getElementById('register-error');
const backupBtn = document.getElementById('backup-btn');
const restoreBtn = document.getElementById('restore-btn');
const restoreFile = document.getElementById('restore-file');
const editUserModal = document.getElementById('edit-user-modal');
const editUserForm = document.getElementById('edit-user-form');
const closeModal = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    if (page) page.classList.add('active');
}

function showAlert(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 3000);
    }
}

function showModal() {
    if (editUserModal) editUserModal.style.display = 'block';
}

function hideModal() {
    if (editUserModal) editUserModal.style.display = 'none';
}

function renderUserOptions(role) {
    if (!userOptions) return;
    userOptions.innerHTML = '';
    const options = [];

    if (['reclamador', 'ouvidor', 'admin'].includes(role)) {
        options.push(`
            <button id="make-complaint-btn" class="btn-secondary">Fazer Reclamação</button>
            <button id="my-complaints-btn" class="btn-secondary">Acompanhar Minhas Reclamações</button>
        `);
    }
    if (['ouvidor', 'admin'].includes(role)) {
        options.push(`<button id="ouvidor-complaints-btn" class="btn-secondary">Ouvir Reclamações</button>`);
    }
    if (['configurador', 'admin'].includes(role)) {
        options.push(`<button id="config-user-btn" class="btn-secondary">Configurações</button>`);
    }
    if (role === 'admin' || role==='ouvidor') {
        options.push(`<button id="admin-users-btn" class="btn-secondary">Gerenciar Usuários</button>`);
    }

    userOptions.innerHTML = options.join('');
    if (document.getElementById('make-complaint-btn')) {
        document.getElementById('make-complaint-btn').addEventListener('click', () => {
            showPage(complaintPage);
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.value = localStorage.getItem('userEmail') || '';
            window.history.pushState({}, '', '/complaint');
        });
    }
    if (document.getElementById('my-complaints-btn')) {
        document.getElementById('my-complaints-btn').addEventListener('click', () => {
            showPage(myComplaintsPage);
            window.history.pushState({}, '', '/my-complaints');
            listMyComplaints();
        });
    }
    if (document.getElementById('ouvidor-complaints-btn')) {
        document.getElementById('ouvidor-complaints-btn').addEventListener('click', () => {
            showPage(ouvidorPage);
            window.history.pushState({}, '', '/ouvidor');
            listOuvidorComplaints();
        });
    }
    if (document.getElementById('config-user-btn')) {
        document.getElementById('config-user-btn').addEventListener('click', () => {
            showPage(configPage);
            window.history.pushState({}, '', '/config');
            renderConfigPage();
        });
    }
    if (document.getElementById('admin-users-btn')) {
        document.getElementById('admin-users-btn').addEventListener('click', () => {
            showPage(adminUsersPage);
            window.history.pushState({}, '', '/admin-users');
            listUsers();
        });
    }
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return { isAuthenticated: false };
    try {
        const response = await fetch('/api/complaints/login/admin', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return { isAuthenticated: false };
    }
}

async function checkRoute() {
    const path = window.location.pathname;
    const auth = await checkAuth();
    if (path === '/complaint' && auth.isAuthenticated) {
        showPage(complaintPage);
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = auth.email || '';
    } else if (path === '/thankyou' && auth.isAuthenticated) {
        showPage(thankYouPage);
    } else if (path === '/login') {
        showPage(loginPage);
    } else if (path === '/register') {
        showPage(registerPage);
    } else if (path === '/my-complaints' && auth.isAuthenticated) {
        showPage(myComplaintsPage);
        listMyComplaints();
    } else if (path === '/ouvidor' && auth.isAuthenticated && ['ouvidor', 'admin'].includes(auth.role)) {
        showPage(ouvidorPage);
        listOuvidorComplaints();
    } else if (path === '/config' && auth.isAuthenticated && ['configurador', 'admin'].includes(auth.role)) {
        showPage(configPage);
        renderConfigPage();
    } else if (path === '/admin-users' && auth.isAuthenticated && auth.role === 'admin') {
        showPage(adminUsersPage);
        listUsers();
    } else if (['/my-complaints', '/ouvidor', '/config', '/admin-users', '/complaint', '/thankyou'].includes(path) && !auth.isAuthenticated) {
        showPage(loginPage);
        window.history.pushState({}, '', '/login');
    } else if (auth.isAuthenticated) {
        showPage(userPage);
        renderUserOptions(auth.role);
        window.history.pushState({}, '', '/user');
    } else {
        showPage(homePage);
        window.history.pushState({}, '', '/');
    }
}

async function listMyComplaints() {
    const token = localStorage.getItem('token');
    if (!myComplaintsList) return;
    try {
        const response = await fetch('/api/complaints', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar reclamações');
        const complaints = await response.json();
        myComplaintsList.innerHTML = '';
        const statusFilter = filterStatus ? filterStatus.value : 'todos';
        const sectorFilter = filterSector ? filterSector.value : 'todos';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        complaints
            .filter(complaint => 
                (statusFilter === 'todos' || complaint.status === statusFilter) &&
                (sectorFilter === 'todos' || complaint.sector === sectorFilter) &&
                (complaint.name.toLowerCase().includes(searchTerm) || 
                 complaint.email.toLowerCase().includes(searchTerm) || 
                 complaint.complaint.toLowerCase().includes(searchTerm))
            )
            .forEach(complaint => {
                const div = document.createElement('div');
                div.className = 'complaint-item';
                div.innerHTML = `
                    <div class="complaint-header">
                        <span class="complaint-title">${complaint.name}</span>
                        <span class="complaint-date">${new Date(complaint.date).toLocaleString()}</span>
                    </div>
                    <div class="complaint-details">
                        <div><strong>E-mail:</strong> ${complaint.email}</div>
                        <div><strong>Cargo:</strong> ${complaint.position}</div>
                        <div><strong>Setor:</strong> ${complaint.sector}</div>
                        <div><strong>Reclamação:</strong> ${complaint.complaint}</div>
                        <div><strong>Pessoa Envolvida:</strong> ${complaint.relatedPerson || 'N/A'}</div>
                        <div><strong>Status:</strong> 
                            <span class="status-badge status-${complaint.status}">${complaint.status}</span>
                        </div>
                    </div>
                `;
                myComplaintsList.appendChild(div);
            });
    } catch (error) {
        console.error('Erro ao listar reclamações:', error);
        showAlert(errorAlert, 'Erro ao listar reclamações');
    }
}

async function listOuvidorComplaints() {
    const token = localStorage.getItem('token');
    if (!ouvidorComplaintsList) return;
    try {
        const response = await fetch('/api/complaints', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar reclamações');
        const complaints = await response.json();
        ouvidorComplaintsList.innerHTML = '';
        const statusFilter = ouvidorFilterStatus ? ouvidorFilterStatus.value : 'todos';
        const sectorFilter = ouvidorFilterSector ? ouvidorFilterSector.value : 'todos';
        const searchTerm = ouvidorSearch ? ouvidorSearch.value.toLowerCase() : '';

        complaints
            .filter(complaint => 
                (statusFilter === 'todos' || complaint.status === statusFilter) &&
                (sectorFilter === 'todos' || complaint.sector === sectorFilter) &&
                (complaint.name.toLowerCase().includes(searchTerm) || 
                 complaint.email.toLowerCase().includes(searchTerm) || 
                 complaint.complaint.toLowerCase().includes(searchTerm))
            )
            .forEach(complaint => {
                const div = document.createElement('div');
                div.className = 'complaint-item';
                div.innerHTML = `
                    <div class="complaint-header">
                        <span class="complaint-title">${complaint.name}</span>
                        <span class="complaint-date">${new Date(complaint.date).toLocaleString()}</span>
                    </div>
                    <div class="complaint-details">
                        <div><strong>E-mail:</strong> ${complaint.email}</div>
                        <div><strong>Cargo:</strong> ${complaint.position}</div>
                        <div><strong>Setor:</strong> ${complaint.sector}</div>
                        <div><strong>Reclamação:</strong> ${complaint.complaint}</div>
                        <div><strong>Pessoa Envolvida:</strong> ${complaint.relatedPerson || 'N/A'}</div>
                        <div><strong>Status:</strong> 
                            <span class="status-badge status-${complaint.status}">${complaint.status}</span>
                            <select class="status-select" data-id="${complaint.id}">
                                <option value="pendente" ${complaint.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="andamento" ${complaint.status === 'andamento' ? 'selected' : ''}>Em andamento</option>
                                <option value="resolvido" ${complaint.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
                            </select>
                        </div>
                    </div>
                `;
                ouvidorComplaintsList.appendChild(div);
            });

        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id;
                const newStatus = e.target.value;
                try {
                    const response = await fetch(`/api/complaints/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: newStatus })
                    });
                    if (!response.ok) throw new Error('Erro ao atualizar status');
                    showAlert(successAlert, 'Status atualizado com sucesso');
                    listOuvidorComplaints();
                } catch (error) {
                    console.error('Erro ao atualizar status:', error);
                    showAlert(errorAlert, 'Erro ao atualizar status');
                }
            });
        });
    } catch (error) {
        console.error('Erro ao listar reclamações:', error);
        showAlert(errorAlert, 'Erro ao listar reclamações');
    }
}

async function listUsers() {
    const token = localStorage.getItem('token');
    if (!usersList) return;
    try {
        const response = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        const users = await response.json();
        usersList.innerHTML = `
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="elevate-btn" data-id="${user.id}" ${user.role === 'ouvidor' ? 'disabled' : ''}>Elevar para Ouvidor</button>
                                <button class="edit-user-btn" data-id="${user.id}">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.querySelectorAll('.elevate-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    const response = await fetch(`/api/users/${id}/elevate`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error('Erro ao elevar usuário');
                    showAlert(successAlert, data.message);
                    listUsers();
                } catch (error) {
                    console.error('Erro ao elevar usuário:', error);
                    showAlert(errorAlert, 'Erro ao elevar usuário');
                }
            });
        });

        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                showEditUserModal(id);
            });
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        showAlert(errorAlert, 'Erro ao listar usuários');
    }
}

function showEditUserModal(userId) {
    if (!editUserModal || !editUserForm) return;
    fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(user => {
        const nameInput = document.getElementById('edit-name');
        const emailInput = document.getElementById('edit-email');
        const roleInput = document.getElementById('edit-role');
        if (nameInput && emailInput && roleInput) {
            nameInput.value = user.name;
            emailInput.value = user.email;
            roleInput.value = user.role;
            editUserForm.dataset.id = userId; // Armazenar ID no formulário
            showModal();
        }
    });
}

function renderConfigPage() {
    const configSection = document.querySelector('.server-info');
    if (!configSection || !['admin', 'configurador'].includes(localStorage.getItem('role'))) return;
    const userManagement = document.createElement('div');
    userManagement.innerHTML = `
        <h3>Gerenciamento de Usuários</h3>
        <form id="add-user-form">
            <div class="form-group">
                <label for="add-name">Nome *</label>
                <input type="text" id="add-name" required>
            </div>
            <div class="form-group">
                <label for="add-email">E-mail *</label>
                <input type="email" id="add-email" required>
            </div>
            <div class="form-group">
                <label for="add-password">Senha *</label>
                <input type="password" id="add-password" required>
            </div>
            <div class="form-group">
                <label for="add-role">Perfil *</label>
                <select id="add-role" required>
                    <option value="reclamador">Reclamador</option>
                    <option value="ouvidor">Ouvidor</option>
                    <option value="configurador">Configurador</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button type="submit">Adicionar Usuário</button>
        </form>
    `;
    configSection.appendChild(userManagement);

    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUser = {
                name: document.getElementById('add-name').value,
                email: document.getElementById('add-email').value,
                password: document.getElementById('add-password').value,
                role: document.getElementById('add-role').value
            };
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(newUser)
                });
                if (!response.ok) throw new Error('Erro ao adicionar usuário');
                showAlert(successAlert, 'Usuário adicionado com sucesso');
                addUserForm.reset();
            } catch (error) {
                console.error('Erro ao adicionar usuário:', error);
                showAlert(errorAlert, 'Erro ao adicionar usuário');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkRoute();

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showPage(loginPage);
            window.history.pushState({}, '', '/login');
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            showPage(registerPage);
            window.history.pushState({}, '', '/register');
        });
    }

    if (configBtn) {
        configBtn.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated && ['configurador', 'admin'].includes(auth.role)) {
                showPage(configPage);
                renderConfigPage();
                window.history.pushState({}, '', '/config');
            } else {
                showPage(loginPage);
                window.history.pushState({}, '', '/login');
            }
        });
    }

    if (backFromComplaint) {
        backFromComplaint.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (backFromThankYou) {
        backFromThankYou.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (backFromLogin) {
        backFromLogin.addEventListener('click', () => {
            showPage(homePage);
            window.history.pushState({}, '', '/');
        });
    }

    if (backFromRegister) {
        backFromRegister.addEventListener('click', () => {
            showPage(homePage);
            window.history.pushState({}, '', '/');
        });
    }

    if (backFromMyComplaints) {
        backFromMyComplaints.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (backFromOuvidor) {
        backFromOuvidor.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (backFromConfig) {
        backFromConfig.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (backFromAdminUsers) {
        backFromAdminUsers.addEventListener('click', async () => {
            const auth = await checkAuth();
            if (auth.isAuthenticated) {
                showPage(userPage);
                renderUserOptions(auth.role);
                window.history.pushState({}, '', '/user');
            } else {
                showPage(homePage);
                window.history.pushState({}, '', '/');
            }
        });
    }

    if (complaintForm) {
        complaintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const complaintData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                position: document.getElementById('position').value,
                sector: document.getElementById('sector').value,
                complaint: document.getElementById('complaint').value,
                relatedPerson: document.getElementById('related-person').value,
                status: 'pendente',
                date: new Date().toISOString()
            };

            if (!complaintData.name || !complaintData.email || !complaintData.position || !complaintData.sector || !complaintData.complaint) {
                showAlert(errorAlert, 'Preencha todos os campos obrigatórios');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/complaints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(complaintData)
                });
                if (response.ok) {
                    showAlert(successAlert, 'Reclamação registrada com sucesso');
                    setTimeout(() => {
                        showPage(thankYouPage);
                        window.history.pushState({}, '', '/thankyou');
                        complaintForm.reset();
                    }, 1000);
                } else {
                    throw new Error('Erro ao enviar reclamação');
                }
            } catch (error) {
                console.error('Erro ao enviar reclamação:', error);
                showAlert(errorAlert, 'Erro ao enviar reclamação');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('userEmail', data.email);
                    showPage(userPage);
                    renderUserOptions(data.role);
                    window.history.pushState({}, '', '/user');
                    loginForm.reset();
                } else {
                    showAlert(loginError, 'Credenciais inválidas');
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                showAlert(loginError, 'Erro ao fazer login');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const registerData = {
                name: document.getElementById('register-name').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                role: 'reclamador'
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerData)
                });
                if (response.ok) {
                    showAlert(registerSuccess, 'Usuário cadastrado com sucesso');
                    setTimeout(() => {
                        registerForm.reset();
                        showPage(loginPage);
                        window.history.pushState({}, '', '/login');
                    }, 2000);
                } else {
                    throw new Error('Erro ao cadastrar usuário');
                }
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                showAlert(registerError, 'Erro ao cadastrar usuário');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userEmail');
            showPage(homePage);
            window.history.pushState({}, '', '/');
        });
    }

    if (filterStatus) filterStatus.addEventListener('change', listMyComplaints);
    if (filterSector) filterSector.addEventListener('change', listMyComplaints);
    if (searchInput) searchInput.addEventListener('input', listMyComplaints);

    if (ouvidorFilterStatus) ouvidorFilterStatus.addEventListener('change', listOuvidorComplaints);
    if (ouvidorFilterSector) ouvidorFilterSector.addEventListener('change', listOuvidorComplaints);
    if (ouvidorSearch) ouvidorSearch.addEventListener('input', listOuvidorComplaints);

    if (backupBtn) {
        backupBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('/api/complaints', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const complaints = await response.json();
                const dataStr = JSON.stringify(complaints, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ouvidoria_backup.json';
                a.click();
                URL.revokeObjectURL(url);
                showAlert(successAlert, 'Backup realizado com sucesso');
            } catch (error) {
                console.error('Erro ao fazer backup:', error);
                showAlert(errorAlert, 'Erro ao fazer backup');
            }
        });
    }

    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            if (restoreFile) restoreFile.click();
        });
    }

    if (restoreFile) {
        restoreFile.addEventListener('change', async (e) => {
            const token = localStorage.getItem('token');
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const complaints = JSON.parse(event.target.result);
                    for (const complaint of complaints) {
                        await fetch('/api/complaints', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(complaint)
                        });
                    }
                    showAlert(successAlert, 'Dados restaurados com sucesso');
                    listMyComplaints();
                    listOuvidorComplaints();
                } catch (error) {
                    console.error('Erro ao restaurar dados:', error);
                    showAlert(errorAlert, 'Erro ao restaurar dados');
                }
            };
            reader.readAsText(file);
        });
    }

    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = editUserForm.dataset.id;
            const updatedUser = {
                name: document.getElementById('edit-name').value,
                email: document.getElementById('edit-email').value,
                password: document.getElementById('edit-password').value || undefined,
                role: document.getElementById('edit-role').value
            };
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(updatedUser)
                });
                if (!response.ok) throw new Error('Erro ao atualizar usuário');
                showAlert(successAlert, 'Usuário atualizado com sucesso');
                hideModal();
                listUsers();
            } catch (error) {
                console.error('Erro ao atualizar usuário:', error);
                showAlert(errorAlert, 'Erro ao atualizar usuário');
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideModal);
    }

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === editUserModal) hideModal();
    });
});

window.addEventListener('popstate', checkRoute);