import { registerRoute } from 'workbox-routing';
import type { RouteHandlerCallbackOptions } from 'workbox-core';
import { API_DOMAIN, API_PREFIX, URL_ALL } from '../api/';

const REGEX_HANDLE_ALL = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/`);
const CACHE_KEY_LIST = 'pwa_todos_cache_list';
const CACHE_KEY_SIGN = 'pwa_todos_cache_sign';
const CACHE_KEY_CREATE = 'pwa_todos_cache_create';
const CACHE_KEY_UPDATE = 'pwa_todos_cache_update';
const CACHE_KEY_REMOVE = 'pwa_todos_cache_remove';

// 这里太丑了, 真写肯定要搞个模拟后端的结构出来
const HANDLERS = [
    {
        // list
        match: (req: Request) => {
            return req.url === URL_ALL && req.method === 'GET';
        },
        cache: async (resp: Response) => {
            const json = await resp.json();
            localStorage.setItem(CACHE_KEY_LIST, JSON.stringify(json.list));
            if (json.sign) {
                localStorage.setItem(CACHE_KEY_SIGN, json.sign);
            } else {
                localStorage.removeItem(CACHE_KEY_SIGN);
            }
        },
        offline: (req: Request) => {
            const list = localStorage.getItem(CACHE_KEY_LIST);
            const sign = localStorage.getItem(CACHE_KEY_SIGN);
            const body: any = {};
            if (list) {
                try {
                    body.list = JSON.parse(list);
                } catch (ex) {
                    body.list = [];
                }
            } else {
                body.list = [];
            }
            if (sign) {
                body.sign = sign;
            } else {
                body.sign = null;
            }
            return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'pwa-offline': '1' }, status: 200 });
        },
    },
    {
        // create
        match: (req: Request) => {
            return req.url === URL_ALL && req.method === 'POST';
        },
        cache: (resp: Response) => {},
        offline: (req: Request) => {},
    },
    {
        // update
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+$`)).test(req.url) && req.method === 'PUT';
        },
        cache: (resp: Response) => {},
        offline: (req: Request) => {},
    },
    {
        // remove
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+$`)).test(req.url) && req.method === 'DELETE';
        },
        cache: (resp: Response) => {},
        offline: (req: Request) => {},
    },
    {
        // done
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+/done$`)).test(req.url) && req.method === 'PUT';
        },
        cache: (resp: Response) => {},
        offline: (req: Request) => {},
    },
    {
        // undone
        match: (req: Request) => {
            return (new RegExp(`^${API_DOMAIN}/${API_PREFIX}/[^/]+/undone$`)).test(req.url) && req.method === 'PUT';
        },
        cache: (resp: Response) => {},
        offline: (req: Request) => {},
    },
];

function matchOne(request: Request) {
    return HANDLERS.find(h => h.match(request)) || { cache: () => undefined, offline: () => undefined };
}

// function offline() {
//     console.log('do offline');
//     const resp = new Response('123');
//     resp.headers.set('pwa-offline', '1');
//     return resp;
// }

const handlerAPI = async ({ request }: RouteHandlerCallbackOptions) => {
    const { cache, offline } = matchOne(request);
    let resp;
    try {
        resp = await fetch(request);
        if (resp.status >= 400 && resp.status < 500) {
            resp = offline(request);
        } else {
            cache(resp.clone());
        }
    } catch (ex) {
        console.error(ex);
        resp = offline(request);
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
