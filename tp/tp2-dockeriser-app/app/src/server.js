const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());

// Base de données en mémoire
let todos = [
  {
    id: uuidv4(),
    title: 'Apprendre Docker',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Créer un Dockerfile',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// ROUTES

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  });
});

// GET /todos - Liste tous les todos
app.get('/todos', (req, res) => {
  const completed = req.query.completed;

  let filteredTodos = todos;
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    filteredTodos = todos.filter(todo => todo.completed === isCompleted);
  }

  res.json({
    count: filteredTodos.length,
    todos: filteredTodos
  });
});

// GET /todos/:id - Récupère un todo par ID
app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

// POST /todos - Crée un nouveau todo
app.post('/todos', (req, res) => {
  const { title, completed = false } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    id: uuidv4(),
    title: title.trim(),
    completed: Boolean(completed),
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// PUT /todos/:id - Met à jour un todo
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (title !== undefined) {
    if (title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    todos[todoIndex].title = title.trim();
  }

  if (completed !== undefined) {
    todos[todoIndex].completed = Boolean(completed);
  }

  todos[todoIndex].updatedAt = new Date().toISOString();

  res.json(todos[todoIndex]);
});

// DELETE /todos/:id - Supprime un todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];

  res.json({
    message: 'Todo deleted successfully',
    todo: deletedTodo
  });
});

// DELETE /todos - Supprime tous les todos
app.delete('/todos', (req, res) => {
  const count = todos.length;
  todos = [];

  res.json({
    message: `${count} todo(s) deleted successfully`
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Todo API 📝',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      listTodos: 'GET /todos',
      getTodo: 'GET /todos/:id',
      createTodo: 'POST /todos',
      updateTodo: 'PUT /todos/:id',
      deleteTodo: 'DELETE /todos/:id',
      deleteAll: 'DELETE /todos'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Démarrage du serveur
app.listen(PORT, HOST, () => {
  console.log(`🚀 Todo API running on http://${HOST}:${PORT}`);
  console.log(`   - Health check: http://${HOST}:${PORT}/health`);
  console.log(`   - Todos: http://${HOST}:${PORT}/todos`);
  console.log(`   - Node version: ${process.version}`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Initial todos: ${todos.length}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
