import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { list, create, update, remove, done, undone, coverage } from '../../api';
import { setCacheList, openCache, CACHE_KEY_LIST_MODIFY, removeCacheListModify } from '../../offline/api';
import TodoForm from '../TodoForm';
import Todo from '../Todo';
import IconLoading from '../IconLoading';
import './TodoList.css';

function TodoList() {
    const [todos, setTodos] = useState<DataTodo[]>([]);
    const [sign, setSign] = useState<string | null>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        list().then(({ list, local, sign: _sign, isOffline: _isOffline }) => {
            setTodos(list);
            setSign(_sign);
            setIsOffline(_isOffline);
            if (local) {
                // eslint-disable-next-line no-restricted-globals
                const cover = confirm(`您存在一个本地版本, 是否使用该版本覆盖云端版本？\n${JSON.stringify(local)}`);
                if (cover) {
                    coverage(local, _sign).then(({ sign: __sign }) => {
                        setTodos(local);
                        setSign(__sign);
                        setIsLoading(false);
                        removeCacheListModify();
                    });
                } else {
                    openCache().then(cache => cache.delete(CACHE_KEY_LIST_MODIFY));
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        });
    }, []);

    const addTodo = (todo: Partial<DataTodo>) => {
        if (!todo.title || /^\s*$/.test(todo.title)) {
            return;
        }

        setIsLoading(true);
        create(todo.title, sign).then(({ result, sign: newSign, isOffline: _isOffline }) => {
            const newList = [result, ...todos];
            setTodos(newList);
            setSign(newSign);
            setIsLoading(false);
            // FIXME 很蠢, 但是暂时只能这么干了
            //   离线模式下在 sw 里做了, 在线模式下只能手动存了
            !_isOffline && setCacheList(newList);
        });
    };

    const updateTodo = (todoId: string, newValue: Partial<DataTodo>) => {
        if (!todoId || !newValue.title || /^\s*$/.test(newValue.title)) {
            return;
        }

        setIsLoading(true);
        update(todoId, newValue.title, sign).then(({ sign: newSign, isOffline: _isOffline }) => {
            const newList = todos.map(item => (item._id === todoId ? { ...item, ...newValue } : item));
            setTodos(newList);
            setSign(newSign);
            setIsLoading(false);
            // FIXME 很蠢, 但是暂时只能这么干了
            //   离线模式下在 sw 里做了, 在线模式下只能手动存了
            !_isOffline && setCacheList(newList);
        });
    };

    const removeTodo = (id: string) => {
        if (!id) {
            return;
        }

        setIsLoading(true);
        remove(id, sign).then(({ sign: newSign, isOffline: _isOffline }) => {
            const newList = todos.filter(todo => todo._id !== id);
            setTodos(newList);
            setSign(newSign);
            setIsLoading(false);
            // FIXME 很蠢, 但是暂时只能这么干了
            //   离线模式下在 sw 里做了, 在线模式下只能手动存了
            !_isOffline && setCacheList(newList);
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
            undone(id, sign).then(({ sign: newSign, isOffline: _isOffline }) => {
                current.done = !current.done;
                const newList = [...todos];
                setTodos(newList);
                setSign(newSign);
                setIsLoading(false);
                // FIXME 很蠢, 但是暂时只能这么干了
                //   离线模式下在 sw 里做了, 在线模式下只能手动存了
                !_isOffline && setCacheList(newList);
            });
        } else {
            done(id, sign).then(({ sign: newSign, isOffline: _isOffline }) => {
                current.done = !current.done;
                const newList = [...todos];
                setTodos(newList);
                setSign(newSign);
                setIsLoading(false);
                // FIXME 很蠢, 但是暂时只能这么干了
                //   离线模式下在 sw 里做了, 在线模式下只能手动存了
                !_isOffline && setCacheList(newList);
            });
        }
    };

    return (
        <>
            <div className={classNames('conor', isOffline ? 'danger' : '')}>Current Sign({isOffline ? 'Offline' : 'Server'}) is: {sign}</div>
            <h1>What is your mission for the day?</h1>
            <TodoForm onSubmit={addTodo} />
            <div className="desc">Click to make it done / undone.</div>
            <Todo
                todos={todos}
                completeTodo={completeTodo}
                removeTodo={removeTodo}
                updateTodo={updateTodo}
            />
            <div className="extra">本示例程序只处理了有 / 无网络时进入页面且持续操作的场景，未处理页面内编辑时网络变化的复杂场景。</div>
            {isLoading ? (
                <div className="loading-wrapper">
                    <div className="loading-container">
                        <IconLoading/>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default TodoList;
