const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;

/**
 * 获取设备配置表
 * 输入：deviceId(设备序列号), userId(用户ID)
 * 验证用户是否拥有该设备，返回该设备的最新配置表（db和json文件）
 */
exports.main = async (event, context) => {
  const { deviceId, userId } = event;

  // 参数校验
  if (!deviceId || !userId) {
    return {
      success: false,
      message: '缺少必要参数：deviceId 和 userId',
    };
  }

  try {
    // 验证设备绑定关系
    const device = await db.collection('devices').where({
      deviceId: deviceId,
      userId: userId,
      status: 'active',
    }).get();

    if (!device.data || device.data.length === 0) {
      return {
        success: false,
        message: '用户未绑定该设备，无权限获取配置',
      };
    }

    // 获取设备的db和json配置
    const configs = await db.collection('device_configs').where({
      deviceId: deviceId,
    }).get();

    // 整理配置数据
    const result = {
      db: null,
      json: null,
    };

    if (configs.data) {
      configs.data.forEach((config) => {
        if (config.configType === 'db') {
          result.db = {
            configContent: config.configContent,
            version: config.version,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy,
          };
        } else if (config.configType === 'json') {
          result.json = {
            configContent: config.configContent,
            version: config.version,
            updatedAt: config.updatedAt,
            updatedBy: config.updatedBy,
          };
        }
      });
    }

    return {
      success: true,
      message: '获取配置成功',
      data: {
        deviceId: deviceId,
        db: result.db,
        json: result.json,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: '获取配置失败：' + error.message,
    };
  }
};
