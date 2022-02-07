import React, { useState } from 'react';
import TodoForm from './TodoForm';
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai';

interface Props {
    todos: DataTodo[];
    completeTodo: (id: string) => void;
    removeTodo: (id: string) => void;
    updateTodo: (id: string, newValue: DataTodo) => void;
}

const Todo = ({ todos, completeTodo, removeTodo, updateTodo }: Props) => {
    const [edit, setEdit] = useState<DataTodoEdit>({
        _id: null,
        title: ''
    });

    const submitUpdate = (value: DataTodo) => {
        updateTodo(edit._id!, value);
        setEdit({
            _id: null,
            title: ''
        });
    };

    if (edit._id) {
        return <TodoForm edit={edit} onSubmit={submitUpdate} />;
    }

    return (
        <>
            {todos.map((todo, index) => (
                <div
                    className={todo.done ? 'todo-row complete' : 'todo-row'}
                    key={index}
                >
                    <div key={todo._id} onClick={() => completeTodo(todo._id)}>
                        {todo.title}
                    </div>
                    <div className='icons'>
                        <AiFillCloseCircle
                            onClick={() => removeTodo(todo._id)}
                            className='delete-icon'
                        />
                        <AiFillEdit
                            onClick={() => setEdit({ _id: todo._id, title: todo.title })}
                            className='edit-icon'
                        />
                    </div>
                </div>
            ))}
        </>
    );
};

export default Todo;
