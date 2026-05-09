const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;

/**
 * 同步JSON配置表
 * 输入：deviceId(设备序列号), userId(用户ID), configContent(JSON文件内容)
 * 验证用户是否拥有该设备，更新设备的JSON文件，保证小程序和电脑同步
 */
exports.main = async (event, context) => {
  const { deviceId, userId, configContent, forceSync } = event;

  // 参数校验
  if (!deviceId || !userId) {
    return {
      success: false,
      message: '缺少必要参数：deviceId 和 userId',
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
        message: '用户未绑定该设备，无权限同步配置',
      };
    }

    // 获取当前JSON配置
    const currentConfig = await db.collection('device_configs').where({
      deviceId: deviceId,
      configType: 'json',
    }).get();

    let oldVersion = 0;
    let newVersion = 1;
    let isNewConfig = true;
    let syncMessage = '首次创建JSON配置';

    if (currentConfig.data && currentConfig.data.length > 0) {
      isNewConfig = false;
      oldVersion = currentConfig.data[0].version;
      newVersion = oldVersion + 1;
      syncMessage = `从版本 ${oldVersion} 同步到版本 ${newVersion}`;
    }

    const now = new Date();

    // 验证JSON格式是否有效
    try {
      JSON.parse(configContent);
    } catch (e) {
      return {
        success: false,
        message: 'JSON格式无效：' + e.message,
      };
    }

    // 保存或更新配置
    if (isNewConfig) {
      await db.collection('device_configs').add({
        deviceId: deviceId,
        configType: 'json',
        configContent: configContent,
        version: newVersion,
        updatedAt: now,
        updatedBy: userId,
      });
    } else {
      await db.collection('device_configs').where({
        deviceId: deviceId,
        configType: 'json',
      }).update({
        configContent: configContent,
        version: newVersion,
        updatedAt: now,
        updatedBy: userId,
      });
    }

    // 记录同步历史
    await db.collection('config_history').add({
      deviceId: deviceId,
      configType: 'json',
      version: newVersion,
      configContent: configContent,
      changeLog: forceSync ? '强制同步JSON配置' : syncMessage,
      createdAt: now,
      createdBy: userId,
    });

    return {
      success: true,
      message: 'JSON配置同步成功',
      data: {
        deviceId: deviceId,
        configType: 'json',
        oldVersion: oldVersion,
        newVersion: newVersion,
        isNewConfig: isNewConfig,
        updatedAt: now,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: '同步失败：' + error.message,
    };
  }
};
