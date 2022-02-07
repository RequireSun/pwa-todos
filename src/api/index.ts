const API_DOMAIN = 'https://pwa-todos.app.cloudendpoint.cn';
const API_PREFIX = 'api/todo';

export interface TodoItem {

}

export async function list() {
    const resp = await fetch(`${API_DOMAIN}/${API_PREFIX}/`);
    const { list, sign } = await resp.json();
    return { list, sign };
}

export async function update(id: string, title: string) {}
