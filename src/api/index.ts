const API_DOMAIN = 'https://pwa-todos.app.cloudendpoint.cn';
const API_PREFIX = 'api/todo';

export async function list(): Promise<{ list: DataTodo[]; sign: string | null }> {
    const resp = await fetch(`${API_DOMAIN}/${API_PREFIX}/`);
    const { list, sign } = await resp.json();
    return { list, sign };
}

export async function create(title: string, sign: string | null): Promise<{ result: DataTodo; sign: string }> {
    const resp = await fetch(`${API_DOMAIN}/${API_PREFIX}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            sign,
        }),
    });
    const { result, sign: newSign, error } = await resp.json();
    if (error) {
        throw new Error(error);
    } else {
        return { result, sign: newSign };
    }
}

export async function update(id: string, title: string, sign: string) {
    const resp = await fetch(`${API_DOMAIN}/${API_PREFIX}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            sign,
        }),
    });
    const { sign: newSign, error } = await resp.json();
    if (error) {
        throw new Error(error);
    } else {
        return { sign: newSign };
    }
}
