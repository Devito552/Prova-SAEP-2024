const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('src'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});



db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use secure: true in production with HTTPS
}));

// Middleware de autenticação
const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('Acesso negado. Faça login para continuar.');
  }
  next();
};


// Rotas de autenticação
app.post('/login', (req, res) => {

  const { email, senha } = req.body;

  db.query('SELECT * FROM professor WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(400).send('Email ou senha incorretos');

    const professor = results[0];
    if (senha !== professor.senha) return res.status(400).send('Email ou senha incorretos');

    // Salvar ID do professor na sessão
    req.session.userId = professor.idprofessor;
    res.json({ message: 'Login bem-sucedido' });
  });
});

app.get('/turmas', authenticateSession, (req, res) => {
  const { userId } = req.session;
  db.query('SELECT * FROM turma WHERE professor_idprofessor = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.json(results);
  });
});

app.post('/cadastro-turma', authenticateSession, (req, res) => {
  const { descricaoTurma } = req.body;
  const { userId } = req.session;
  db.query('INSERT INTO turma (descricao_turma, professor_idprofessor) VALUES (?, ?)',
    [descricaoTurma, userId],
    (err, results) => {
      if (err) return res.status(500).send('Server error');
      res.json({ id: results.insertId, descricaoTurma, professor_idprofessor: userId });
    });
});

app.delete('/turmas/:id', authenticateSession, (req, res) => {
  db.query('DELETE FROM turma WHERE idturma = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.send('Turma excluída');
  });
});

app.get('/atividades/:id', authenticateSession, (req, res) => {
  db.query('SELECT * FROM atividade WHERE turma_idturma= ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.json(results);
  });
});




app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/src/telas/login/login.html');
});

app.get('/dashboard', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/dashboard/dashboard.html');
});

app.get('/cadastrar-turma', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/cadastrar-turma/cadastrar-turma.html');
});

app.get('/atividade', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/atividades/atividades.html');
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Erro ao sair');
    res.send('Logout bem-sucedido');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
