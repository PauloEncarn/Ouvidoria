const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = 3000;
const JWT_SECRET = 'sua-chave-secreta-aqui';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Log de todas as solicitações
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Conectar ao PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    user: process.env.DB_USER || 'ouvidoria',
    password: process.env.DB_PASSWORD || 'ouvidoria123',
    database: process.env.DB_NAME || 'ouvidoria',
    port: process.env.DB_PORT || 5432
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao banco PostgreSQL:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados PostgreSQL');
    client.query(`
        CREATE TABLE IF NOT EXISTS complaints (
            id SERIAL PRIMARY KEY,
            userId INTEGER,
            name TEXT,
            email TEXT,
            position TEXT,
            sector TEXT,
            complaint TEXT,
            relatedPerson TEXT,
            status TEXT,
            date TEXT
        )
    `);
    client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('reclamador', 'ouvidor', 'configurador', 'admin'))
        )
    `);
    client.query(
        `SELECT * FROM users WHERE email = 'admin@cicopal.com'`,
        (err, result) => {
            release();
            if (err) {
                console.error('Erro ao verificar admin:', err.message);
                return;
            }
            if (result.rows.length === 0) {
                const hashedPassword = bcrypt.hashSync('Cico@25', 10);
                client.query(
                    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
                    ['Admin', 'admin@cicopal.com', hashedPassword, 'admin'],
                    (err) => {
                        if (err) console.error('Erro ao criar admin padrão:', err.message);
                        else console.log('Default admin created: email "admin@cicopal.com", password "Cico@25"');
                    }
                );
            }
        }
    );
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('Token não fornecido');
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Erro na verificação do token:', err.message);
            return res.status(403).json({ error: 'Token inválido' });
        }
        console.log('Token verificado, usuário:', user);
        req.user = user;
        next();
    });
};

// Rotas da API
app.post('/api/register', async (req, res) => {
    const { name, email, password, role = 'reclamador' } = req.body;
    if (!name || !email || !password || !['reclamador', 'ouvidor', 'configurador', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, email, hashedPassword, role]
        );
        res.json({ id: result.rows[0].id, message: 'Usuário registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];
        if (!user) {
            console.log('Usuário não encontrado:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            console.log('Senha incorreta para:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login bem-sucedido, token gerado para:', email, 'Role:', user.role);
        res.json({ token, role: user.role, email: user.email });
    } catch (err) {
        console.log('Erro ao buscar usuário:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/complaints/login/admin', authenticateToken, (req, res) => {
    res.json({ isAuthenticated: true, role: req.user.role, email: req.user.email });
});

app.put('/api/users/:id/elevate', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        console.log('Acesso negado na elevação de usuário, role:', req.user.role);
        return res.status(403).json({ error: 'Acesso negado' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query(`UPDATE users SET role = 'ouvidor' WHERE id = $1 RETURNING *`, [id]);
        res.json({ updated: result.rowCount, message: 'Usuário elevado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    if (!['configurador', 'admin'].includes(req.user.role)) {
        console.log('Acesso negado na edição de usuário, role:', req.user.role);
        return res.status(403).json({ error: 'Acesso negado' });
    }
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    if (!name || !email || !['reclamador', 'ouvidor', 'configurador', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    const updates = [];
    const values = [];
    if (name) {
        updates.push('name = $' + (values.length + 1));
        values.push(name);
    }
    if (email) {
        updates.push('email = $' + (values.length + 1));
        values.push(email);
    }
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = $' + (values.length + 1));
        values.push(hashedPassword);
    }
    if (role) {
        updates.push('role = $' + (values.length + 1));
        values.push(role);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum dado para atualizar' });
    values.push(id);
    try {
        const result = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
        res.json({ updated: result.rowCount, message: 'Usuário atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
    if (!['configurador', 'admin'].includes(req.user.role)) {
        console.log('Acesso negado ao obter usuário, role:', req.user.role);
        return res.status(403).json({ error: 'Acesso negado' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT id, name, email, role FROM users WHERE id = $1`, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    console.log('Tentativa de listar usuários, role:', req.user.role);
    if (!['admin', 'configurador'].includes(req.user.role)) {
        console.log('Acesso negado ao listar usuários, role:', req.user.role);
        return res.status(403).json({ error: 'Acesso negado' });
    }
    try {
        const result = await pool.query(`SELECT id, name, email, role FROM users`);
        console.log('Usuários listados:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.log('Erro ao listar usuários:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complaints', authenticateToken, async (req, res) => {
    const { name, email, position, sector, complaint, relatedPerson, status, date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO complaints (userId, name, email, position, sector, complaint, relatedPerson, status, date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [req.user.id, name, email, position, sector, complaint, relatedPerson, status || 'pendente', date || new Date().toISOString()]
        );
        res.json({ id: result.rows[0].id, message: 'Reclamação registrada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/complaints', authenticateToken, async (req, res) => {
    try {
        if (['ouvidor', 'admin'].includes(req.user.role)) {
            const result = await pool.query(`SELECT * FROM complaints`);
            res.json(result.rows);
        } else if (req.user.role === 'reclamador') {
            const result = await pool.query(`SELECT * FROM complaints WHERE userId = $1`, [req.user.id]);
            res.json(result.rows);
        } else {
            return res.status(403).json({ error: 'Acesso negado' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/complaints/:id', authenticateToken, async (req, res) => {
    if (!['ouvidor', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Acesso negado' });
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(`UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);
        res.json({ updated: result.rowCount, message: 'Status atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Servir ouvidoria.html para todas as rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ouvidoria.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});