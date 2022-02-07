const todoService = require('../services/todoService');

/**
 * TodoController
 * Controller 是业务入口，由 HTTP 路由解析后调用
 * 包含待办事项的增删改查功能
 */
class TodoController {
  /**
   * 列出所有待办事项
   * 响应格式
   * {
   *   list: [todo1, todo2]
   * }
   * @param ctx Koa 的上下文参数
   */
  async listAll(ctx) {
    const { list, sign } = await todoService.listAll();
    ctx.body = { list, sign };
  }

  /**
   * 创建一条待办事项
   * 响应格式
   * {
   *   result: newTodo
   * }
   * @param ctx Koa 的上下文参数
   */
  async create(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { title, done = false } = ctx.request.body;
    const { result, sign: newSign } = await todoService.create({ title, done }, sign);
    ctx.body = { result, sign: newSign };
  }

  async update(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { title } = ctx.request.body;
    const { sign: newSign } = await todoService.update(ctx.params.id, { title }, sign);
    ctx.body = { ok: true, sign: newSign };
  }

  /**
   * 删除一条待办事项
   * 响应格式
   * {
   *   ok: true
   * }
   * @param ctx Koa 的上下文参数
   */
  async delete(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { sign: newSign } = await todoService.delete(ctx.params.id, sign);
    ctx.body = { ok: true, sign: newSign };
  }

  /**
   * 删除所有待办事项
   * 响应格式
   * {
   *   ok: true
   * }
   * @param ctx Koa 的上下文参数
   */
  async deleteAll(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { sign: newSign } = await todoService.deleteAll(sign);
    ctx.body = { ok: true, sign: newSign };
  }

  /**
   * 将一条待办事项状态设为 done
   * 响应格式
   * {
   *   ok: true
   * }
   * @param ctx Koa 的上下文参数
   */
  async done(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { sign: newSign } = await todoService.update(ctx.params.id, { done: true }, sign);
    ctx.body = { ok: true, sign: newSign };
  }

  /**
   * 将一条待办事项状态设为 undone
   * 响应格式
   * {
   *   ok: true
   * }
   * @param ctx Koa 的上下文参数
   */
  async undone(ctx) {
    const { 'coordination-sign': sign } = ctx.request.headers;
    const { sign: newSign } = await todoService.update(ctx.params.id, { done: false }, sign);
    ctx.body = { ok: true, sign: newSign };
  }
}

// 导出 Controller 的实例
module.exports = new TodoController();
