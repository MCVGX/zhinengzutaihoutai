// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Copy, Check, Download, Upload, LogIn, Database, Link2, FileJson, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

export default function APIDocs({
  $w
}) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedSection, setExpandedSection] = useState('login');
  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  const toggleSection = section => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ==================== 1. 微信登录 ====================
  const loginDocs = {
    cloudFunction: 'wechat-login',
    description: '微信用户登录，自动创建或更新用户记录',
    params: [{
      name: 'nickname',
      type: 'string',
      required: false,
      desc: '用户昵称'
    }, {
      name: 'avatar',
      type: 'string',
      required: false,
      desc: '用户头像URL'
    }],
    response: {
      success: {
        loginStatus: 'success',
        userId: 'user_xxx',
        openid: 'oxxx',
        isNewUser: false,
        nickname: '',
        avatar: '',
        lastLoginAt: '2026-05-07T10:00:00Z'
      },
      failed: {
        loginStatus: 'failed',
        error: '错误信息'
      }
    },
    wechatCode: `// 微信小程序 - 登录
wx.cloud.callFunction({
  name: 'wechat-login',
  data: {
    nickname: userInfo.nickName,
    avatar: userInfo.avatarUrl
  },
  success: res => {
    if (res.result.loginStatus === 'success') {
      // 登录成功，保存用户信息
      wx.setStorageSync('userInfo', res.result);
      console.log('用户ID:', res.result.userId);
    }
  },
  fail: err => console.error('登录失败', err)
});`
  };

  // ==================== 2. 文件上传 ====================
  const uploadDocs = {
    cloudFunction: 'config-upload',
    description: '上传配置文件(.json/.db)到云存储，并记录到数据库',
    params: [{
      name: 'serialNumber',
      type: 'string',
      required: true,
      desc: '设备序列号'
    }, {
      name: 'fileType',
      type: 'string',
      required: true,
      desc: '文件类型: json/db'
    }, {
      name: 'fileUrl',
      type: 'string',
      required: true,
      desc: '云存储文件ID'
    }],
    response: {
      success: {
        success: true,
        fileId: 'cloud://xxx',
        version: 1
      },
      failed: {
        success: false,
        error: '错误信息'
      }
    },
    wechatCode: `// 微信小程序 - 选择并上传文件
wx.chooseMessageFile({
  count: 1,
  type: 'file',
  extension: ['json', 'db'],
  success: async res => {
    const tempFile = res.tempFiles[0];
    const fileName = tempFile.name;
    const fileType = fileName.endsWith('.json') ? 'json' : 'db';
    
    // 1. 上传到云存储
    const cloudPath = 'configs/' + Date.now() + '-' + fileName;
    const uploadRes = await wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFile.path
    });
    
    // 2. 调用云函数记录到数据库
    wx.cloud.callFunction({
      name: 'config-upload',
      data: {
        serialNumber: 'DEV-2026-001',
        fileType: fileType,
        fileUrl: uploadRes.fileID
      },
      success: r => console.log('上传成功', r.result)
    });
  }
});`,
    dbSchema: `// config_file 表结构
{
  _id: "xxx",
  filename: "config.json",
  type: "json",
  size: "1024",
  device_serial_number: "DEV-2026-001",
  file_content: "",
  upload_user: "user_xxx",
  upload_time: "2026-05-07T10:00:00Z"
}`
  };

  // ==================== 3. 文件下载 ====================
  const downloadDocs = {
    cloudFunction: 'config-download',
    description: '获取配置表下载链接',
    params: [{
      name: 'fileId',
      type: 'string',
      required: true,
      desc: '云存储文件ID'
    }],
    response: {
      success: {
        success: true,
        downloadUrl: 'https://xxx?sign=xxx',
        expires: 3600
      },
      failed: {
        success: false,
        error: '错误信息'
      }
    },
    wechatCode: `// 微信小程序 - 下载配置文件
// 方式1: 直接下载
wx.cloud.downloadFile({
  fileID: 'cloud://xxx',
  success: res => {
    const fs = wx.getFileSystemManager();
    // 读取文件内容
    fs.readFileSync(res.tempFilePath, 'utf8');
  }
});

// 方式2: 获取临时链接（推荐长期使用）
wx.cloud.callFunction({
  name: 'config-download',
  data: { fileId: 'cloud://xxx' },
  success: res => {
    if (res.result.success) {
      // 下载URL，有效期1小时
      const url = res.result.downloadUrl;
      wx.downloadFile({ url: url });
    }
  }
});`
  };

  // ==================== 4. 设备绑定 ====================
  const bindingDocs = {
    cloudFunction: 'device-binding',
    description: '设备绑定与序列号验证',
    params: [{
      name: 'action',
      type: 'string',
      required: true,
      desc: '操作类型: bind/verify/unbind'
    }, {
      name: 'serialNumber',
      type: 'string',
      required: true,
      desc: '设备序列号'
    }, {
      name: 'userId',
      type: 'string',
      required: 'action=bind时',
      desc: '用户ID'
    }],
    response: {
      bind: {
        success: true,
        message: '绑定成功',
        bindUser: 'user_xxx'
      },
      verify: {
        success: true,
        message: '验证成功',
        bindUser: 'user_xxx',
        status: 'online'
      },
      unbind: {
        success: true,
        message: '解绑成功'
      }
    },
    wechatCode: `// 微信小程序 - 设备绑定
wx.cloud.callFunction({
  name: 'device-binding',
  data: {
    action: 'bind',
    serialNumber: 'DEV-2026-001',
    userId: wx.getStorageSync('userInfo').userId
  },
  success: res => {
    if (res.result.success) {
      wx.showToast({ title: '绑定成功' });
    }
  }
});

// 验证设备序列号
wx.cloud.callFunction({
  name: 'device-binding',
  data: {
    action: 'verify',
    serialNumber: 'DEV-2026-001'
  },
  success: res => {
    console.log('设备状态:', res.result.status); // online/offline
    console.log('绑定用户:', res.result.bindUser);
  }
});

// 解绑设备
wx.cloud.callFunction({
  name: 'device-binding',
  data: {
    action: 'unbind',
    serialNumber: 'DEV-2026-001'
  },
  success: res => wx.showToast({ title: '已解绑' })
});`
  };

  // ==================== 5. 数据库操作 ====================
  const databaseDocs = {
    description: '直接操作云数据库',
    collections: [{
      name: 'users',
      desc: '用户信息表',
      fields: 'userId, openid, nickname, avatar, createdAt, lastLoginAt'
    }, {
      name: 'device',
      desc: '设备表',
      fields: 'serial_number, name, status, bind_user, created_at'
    }, {
      name: 'device_binding',
      desc: '设备绑定关系',
      fields: 'device_id, user_id, bound_at'
    }, {
      name: 'config_file',
      desc: '配置表',
      fields: 'filename, type, device_serial_number, file_url, upload_user, upload_time'
    }, {
      name: 'verification_history',
      desc: '验证历史',
      fields: 'serial_number, result, user_id, verified_at'
    }, {
      name: 'upload_history',
      desc: '上传历史',
      fields: 'serial_number, user_id, file_type, operation, upload_time, version, status'
    }],
    wechatCode: `// 初始化数据库
const db = wx.cloud.database();

// 查询数据
db.collection('device').where({
  bind_user: wx.getStorageSync('userInfo').userId
}).get().then(res => {
  console.log('我的设备', res.data);
});

// 添加数据
db.collection('device').add({
  data: {
    serial_number: 'DEV-2026-001',
    name: '设备A',
    status: 'online',
    created_at: db.serverDate()
  }
}).then(res => {
  console.log('设备ID', res._id);
});

// 更新数据
db.collection('device').doc('device-id').update({
  data: {
    name: '新名称',
    status: 'offline'
  }
});

// 删除数据
db.collection('device').doc('device-id').remove();`
  };

  // ==================== 6. 会话管理 ====================
  const sessionDocs = {
    cloudFunction: 'session-manage',
    description: '用户会话管理与登录状态维护',
    params: [{
      name: 'action',
      type: 'string',
      required: true,
      desc: '操作类型: create/check/refresh/close'
    }, {
      name: 'sessionId',
      type: 'string',
      required: 'action!=create',
      desc: '会话ID'
    }],
    response: {
      create: {
        success: true,
        sessionId: 'sess_xxx',
        expireTime: '2026-05-08T10:00:00Z'
      },
      check: {
        success: true,
        valid: true,
        userId: 'user_xxx'
      },
      refresh: {
        success: true,
        sessionId: 'sess_xxx',
        expireTime: '2026-05-08T10:00:00Z'
      },
      close: {
        success: true
      }
    },
    wechatCode: `// 创建会话（登录时调用）
wx.cloud.callFunction({
  name: 'session-manage',
  data: {
    action: 'create',
    userId: wx.getStorageSync('userInfo').userId
  },
  success: res => {
    if (res.result.success) {
      wx.setStorageSync('sessionId', res.result.sessionId);
    }
  }
});

// 检查会话有效性
wx.cloud.callFunction({
  name: 'session-manage',
  data: {
    action: 'check',
    sessionId: wx.getStorageSync('sessionId')
  },
  success: res => {
    if (!res.result.valid) {
      // 会话过期，需要重新登录
      wx.redirectTo({ url: '/pages/login/login' });
    }
  }
});`
  };
  const sections = [{
    id: 'login',
    title: '微信登录',
    icon: LogIn,
    doc: loginDocs
  }, {
    id: 'upload',
    title: '文件上传',
    icon: Upload,
    doc: uploadDocs
  }, {
    id: 'download',
    title: '文件下载',
    icon: Download,
    doc: downloadDocs
  }, {
    id: 'binding',
    title: '设备绑定',
    icon: Link2,
    doc: bindingDocs
  }, {
    id: 'database',
    title: '数据库操作',
    icon: Database,
    doc: databaseDocs
  }, {
    id: 'session',
    title: '会话管理',
    icon: BookOpen,
    doc: sessionDocs
  }];
  const renderParamsTable = params => <table className="w-full text-sm mt-3">
    <thead className="bg-slate-800/50">
      <tr>
        <th className="px-3 py-2 text-left text-slate-400 font-medium">参数</th>
        <th className="px-3 py-2 text-left text-slate-400 font-medium">类型</th>
        <th className="px-3 py-2 text-left text-slate-400 font-medium">必填</th>
        <th className="px-3 py-2 text-left text-slate-400 font-medium">说明</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700">
      {params.map((p, i) => <tr key={i}>
        <td className="px-3 py-2 text-cyan-400 font-mono">{p.name}</td>
        <td className="px-3 py-2 text-slate-300">{p.type}</td>
        <td className="px-3 py-2 text-slate-400">{p.required === true ? '✓' : p.required || '-'}</td>
        <td className="px-3 py-2 text-slate-300">{p.desc}</td>
      </tr>)}
    </tbody>
  </table>;
  const renderResponse = (response, title) => <div className="mt-3">
    <p className="text-sm text-slate-400 mb-2">{title}</p>
    <pre className="text-xs text-emerald-400 bg-slate-900 p-3 rounded-lg overflow-x-auto">
      {JSON.stringify(response, null, 2)}
    </pre>
  </div>;
  return <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 font-mono">API 接口文档</h2>
        <p className="text-slate-400 mt-1">微信小程序云开发完整接口参考</p>
      </div>
    </div>

    {/* 快速开始 */}
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 p-6">
      <h3 className="text-lg font-semibold text-cyan-100 mb-3">快速开始</h3>
      <div className="space-y-2 text-slate-300 text-sm">
        <p>1. <span className="text-cyan-400">初始化</span>: wx.cloud.init(&#123; env: 'your-env-id' &#125;)</p>
        <p>2. <span className="text-cyan-400">调用云函数</span>: wx.cloud.callFunction(&#123; name: 'xxx', data: &#123; ... &#125; &#125;)</p>
        <p>3. <span className="text-cyan-400">操作数据库</span>: wx.cloud.database().collection('xxx')</p>
      </div>
    </div>

    {/* 接口列表 */}
    <div className="space-y-3">
      {sections.map(section => <div key={section.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <button onClick={() => toggleSection(section.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <section.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-100">{section.title}</h3>
              <p className="text-sm text-slate-400">{section.doc.description}</p>
            </div>
          </div>
          {expandedSection === section.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedSection === section.id && <div className="px-6 pb-6 border-t border-slate-700">
          {/* 云函数信息 */}
          {section.doc.cloudFunction && <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-200">云函数: </span>
              <code className="text-sm text-cyan-400 font-mono">{section.doc.cloudFunction}</code>
            </div>
            {section.doc.params && <>
              <p className="text-sm text-slate-400 mb-2">请求参数:</p>
              {renderParamsTable(section.doc.params)}
            </>}
            {section.doc.response && Object.entries(section.doc.response).map(([key, val]) => renderResponse(val, `返回示例 (${key}):`))}
          </div>}

          {/* 数据库表结构 */}
          {section.doc.collections && <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm font-medium text-slate-200 mb-3">数据表:</p>
            <div className="space-y-2">
              {section.doc.collections.map((c, i) => <div key={i} className="flex gap-4 text-sm">
                <span className="text-cyan-400 font-mono">{c.name}</span>
                <span className="text-slate-400">{c.desc}</span>
                <span className="text-slate-500 font-mono">{c.fields}</span>
              </div>)}
            </div>
          </div>}

          {/* 代码示例 */}
          {section.doc.wechatCode && <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-200">微信小程序代码示例:</p>
              <button onClick={() => copyToClipboard(section.doc.wechatCode, section.id + '-code')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-cyan-400">
                {copiedCode === section.id + '-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-sm text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto font-mono">
              {section.doc.wechatCode}
            </pre>
          </div>}

          {/* DB Schema */}
          {section.doc.dbSchema && <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-200">数据库表结构:</p>
              <button onClick={() => copyToClipboard(section.doc.dbSchema, section.id + '-schema')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-cyan-400">
                {copiedCode === section.id + '-schema' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-sm text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto font-mono">
              {section.doc.dbSchema}
            </pre>
          </div>}
        </div>}
      </div>)}
    </div>

    {/* 错误码说明 */}
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">错误码说明</h3>
      <table className="w-full text-sm">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="px-4 py-2 text-left text-slate-400 font-medium">错误码</th>
            <th className="px-4 py-2 text-left text-slate-400 font-medium">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          <tr><td className="px-4 py-2 text-cyan-400">-1</td><td className="px-4 py-2 text-slate-300">系统错误</td></tr>
          <tr><td className="px-4 py-2 text-cyan-400">-2</td><td className="px-4 py-2 text-slate-300">参数错误</td></tr>
          <tr><td className="px-4 py-2 text-cyan-400">-3</td><td className="px-4 py-2 text-slate-300">云函数调用失败</td></tr>
          <tr><td className="px-4 py-2 text-cyan-400">-4</td><td className="px-4 py-2 text-slate-300">数据库操作失败</td></tr>
          <tr><td className="px-4 py-2 text-cyan-400">-5</td><td className="px-4 py-2 text-slate-300">文件上传失败</td></tr>
          <tr><td className="px-4 py-2 text-cyan-400">-6</td><td className="px-4 py-2 text-slate-300">会话无效或已过期</td></tr>
        </tbody>
      </table>
    </div>
  </div>;
}