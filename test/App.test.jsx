import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

describe('App de TODOs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza el título y el subtítulo', () => {
    render(<App />)
    expect(screen.getByText('Mis TODOs')).toBeInTheDocument()
    expect(
      screen.getByText('Organiza tus tareas de forma simple'),
    ).toBeInTheDocument()
  })

  it('muestra el mensaje de lista vacía al inicio', () => {
    render(<App />)
    expect(
      screen.getByText('No hay tareas para mostrar 🎉'),
    ).toBeInTheDocument()
  })

  it('agrega una tarea al enviar el formulario', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('¿Qué necesitas hacer?')
    await user.type(input, 'Aprender React')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(screen.getByText('Aprender React')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(
      screen.getByText('1 pendiente(s)'),
    ).toBeInTheDocument()
  })

  it('no agrega una tarea vacía', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(
      screen.getByText('No hay tareas para mostrar 🎉'),
    ).toBeInTheDocument()
  })

  it('marca una tarea como completada al hacer clic en el checkbox', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByPlaceholderText('¿Qué necesitas hacer?'),
      'Estudiar Vitest',
    )
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    const todoItem = screen.getByText('Estudiar Vitest').closest('li')
    expect(todoItem).not.toHaveClass('completed')

    await user.click(screen.getByRole('checkbox'))
    expect(todoItem).toHaveClass('completed')
  })

  it('elimina una tarea con el botón ×', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByPlaceholderText('¿Qué necesitas hacer?'),
      'Tarea a eliminar',
    )
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.queryByText('Tarea a eliminar')).not.toBeInTheDocument()
  })

  it('filtra las tareas por Activas y Completadas', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Agregar dos tareas
    const input = screen.getByPlaceholderText('¿Qué necesitas hacer?')
    await user.type(input, 'Tarea 1')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    await user.type(input, 'Tarea 2')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    // Completar la primera
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // Filtro Activas: solo Tarea 2
    await user.click(screen.getByRole('button', { name: 'Activas' }))
    const activeList = screen.getByRole('list')
    expect(within(activeList).getByText('Tarea 2')).toBeInTheDocument()
    expect(within(activeList).queryByText('Tarea 1')).not.toBeInTheDocument()

    // Filtro Completadas: solo Tarea 1
    await user.click(screen.getByRole('button', { name: 'Completadas' }))
    const completedList = screen.getByRole('list')
    expect(within(completedList).getByText('Tarea 1')).toBeInTheDocument()
    expect(within(completedList).queryByText('Tarea 2')).not.toBeInTheDocument()

    // Filtro Todas: ambas
    await user.click(screen.getByRole('button', { name: 'Todas' }))
    expect(screen.getByText('Tarea 1')).toBeInTheDocument()
    expect(screen.getByText('Tarea 2')).toBeInTheDocument()
  })

  it('limpia las tareas completadas', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('¿Qué necesitas hacer?')
    await user.type(input, 'Hecha')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    await user.type(input, 'Pendiente')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    // Completar la primera
    await user.click(screen.getAllByRole('checkbox')[0])
    await user.click(screen.getByRole('button', { name: 'Limpiar completadas' }))

    expect(screen.queryByText('Hecha')).not.toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('persiste las tareas en localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByPlaceholderText('¿Qué necesitas hacer?'),
      'Persistente',
    )
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    const stored = JSON.parse(localStorage.getItem('todos-semana-2'))
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persistente')
    expect(stored[0].completed).toBe(false)
  })
})
