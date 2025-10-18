import React, { useState } from "react";
import "./App.css";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoItem";

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Belajar React Dasar", completed: false },
    { id: 2, text: "Membuat Proyek To-Do List", completed: false },
  ]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="App">
      <div className="container">
      <h1>My To-Do List</h1>
      <TodoForm addTodo={addTodo} />
      <ul>
        {todos.map(todo => (

          <TodoItem
            key={todo.id}
            todo={todo}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
      </div>
    </div>
  );
}

export default App;
