import React, { useState } from 'react';
import TodoForm from './TodoForm';
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai';

interface Props {
    todos: DataTodo[];
    completeTodo: (id: number) => void;
    removeTodo: (id: number) => void;
    updateTodo: (id: number, newValue: DataTodo) => void;
}

const Todo = ({ todos, completeTodo, removeTodo, updateTodo }: Props) => {
    const [edit, setEdit] = useState<DataTodoEdit>({
        id: null,
        value: ''
    });

    const submitUpdate = (value: DataTodo) => {
        updateTodo(edit.id!, value);
        setEdit({
            id: null,
            value: ''
        });
    };

    if (edit.id) {
        return <TodoForm edit={edit} onSubmit={submitUpdate} />;
    }

    return (
        <>
            {todos.map((todo, index) => (
                <div
                    className={todo.isComplete ? 'todo-row complete' : 'todo-row'}
                    key={index}
                >
                    <div key={todo.id} onClick={() => completeTodo(todo.id)}>
                        {todo.text}
                    </div>
                    <div className='icons'>
                        <AiFillCloseCircle
                            onClick={() => removeTodo(todo.id)}
                            className='delete-icon'
                        />
                        <AiFillEdit
                            onClick={() => setEdit({ id: todo.id, value: todo.text })}
                            className='edit-icon'
                        />
                    </div>
                </div>
            ))}
        </>
    );
};

export default Todo;
