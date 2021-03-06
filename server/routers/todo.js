const Router = require('@koa/router');
// Koa 的路由在被 use 时是无法指定前缀的, 需要在定义时就指定前缀
const router = Router({
  prefix: '/api/todo'
});

const todoController = require('../controllers/todoController');

// 组装路由
router.get('/', todoController.listAll);
router.post('/', todoController.create);
router.put('/', todoController.coverage);
router.delete('/', todoController.deleteAll);

router.put('/:id', todoController.update);
router.delete('/:id', todoController.delete);
router.put('/:id/done', todoController.done);
router.put('/:id/undone', todoController.undone);

// Koa 的路由需要调用 routes 函数获取实际用于 use 的函数
module.exports = router.routes();
