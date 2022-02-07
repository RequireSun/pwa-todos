// 使用 inspirecloud 调用轻服务功能
const inspirecloud = require('@byteinspire/inspirecloud-api');

// 使用轻服务 coordination 表
// 若用户未创建，在发送第一条调用时会自动创建该表
const coordinationTable = inspirecloud.db.table('coordination');

// 导出 table 实例
module.exports = coordinationTable;
