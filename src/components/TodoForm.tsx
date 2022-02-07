import React, { useState, useEffect, useRef } from 'react';

function TodoForm(props: { edit?: DataTodoEdit; onSubmit: (todo: Partial<DataTodo>) => void }) {
    const [input, setInput] = useState(props.edit ? props.edit.title : '');

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    });

    const handleChange = (e: any) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        props.onSubmit({
            title: input,
        });
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className='todo-form'>
            {props.edit ? (
                <>
                    <input
                        placeholder='Update your item'
                        value={input}
                        onChange={handleChange}
                        name='text'
                        ref={inputRef}
                        className='todo-input edit'
                    />
                    <button onClick={handleSubmit} className='todo-button edit'>
                        Update
                    </button>
                </>
            ) : (
                <>
                    <input
                        placeholder='Input text here...'
                        value={input}
                        onChange={handleChange}
                        name='text'
                        className='todo-input'
                        ref={inputRef}
                    />
                    <button onClick={handleSubmit} className='todo-button'>
                        Add
                    </button>
                </>
            )}
        </form>
    );
}

export default TodoForm;
