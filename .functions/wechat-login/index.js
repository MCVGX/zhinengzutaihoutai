const tcb = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app = tcb.init({
  env: process.env.TCB_ENV || tcb.getCurrentEnv()
});

const db = app.database();

/**
 * 生成用户ID
 */
function generateUserId(openid) {
  const timestamp = Date.now();
  const hash = openid ? openid.substring(0, 8) : Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}_${hash}`;
}

/**
 * 获取或创建用户
 */
async function getOrCreateUser(openId, appId, extraData) {
  // 使用 wechat_user 表
  const collection = db.collection('wechat_user');
  
  // 查询是否已存在该用户
  let existingUser = null;
  try {
    const result = await collection
      .where({ openid: openId })
      .get();
    
    if (result.data && result.data.length > 0) {
      existingUser = result.data[0];
    }
  } catch (e) {
    console.log('查询用户失败，可能表不存在或权限问题', e.message);
  }
  
  if (existingUser) {
    // 用户已存在，更新最后登录时间
    const updateData = {
      updatedAt: new Date()
    };
    
    // 如果提供了昵称和头像，也更新这些信息
    if (extraData.nickname) {
      updateData.nickname = extraData.nickname;
    }
    if (extraData.avatar) {
      updateData.avatar = extraData.avatar;
    }
    
    try {
      await collection
        .doc(existingUser._id)
        .update(updateData);
    } catch (e) {
      console.log('更新用户失败', e.message);
    }
    
    return {
      userId: existingUser._id,
      openid: existingUser.openid,
      isNewUser: false,
      nickname: existingUser.nickname || extraData.nickname || '',
      avatar: existingUser.avatar || extraData.avatar || ''
    };
  } else {
    // 创建新用户
    const userId = generateUserId(openId);
    const newUser = {
      userId,
      openid: openId || '',
      appId: appId || '',
      nickname: extraData.nickname || '',
      avatar: extraData.avatar || '',
      devices: [],
      created_at: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const addResult = await collection.add(newUser);
      return {
        userId: addResult.id || userId,
        openid: openId || '',
        appId: appId || '',
        isNewUser: true,
        nickname: newUser.nickname,
        avatar: newUser.avatar
      };
    } catch (e) {
      console.log('创建用户失败', e.message);
      // 如果创建失败，返回临时用户信息
      return {
        userId: userId,
        openid: openId || '',
        appId: appId || '',
        isNewUser: true,
        nickname: extraData.nickname || '',
        avatar: extraData.avatar || ''
      };
    }
  }
}

/**
 * 主函数：微信登录
 */
async function main(event, context) {
  try {
    // 获取微信用户信息
    // 在云函数中，需要通过微信服务器获取 openid
    // 这里从 event 中接收客户端传来的用户信息
    const { nickname, avatar } = event.data || {};
    
    // 获取调用者的 openid（云函数自动获取）
    const wxContext = event.WX_CONTEXT || {};
    const openId = wxContext.OPENID || '';
    const appId = wxContext.APPID || '';
    
    console.log('登录信息:', { openId, appId, nickname, avatar });
    
    // 如果没有 openid，返回错误
    if (!openId) {
      return {
        success: false,
        userId: '',
        openid: '',
        loginStatus: 'failed',
        isNewUser: false,
        error: '无法获取用户OpenID，请确保在小程序中调用'
      };
    }
    
    // 获取或创建用户
    const userResult = await getOrCreateUser(openId, appId, {
      nickname: nickname || '',
      avatar: avatar || ''
    });
    
    // 返回登录结果
    return {
      success: true,
      userId: userResult.userId,
      openid: userResult.openid,
      loginStatus: 'success',
      isNewUser: userResult.isNewUser,
      nickname: userResult.nickname,
      avatar: userResult.avatar
    };
  } catch (error) {
    console.error('微信登录失败:', error);
    return {
      success: false,
      userId: '',
      openid: '',
      loginStatus: 'failed',
      isNewUser: false,
      error: error.message || '登录失败'
    };
  }
}

module.exports = { main };
