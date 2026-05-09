const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;

/**
 * 验证设备用户绑定关系
 * 输入：deviceId(设备序列号), userId(用户ID)
 * 返回：用户是否拥有该设备
 */
exports.main = async (event, context) => {
  const { deviceId, userId } = event;

  // 参数校验
  if (!deviceId || !userId) {
    return {
      success: false,
      message: '缺少必要参数：deviceId 和 userId',
      hasBinding: false,
    };
  }

  try {
    // 查询设备绑定关系
    const device = await db.collection('devices').where({
      deviceId: deviceId,
      userId: userId,
      status: 'active',
    }).get();

    const hasBinding = device.data && device.data.length > 0;

    return {
      success: true,
      hasBinding: hasBinding,
      deviceId: deviceId,
      userId: userId,
      message: hasBinding ? '绑定关系验证成功' : '用户未绑定该设备',
    };
  } catch (error) {
    return {
      success: false,
      message: '验证失败：' + error.message,
      hasBinding: false,
    };
  }
};
