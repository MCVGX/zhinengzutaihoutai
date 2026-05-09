const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;

/**
 * 上传配置表
 * 输入：deviceId(设备序列号), userId(用户ID), configType(文件类型: db/json), configContent(文件内容)
 * 验证用户是否拥有该设备，验证通过后保存文件并记录上传历史
 */
exports.main = async (event, context) => {
  const { deviceId, userId, configType, configContent, changeLog } = event;

  // 参数校验
  if (!deviceId || !userId) {
    return {
      success: false,
      message: '缺少必要参数：deviceId 和 userId',
    };
  }

  if (!configType || !['db', 'json'].includes(configType)) {
    return {
      success: false,
      message: '缺少必要参数：configType (db/json)',
    };
  }

  if (!configContent) {
    return {
      success: false,
      message: '缺少必要参数：configContent',
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
        message: '用户未绑定该设备，无权限上传配置',
      };
    }

    // 获取当前版本号
    const currentConfig = await db.collection('device_configs').where({
      deviceId: deviceId,
      configType: configType,
    }).get();

    const newVersion = currentConfig.data && currentConfig.data.length > 0
      ? currentConfig.data[0].version + 1
      : 1;

    const now = new Date();

    // 保存或更新配置
    if (currentConfig.data && currentConfig.data.length > 0) {
      // 更新配置
      await db.collection('device_configs').where({
        deviceId: deviceId,
        configType: configType,
      }).update({
        configContent: configContent,
        version: newVersion,
        updatedAt: now,
        updatedBy: userId,
      });
    } else {
      // 新增配置
      await db.collection('device_configs').add({
        deviceId: deviceId,
        configType: configType,
        configContent: configContent,
        version: newVersion,
        updatedAt: now,
        updatedBy: userId,
      });
    }

    // 记录上传历史
    await db.collection('config_history').add({
      deviceId: deviceId,
      configType: configType,
      version: newVersion,
      configContent: configContent,
      changeLog: changeLog || `上传${configType}配置文件`,
      createdAt: now,
      createdBy: userId,
    });

    return {
      success: true,
      message: '配置上传成功',
      data: {
        deviceId: deviceId,
        configType: configType,
        version: newVersion,
        updatedAt: now,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: '上传失败：' + error.message,
    };
  }
};
