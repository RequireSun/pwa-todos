import React, { useEffect, useState } from 'react';
import { list } from '../api';
import TodoForm from './TodoForm';
import Todo from './Todo';
import IconLoading from './IconLoading';

function TodoList() {
    const [todos, setTodos] = useState<DataTodo[]>([]);
    const [sign, setSign] = useState<string | null>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        list().then(({ list, sign: _sign }) => {
            setTodos(list);
            setSign(_sign);
            setIsLoading(false);
        });
    }, []);

    const addTodo = (todo: DataTodo) => {
        if (!todo.title || /^\s*$/.test(todo.title)) {
            return;
        }

        const newTodos = [todo, ...todos];

        setTodos(newTodos);
        console.log(...todos);
    };

    const updateTodo = (todoId: string, newValue: DataTodo) => {
        if (!newValue.title || /^\s*$/.test(newValue.title)) {
            return;
        }

        setTodos(prev => prev.map(item => (item._id === todoId ? newValue : item)));
    };

    const removeTodo = (id: string) => {
        const removedArr = [...todos].filter(todo => todo._id !== id);

        setTodos(removedArr);
    };

    const completeTodo = (id: string) => {
        let updatedTodos = todos.map(todo => {
            if (todo._id === id) {
                todo.done = !todo.done;
            }
            return todo;
        });
        setTodos(updatedTodos);
    };

    return (
        <>
            {isLoading ? (
                <div className="loading-wrapper">
                    <div className="loading-container">
                        <IconLoading/>
                    </div>
                </div>
            ) : null}
            <div className="conor">Current Sign(Server) is: {sign}</div>
            <h1>What is your mission for the day?</h1>
            <TodoForm onSubmit={addTodo} />
            <Todo
                todos={todos}
                completeTodo={completeTodo}
                removeTodo={removeTodo}
                updateTodo={updateTodo}
            />
        </>
    );
}

export default TodoList;
