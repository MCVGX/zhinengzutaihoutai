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
  // 使用时间戳和openid的hash组合生成唯一ID
  const timestamp = Date.now();
  const hash = openid.substring(0, 8);
  return `user_${timestamp}_${hash}`;
}

/**
 * 获取或创建用户
 */
async function getOrCreateUser(userInfo, extraData) {
  const { openId, appId } = userInfo;
  
  // 查询是否已存在该用户
  const existingUser = await db.collection('users')
    .where({ openid: openId })
    .get();
  
  if (existingUser.data.length > 0) {
    // 用户已存在，更新最后登录时间
    const user = existingUser.data[0];
    const updateData = {
      lastLoginAt: new Date().toISOString()
    };
    
    // 如果提供了昵称和头像，也更新这些信息
    if (extraData.nickname) {
      updateData.nickname = extraData.nickname;
    }
    if (extraData.avatar) {
      updateData.avatar = extraData.avatar;
    }
    
    await db.collection('users')
      .doc(user._id)
      .update(updateData);
    
    return {
      userId: user.userId,
      openid: user.openid,
      appId: user.appId,
      isNewUser: false,
      lastLoginAt: updateData.lastLoginAt,
      nickname: user.nickname || extraData.nickname,
      avatar: user.avatar || extraData.avatar
    };
  } else {
    // 创建新用户
    const userId = generateUserId(openId);
    const newUser = {
      userId,
      openid: openId,
      appId: appId,
      nickname: extraData.nickname || '',
      avatar: extraData.avatar || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    await db.collection('users').add(newUser);
    
    return {
      userId,
      openid: openId,
      appId: appId || '',
      isNewUser: true,
      lastLoginAt: newUser.lastLoginAt,
      nickname: newUser.nickname,
      avatar: newUser.avatar
    };
  }
}

/**
 * 主函数：微信登录
 */
async function main(event, context) {
  try {
    // 获取微信用户信息
    const userInfo = await app.auth().getUserInfo();
    
    // 获取额外的用户数据（昵称、头像等）
    const extraData = event.data || {};
    
    // 获取或创建用户
    const userResult = await getOrCreateUser(userInfo, extraData);
    
    // 返回登录结果
    return {
      userId: userResult.userId,
      openid: userResult.openid,
      appId: userResult.appId,
      loginStatus: 'success',
      isNewUser: userResult.isNewUser,
      nickname: userResult.nickname,
      avatar: userResult.avatar,
      lastLoginAt: userResult.lastLoginAt
    };
  } catch (error) {
    console.error('微信登录失败:', error);
    return {
      userId: '',
      openid: '',
      appId: '',
      loginStatus: 'failed',
      isNewUser: false,
      error: error.message
    };
  }
}

module.exports = { main };