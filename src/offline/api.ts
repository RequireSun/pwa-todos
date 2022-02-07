import shortId from 'shortid';
import { registerRoute } from 'workbox-routing';
import type { RouteHandlerCallbackOptions } from 'workbox-core';
import { API_DOMAIN, API_PREFIX, URL_ALL } from '../api/';

// TODO sign 的返回值也放 header 里吧, 统一一点
const REGEX_HANDLE_ALL = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/`);
const REGEX_HANDLE_ONE = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/([^/]+)$`);
const REGEX_HANDLE_DONES = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/([^/]+)/(?:un)?done$`);
const CACHE_KEY_LIST = 'pwa_todos_cache_list';
const CACHE_KEY_SIGN = 'pwa_todos_cache_sign';

function openCache() {
    return caches.open('pwa_todos_cache');
}

async function getCacheList(): Promise<DataTodo[]> {
    const cache = await openCache();
    const resp = await cache.match(CACHE_KEY_LIST);

    if (resp) {
        return resp.json();
    } else {
        return [];
    }
}

async function setCacheList(list: DataTodo[]) {
    const cache = await openCache();
    await cache.put(CACHE_KEY_LIST, genResponse(JSON.stringify(list)));
}

async function getCacheSign() {
    const cache = await openCache();
    const resp = await cache.match(CACHE_KEY_SIGN);
    if (resp) {
        return resp.text();
    } else {
        return null;
    }
}

async function setCacheSign(sign: string | null) {
    const cache = await openCache();
    if (sign) {
        await cache.put(CACHE_KEY_SIGN, genResponseText(sign));
    } else {
        await cache.delete(CACHE_KEY_SIGN);
    }
}

function genResponse(body: BodyInit | null) {
    return new Response(body, { headers: { 'Content-Type': 'application/json', 'pwa-offline': '1' }, status: 200 });
}

function genResponseText(body: BodyInit | null) {
    return new Response(body, { headers: { 'pwa-offline': '1' }, status: 200 });
}

export interface HandlerConfig {
    match: (req: Request) => boolean;
    cache: (resp: Response) => Promise<any>;
    offline: (req: Request) => Promise<Response>;
}

// 这里太丑了, 真写肯定要搞个模拟后端的结构出来
const HANDLERS: HandlerConfig[] = [
    {
        // list
        match: (req: Request) => {
            return req.url === URL_ALL && req.method === 'GET';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await Promise.all([
                setCacheList(json.list),
                setCacheSign(json.sign),
            ]);
        },
        offline: async (req: Request) => {
            const body: any = {};
            ([body.list, body.sign] = await Promise.all([
                getCacheList(),
                getCacheSign(),
            ]))
            return genResponse(JSON.stringify(body));
        },
    },
    {
        // create
        match: (req: Request) => {
            return req.url === URL_ALL && req.method === 'POST';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await setCacheSign(json.sign);
        },
        offline: async (req: Request) => {
            const { title } = await req.json();
            const sign = req.headers.get('Coordination-Sign');
            const list = await getCacheList();
            const timeStr = (new Date()).toISOString();
            const line: DataTodo = { _id: shortId.generate(), title, done: false, createdAt: timeStr, updatedAt: timeStr };
            list.unshift(line);
            await setCacheList(list);
            return genResponse(JSON.stringify({ result: line, sign }));
        },
    },
    {
        // update
        match: (req: Request) => {
            return REGEX_HANDLE_ONE.test(req.url) && req.method === 'PUT';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await setCacheSign(json.sign);
        },
        offline: async (req: Request) => {
            const { title } = await req.json();
            const id = req.url.match(REGEX_HANDLE_ONE)![1];
            const sign = req.headers.get('Coordination-Sign');
            const list = await getCacheList();
            const line = list.find(i => i._id === id);
            if (line) {
                line.title = title;
            }
            await setCacheList(list);
            return genResponse(JSON.stringify({ ok: true, sign }));
        },
    },
    {
        // remove
        match: (req: Request) => {
            return REGEX_HANDLE_ONE.test(req.url) && req.method === 'DELETE';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await setCacheSign(json.sign);
        },
        offline: async (req: Request) => {
            const id = req.url.match(REGEX_HANDLE_ONE)![1];
            const sign = req.headers.get('Coordination-Sign');
            const list = await getCacheList();
            await setCacheList(list.filter(i => i._id !== id));
            return genResponse(JSON.stringify({ ok: true, sign }));
        },
    },
    {
        // done
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+/done$`)).test(req.url) && req.method === 'PUT';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await setCacheSign(json.sign);
        },
        offline: async (req: Request) => {
            const id = req.url.match(REGEX_HANDLE_DONES)![1];
            const sign = req.headers.get('Coordination-Sign');
            const list = await getCacheList();
            const line = list.find(i => i._id === id);
            if (line) {
                line.done = true;
            }
            await setCacheList(list);
            return genResponse(JSON.stringify({ ok: true, sign }));
        },
    },
    {
        // undone
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+/undone$`)).test(req.url) && req.method === 'PUT';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            await setCacheSign(json.sign);
        },
        offline: async (req: Request) => {
            const id = req.url.match(REGEX_HANDLE_DONES)![1];
            const sign = req.headers.get('Coordination-Sign');
            const list = await getCacheList();
            const line = list.find(i => i._id === id);
            if (line) {
                line.done = false;
            }
            await setCacheList(list);
            return genResponse(JSON.stringify({ ok: true, sign }));
        },
    },
];

function matchOne(request: Request) {
    return HANDLERS.find(h => h.match(request)) || { cache: () => undefined, offline: () => undefined };
}

const handlerAPI = async ({ request }: RouteHandlerCallbackOptions) => {
    const { cache, offline } = matchOne(request);
    const reqClone = request.clone();
    let resp: Response;
    try {
        resp = await fetch(request);
        if (resp.status >= 400 && resp.status < 500) {
            resp = (await offline(reqClone)) as Response;
        } else {
            cache(resp.clone());
        }
    } catch (ex) {
        resp = (await offline(reqClone)) as Response;
        console.warn('fetch failed, ex:', ex, ', use cache:', resp);
    }
    return Promise.resolve(resp);
};

export function registerRouteAPI() {
    // 非同域需要写明路径, METHOD 找不到汇总方法, 只能分开写了
    registerRoute(REGEX_HANDLE_ALL, handlerAPI, 'GET');
    registerRoute(REGEX_HANDLE_ALL, handlerAPI, 'POST');
    registerRoute(REGEX_HANDLE_ALL, handlerAPI, 'PUT');
    registerRoute(REGEX_HANDLE_ALL, handlerAPI, 'DELETE');
}
