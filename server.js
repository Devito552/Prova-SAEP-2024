// Importando bibliotecas necessárias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

// Criando a aplicação Express
const app = express();

// Habilitando CORS para permitir requisições de outras origens
app.use(cors());

// Configurando o body-parser para interpretar JSON e dados de formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurando a conexão com o banco de dados MySQL usando variáveis de ambiente
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectando ao banco de dados
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Configurando sessões com um segredo, sem regravar nem inicializar a sessão se não modificada
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Em produção, use 'secure: true' com HTTPS
}));

// Middleware de autenticação para proteger rotas
const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('Acesso negado. Faça login para continuar.');
  }
  next();
};


// Rota de login
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

// Rota para obter turmas do professor logado
app.get('/turmas', authenticateSession, (req, res) => {
  const { userId } = req.session;
  db.query('SELECT * FROM turma WHERE professor_idprofessor = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('Professor não encontrado');
    res.json(results);
  });
});

// Rota para obter dados do professor logado
app.get('/professores', authenticateSession, (req, res) => {
  const { userId } = req.session;
  db.query('SELECT * FROM professor WHERE idprofessor = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('Professor não encontrado');
    res.json(results[0]);
  });
});

// Rota para cadastrar nova turma
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

// Rota para deletar uma turma
app.delete('/turmas/:id', authenticateSession, (req, res) => {
  db.query('DELETE FROM turma WHERE idturma = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.send('Turma excluída');
  });
});

// Rota para obter atividades de uma turma específica
app.get('/atividades/:id', authenticateSession, (req, res) => {
  db.query('SELECT * FROM atividade WHERE turma_idturma= ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.json(results);
  });
});

// Rota para obter uma turma específica por ID
app.get('/turma/:idTurma', (req, res) => {
  const idTurma = req.params.idTurma;

  db.query('SELECT * FROM turma WHERE idturma = ?', [idTurma], (err, results) => {
    if (err) {
      console.error('Erro ao buscar turma:', err);
      return res.status(500).send('Erro ao buscar turma');
    }

    if (results.length === 0) {
      return res.status(404).send('Turma não encontrada');
    }

    res.json(results[0]);
  });
});

// Rota para cadastrar uma nova atividade
app.post('/cadastro-atividade', (req, res) => {
  const { descricao_atividade } = req.body;
  const idTurma = req.session.idTurma;

  if (!idTurma) {
    return res.status(400).send('ID da turma não encontrado na sessão');
  }

  db.query('INSERT INTO atividade (descricao_atividade, turma_idturma) VALUES (?, ?)',
    [descricao_atividade, idTurma],
    (err, results) => {
      if (err) {
        console.error('Erro ao cadastrar atividade:', err);
        return res.status(500).send('Erro ao cadastrar atividade');
      }

      res.status(200).json({ idTurma });
    });
});

// Servindo arquivos estáticos específicos das telas
app.use(express.static('src'));
app.use(express.static(__dirname + '/src/telas'));
app.use(express.static(__dirname + '/src/telas/atividades'));

// Rota para servir a página de login
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/src/telas/login/login.html');
});

// Rota para servir a página do dashboard, protegida por autenticação
app.get('/dashboard', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/dashboard/dashboard.html');
});

// Rota para servir a página de cadastro de turma, protegida por autenticação
app.get('/cadastrar-turma', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/cadastrar-turma/cadastrar-turma.html');
});

// Rota para servir a página de atividades, protegida por autenticação
app.get('/atividade', authenticateSession, (req, res) => {
  const idTurma = req.query.idTurma;
  req.session.idTurma = idTurma;
  res.sendFile(__dirname + '/src/telas/atividades/atividades.html');
});

// Rota para servir a página de cadastro de atividade, protegida por autenticação
app.get('/cadastrar-atividade', authenticateSession, (req, res) => {
  res.sendFile(__dirname + '/src/telas/cadastrar-atividade/cadastrar-atividade.html');
});

// Rota para logout, destruindo a sessão
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Erro ao sair');
    res.send('Logout bem-sucedido');
  });
});

// Iniciando o servidor na porta especificada no ambiente ou na 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
