const shortId = require('shortid');
const todoTable = require('../models/todoTable');
const coordinationTable = require('../models/coordinationTable');
const inspirecloud = require('@byteinspire/inspirecloud-api');
const ObjectId = inspirecloud.db.ObjectId;

async function checkSign(sign) {
  const dbSign = await coordinationTable.where({ title: 'todo' }).findOne();
  if (dbSign && dbSign.sign !== sign) {
    throw new Error('need-refresh');
  }
  return dbSign;
}

async function updateSign(dbSign) {
  // 连更新带保存
  return coordinationTable.save(Object.assign(dbSign || {}, { title: 'todo', sign: shortId.generate() }));
}

/**
 * TodoService
 * Service 是业务具体实现，由 Controller 或其它 Service 调用
 * 包含待办事项的增删改查功能
 */
class TodoService {
  /**
   * 列出所有待办事项
   * @return {Promise<{ list: Array<any>; sign: string | undefined }>} 返回待办事项数组
   */
  async listAll() {
    const [list, sign] = await Promise.all([
      todoTable.where().find(),
      coordinationTable.where({ title: 'todo' }).findOne(),
    ]);
    return { list, sign: sign ? sign.sign : null };
  }

  /**
   * 创建一条待办事项
   * @param todo 用于创建待办事项的数据，原样存进数据库
   * @param sign 标记, 防止冲突
   * @return {Promise<any>} 返回实际插入数据库的数据，会增加_id，createdAt和updatedAt字段
   */
  async create(todo, sign) {
    const dbSign = await checkSign(sign);

    const [result, newSign] = await Promise.all([
      todoTable.save(todo),
      updateSign(dbSign),
    ]);

    return { result, sign: newSign.sign };
  }

  /**
   * 删除一条待办事项
   * @param id 待办事项的 _id
   * @param sign 标记, 防止冲突
   * 若不存在，则抛出 404 错误
   */
  async delete(id, sign) {
    const dbSign = await checkSign(sign);

    const result = await todoTable.where({ _id: ObjectId(id) }).delete();
    if (result.deletedCount === 0) {
      const error = new Error(`todo:${id} not found`);
      error.status = 404;
      throw error;
    }

    const { sign: newSign } = await updateSign(dbSign);
    return { sign: newSign };
  }

  /**
   * 删除所有待办事项
   */
  async deleteAll(sign) {
    const dbSign = await checkSign(sign);
    await todoTable.where().delete();
    const { sign: newSign } = await updateSign(dbSign);
    return { sign: newSign };
  }

  /**
   * 更新一条待办事项
   * @param id 待办事项的 _id
   * @param updater 将会用原对象 merge 此对象进行更新
   * @param sign 标记, 防止冲突
   * 若不存在，则抛出 404 错误
   */
  async update(id, updater, sign) {
    const dbSign = await checkSign(sign);

    const todo = await todoTable.where({_id: ObjectId(id)}).findOne();
    if (!todo) {
      const error = new Error(`todo:${id} not found`);
      error.status = 404;
      throw error;
    }
    Object.assign(todo, updater);
    await todoTable.save(todo);

    const { sign: newSign } = await updateSign(dbSign);
    return { sign: newSign };
  }
}

// 导出 Service 的实例
module.exports = new TodoService();
