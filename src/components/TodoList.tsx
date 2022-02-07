import React, { useEffect, useState } from 'react';
import { list, create, update, remove, done, undone } from '../api';
import TodoForm from './TodoForm';
import Todo from './Todo';
import IconLoading from './IconLoading';
import { debug } from 'util';

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

    const addTodo = (todo: Partial<DataTodo>) => {
        if (!todo.title || /^\s*$/.test(todo.title)) {
            return;
        }

        setIsLoading(true);
        create(todo.title, sign).then(({ result, sign: newSign }) => {
            setTodos([result, ...todos]);
            setSign(newSign);
            setIsLoading(false);
        });
    };

    const updateTodo = (todoId: string, newValue: Partial<DataTodo>) => {
        if (!todoId || !newValue.title || /^\s*$/.test(newValue.title)) {
            return;
        }

        setIsLoading(true);
        update(todoId, newValue.title, sign).then(({ sign: newSign }) => {
            setTodos(prev => prev.map(item => (item._id === todoId ? { ...item, ...newValue } : item)));
            setSign(newSign);
            setIsLoading(false);
        });
    };

    const removeTodo = (id: string) => {
        if (!id) {
            return;
        }

        setIsLoading(true);
        remove(id, sign).then(({ sign: newSign }) => {
            setTodos([...todos].filter(todo => todo._id !== id));
            setSign(newSign);
            setIsLoading(false);
        });
    };

    const completeTodo = (id: string) => {
        if (!id) {
            return;
        }
        const current = todos.find(t => t._id === id);
        if (!current) {
            return;
        }

        setIsLoading(true);
        if (current.done) {
            undone(id, sign).then(({ sign: newSign }) => {
                current.done = !current.done;
                setTodos([...todos]);
                setSign(newSign);
                setIsLoading(false);
            });
        } else {
            done(id, sign).then(({ sign: newSign }) => {
                current.done = !current.done;
                setTodos([...todos]);
                setSign(newSign);
                setIsLoading(false);
            });
        }
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
