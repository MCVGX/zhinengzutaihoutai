const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;

/**
 * 对比配置表
 * 输入：deviceId(设备序列号), userId(用户ID), localConfig(本地配置内容), configType(配置类型: db/json)
 * 将上传的配置表和云端配置表进行对比，返回差异
 */
exports.main = async (event, context) => {
  const { deviceId, userId, localConfig, configType } = event;

  // 参数校验
  if (!deviceId || !userId) {
    return {
      success: false,
      message: '缺少必要参数：deviceId 和 userId',
    };
  }

  if (!localConfig) {
    return {
      success: false,
      message: '缺少必要参数：localConfig',
    };
  }

  if (!configType || !['db', 'json'].includes(configType)) {
    configType = 'json'; // 默认为json
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
        message: '用户未绑定该设备，无权限对比配置',
      };
    }

    // 获取云端配置
    const cloudConfig = await db.collection('device_configs').where({
      deviceId: deviceId,
      configType: configType,
    }).get();

    // 如果云端没有配置
    if (!cloudConfig.data || cloudConfig.data.length === 0) {
      return {
        success: true,
        message: '云端暂无配置，本地配置为新配置',
        data: {
          hasCloudConfig: false,
          hasDifferences: true,
          differenceType: 'new',
          localVersion: 0,
          cloudVersion: 0,
          localConfig: localConfig,
          cloudConfig: null,
          differences: null,
        },
      };
    }

    const cloudConfigData = cloudConfig.data[0];
    const cloudVersion = cloudConfigData.version;
    const cloudConfigContent = cloudConfigData.configContent;

    // 解析配置内容进行对比
    let localParsed = null;
    let cloudParsed = null;
    let differences = null;
    let differenceType = 'identical';

    try {
      if (configType === 'json') {
        localParsed = JSON.parse(localConfig);
        cloudParsed = JSON.parse(cloudConfigContent);
        differences = deepCompare(localParsed, cloudParsed);
        differenceType = differences.hasDifferences ? 'modified' : 'identical';
      } else {
        // db配置按字符串对比
        differences = compareStrings(localConfig, cloudConfigContent);
        differenceType = differences.hasDifferences ? 'modified' : 'identical';
      }
    } catch (e) {
      // 解析失败，按字符串对比
      differences = compareStrings(localConfig, cloudConfigContent);
      differenceType = differences.hasDifferences ? 'modified' : 'identical';
    }

    return {
      success: true,
      message: differenceType === 'identical' ? '配置一致' : '配置存在差异',
      data: {
        hasCloudConfig: true,
        hasDifferences: differenceType !== 'identical',
        differenceType: differenceType,
        localVersion: cloudVersion + 1,
        cloudVersion: cloudVersion,
        localConfig: localConfig,
        cloudConfig: cloudConfigContent,
        differences: differences,
        updatedAt: cloudConfigData.updatedAt,
        updatedBy: cloudConfigData.updatedBy,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: '对比失败：' + error.message,
    };
  }
};

/**
 * 深度对比两个JSON对象
 */
function deepCompare(obj1, obj2, path = '') {
  const differences = {
    hasDifferences: false,
    added: [],
    removed: [],
    modified: [],
  };

  const keys1 = obj1 ? Object.keys(obj1) : [];
  const keys2 = obj2 ? Object.keys(obj2) : [];
  const allKeys = new Set([...keys1, ...keys2]);

  allKeys.forEach((key) => {
    const currentPath = path ? `${path}.${key}` : key;
    const inObj1 = obj1 && key in obj1;
    const inObj2 = obj2 && key in obj2;

    if (inObj1 && !inObj2) {
      differences.removed.push(currentPath);
      differences.hasDifferences = true;
    } else if (!inObj1 && inObj2) {
      differences.added.push(currentPath);
      differences.hasDifferences = true;
    } else if (inObj1 && inObj2) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
        const nested = deepCompare(val1, val2, currentPath);
        if (nested.hasDifferences) {
          differences.added.push(...nested.added);
          differences.removed.push(...nested.removed);
          differences.modified.push(...nested.modified);
          differences.hasDifferences = true;
        }
      } else if (val1 !== val2) {
        differences.modified.push({
          path: currentPath,
          oldValue: val2,
          newValue: val1,
        });
        differences.hasDifferences = true;
      }
    }
  });

  return differences;
}

/**
 * 字符串对比
 */
function compareStrings(str1, str2) {
  const lines1 = str1.split('\n');
  const lines2 = str2.split('\n');

  const differences = {
    hasDifferences: str1 !== str2,
    lineDifferences: [],
  };

  const maxLines = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLines; i++) {
    if (lines1[i] !== lines2[i]) {
      differences.lineDifferences.push({
        line: i + 1,
        localLine: lines1[i] || '',
        cloudLine: lines2[i] || '',
      });
    }
  }

  return differences;
}
