// 逻辑理清:
// list & sign -> 永远来自服务端
// list-modify -> 本地修改
// 初始进入时:
// 无网: list-modify > list
// 有网: fetch > list-modify ? > judge > clear list-modify
// 修改时:
// 无网: exist list-modify ? > create / update
// 有网: fetch

// 废弃:
// 只有在线且成功时才会更新 list / sign
// 一直有网:
// 更新会触发到 sign 更新 (sw) 和 list 更新 (暂时做在 UI 上)
// 一直没网:
// sign 不更新, list 更新 (sw)
// 没网操作了一会以后下次打开:
// sign 相同内容不同, 触发更新
// 没网操作了一会以后下次打开 (且有他人更新过):
// sign 不同, 触发 judge
// 有网操作了一会以后下次打开 (且有他人更新过):
// sign 不同
import shortId from 'shortid';
import { registerRoute } from 'workbox-routing';
import type { RouteHandlerCallbackOptions } from 'workbox-core';
import { API_DOMAIN, API_PREFIX, URL_ALL, HEADER_OFFLINE_MARK } from '../api/';

// TODO sign 的返回值也放 header 里吧, 统一一点
const REGEX_HANDLE_ALL = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/`);
const REGEX_HANDLE_ONE = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/([^/]+)$`);
const REGEX_HANDLE_DONES = new RegExp(`^${API_DOMAIN}/${API_PREFIX}/([^/]+)/(?:un)?done$`);
const CACHE_KEY_LIST = 'pwa_todos_cache_list';
export const CACHE_KEY_LIST_MODIFY = 'pwa_todos_cache_list_modify';
const CACHE_KEY_SIGN = 'pwa_todos_cache_sign';

export function openCache() {
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

export async function setCacheList(list: DataTodo[]) {
    const cache = await openCache();
    await cache.put(CACHE_KEY_LIST, genResponse(JSON.stringify(list)));
}

async function getCacheListModify(): Promise<DataTodo[] | undefined> {
    const cache = await openCache();
    const resp = await cache.match(CACHE_KEY_LIST_MODIFY);

    if (resp) {
        return resp.json();
    } else {
        return undefined;
    }
}

async function getCacheListModifyRobust(): Promise<DataTodo[]> {
    const list = await getCacheListModify();
    if (list) {
        return list;
    }
    return await getCacheList();
}

export async function setCacheListModify(list: DataTodo[]) {
    const cache = await openCache();
    await cache.put(CACHE_KEY_LIST_MODIFY, genResponse(JSON.stringify(list)));
}

export async function removeCacheListModify() {
    const cache = await openCache();
    await cache.delete(CACHE_KEY_LIST_MODIFY);
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
    return new Response(body, { headers: { 'Content-Type': 'application/json', [HEADER_OFFLINE_MARK]: '1' }, status: 200 });
}

function genResponseText(body: BodyInit | null) {
    return new Response(body, { headers: { [HEADER_OFFLINE_MARK]: '1' }, status: 200 });
}

export interface HandlerConfig {
    match: (req: Request) => boolean;
    cache: (resp: Response) => Promise<any>;
    offline: (req: Request) => Promise<Response>;
    attach?: (resp: Response) => Promise<Response>;
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
                getCacheListModifyRobust(),
                getCacheSign(),
            ]));
            return genResponse(JSON.stringify(body));
        },
        attach: async (resp: Response) => {
            // 按理来说这个不应该只运行在成功条件下的
            const modified = await getCacheListModify();
            if (modified) {
                const cloned = resp.clone();
                const json = await cloned.json();
                json.local = modified;
                return new Response(JSON.stringify(json), resp);
            } else {
                return resp;
            }
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
            const list = await getCacheListModifyRobust();
            const timeStr = (new Date()).toISOString();
            const line: DataTodo = { _id: shortId.generate(), title, done: false, createdAt: timeStr, updatedAt: timeStr };
            list.unshift(line);
            await setCacheListModify(list);
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
            const list = await getCacheListModifyRobust();
            const line = list.find(i => i._id === id);
            if (line) {
                line.title = title;
            }
            await setCacheListModify(list);
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
            const list = await getCacheListModifyRobust();
            await setCacheListModify(list.filter(i => i._id !== id));
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
            const list = await getCacheListModifyRobust();
            const line = list.find(i => i._id === id);
            if (line) {
                line.done = true;
            }
            await setCacheListModify(list);
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
            const list = await getCacheListModifyRobust();
            const line = list.find(i => i._id === id);
            if (line) {
                line.done = false;
            }
            await setCacheListModify(list);
            return genResponse(JSON.stringify({ ok: true, sign }));
        },
    },
];

function matchOne(request: Request) {
    return HANDLERS.find(h => h.match(request)) || { match: () => true, cache: () => Promise.resolve(), offline: () => Promise.resolve(new Response()) } as HandlerConfig;
}

const handlerAPI = async ({ request }: RouteHandlerCallbackOptions) => {
    const { cache, offline, attach } = matchOne(request);
    const reqClone = request.clone();
    let resp: Response;
    try {
        resp = await fetch(request);
        if (resp.status >= 400 && resp.status < 500) {
            resp = (await offline(reqClone)) as Response;
        } else {
            // 只有网络通了才会走到这
            cache(resp.clone());
            // FIXME 按理来说不应该放在这, 但是省事, 先这么干了
            resp = attach ? await attach(resp) : resp;
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
