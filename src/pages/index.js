import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Plus, Search } from 'lucide-react';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Load todos from storage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const result = await window.storage.list('todo:');
        if (result && result.keys) {
          const loadedTodos = await Promise.all(
            result.keys.map(async (key) => {
              try {
                const data = await window.storage.get(key);
                return data ? JSON.parse(data.value) : null;
              } catch {
                return null;
              }
            })
          );
          setTodos(loadedTodos.filter(Boolean).sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.log('No existing todos found');
      }
    };
    loadTodos();
  }, []);

  const saveTodo = async (todo) => {
    try {
      await window.storage.set(`todo:${todo.id}`, JSON.stringify(todo));
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!formData.title.trim()) return;

    const newTodo = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      completed: false,
      dateCreated: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    await saveTodo(newTodo);
    setTodos([newTodo, ...todos]);
    setFormData({ title: '', description: '' });
    setShowAddModal(false);
  };

  const handleUpdateTodo = async () => {
    if (!formData.title.trim() || !editingTodo) return;

    const updatedTodo = {
      ...editingTodo,
      title: formData.title,
      description: formData.description,
      dateCreated: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    await saveTodo(updatedTodo);
    setTodos(todos.map(t => t.id === editingTodo.id ? updatedTodo : t));
    setEditingTodo(null);
    setFormData({ title: '', description: '' });
  };

  const handleDeleteTodo = async (id) => {
    try {
      await window.storage.delete(`todo:${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleToggleComplete = async (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const updatedTodo = { ...todo, completed: !todo.completed };
        saveTodo(updatedTodo);
        return updatedTodo;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setFormData({ title: todo.title, description: todo.description });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTodo(null);
    setFormData({ title: '', description: '' });
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'todos' ? !todo.completed : todo.completed;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Todo
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('todos')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'todos'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date Created/Updated</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTodos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No tasks found. {activeTab === 'todos' ? 'Add a new task to get started!' : 'Complete some tasks to see them here.'}
                    </td>
                  </tr>
                ) : (
                  filteredTodos.map((todo) => (
                    <tr key={todo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{todo.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{todo.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{todo.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{todo.dateCreated}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(todo)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleComplete(todo.id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                            title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showAddModal || editingTodo) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTodo ? 'Edit Todo' : 'Add New Todo'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={editingTodo ? handleUpdateTodo : handleAddTodo}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {editingTodo ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;