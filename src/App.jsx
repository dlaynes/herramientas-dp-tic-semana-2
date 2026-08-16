import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = 'todos-semana-2'
const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'completed', label: 'Completadas' },
]

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: value, completed: false },
    ])
    setText('')
  }

  const toggleTodo = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )

  const removeTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id))

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.completed))

  const visibleTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <section id="app">
      <header className="app-header">
        <h1>Mis TODOs</h1>
        <p className="subtitle">Organiza tus tareas de forma simple</p>
      </header>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          className="add-input"
          placeholder="¿Qué necesitas hacer?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" className="add-btn">Agregar</button>
      </form>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={'filter-btn' + (filter === f.id ? ' active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {visibleTodos.length === 0 && (
          <li className="empty">No hay tareas para mostrar 🎉</li>
        )}
        {visibleTodos.map((t) => (
          <li key={t.id} className={'todo' + (t.completed ? ' completed' : '')}>
            <label className="todo-check">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTodo(t.id)}
              />
              <span className="checkmark" aria-hidden="true" />
            </label>
            <span className="todo-text">{t.text}</span>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeTodo(t.id)}
              aria-label="Eliminar"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <footer className="app-footer">
          <span className="count">{remaining} pendiente(s)</span>
          <button type="button" className="clear-btn" onClick={clearCompleted}>
            Limpiar completadas
          </button>
        </footer>
      )}
    </section>
  )
}

export default App
