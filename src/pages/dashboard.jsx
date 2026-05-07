// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Server, Users, FileJson, Link, Menu, X, ChevronRight, Activity, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';

// 侧边栏组件
function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen
}) {
  const menuItems = [{
    id: 'devices',
    label: '设备序列号管理',
    icon: Server
  }, {
    id: 'users',
    label: '用户管理',
    icon: Users
  }, {
    id: 'configs',
    label: '配置表管理',
    icon: FileJson
  }, {
    id: 'binding',
    label: '设备绑定验证',
    icon: Link
  }, {
    id: 'wechat-api',
    label: '微信小程序API',
    icon: Smartphone
  }];
  return <>
      {/* 移动端遮罩 */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      
      {/* 侧边栏 */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-700
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 font-mono">云平台管理</h1>
            <p className="text-xs text-slate-400">Server Cloud Admin</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return <button key={item.id} onClick={() => {
            setActivePage(item.id);
            setIsOpen(false);
          }} className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 font-medium
                  ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}
                `}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>;
        })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="px-4 py-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500">系统版本</p>
            <p className="text-sm text-slate-300 font-mono">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>;
}

// 设备序列号管理页面
function DeviceManagement({
  $w
}) {
  const [devices, setDevices] = useState([{
    id: 1,
    serialNumber: 'DEV-2026-001',
    name: '服务器A组',
    status: 'online',
    bindUser: '张三',
    createdAt: '2026-05-01'
  }, {
    id: 2,
    serialNumber: 'DEV-2026-002',
    name: '服务器B组',
    status: 'offline',
    bindUser: '李四',
    createdAt: '2026-05-02'
  }, {
    id: 3,
    serialNumber: 'DEV-2026-003',
    name: '服务器C组',
    status: 'online',
    bindUser: '-',
    createdAt: '2026-05-03'
  }, {
    id: 4,
    serialNumber: 'DEV-2026-004',
    name: '测试服务器',
    status: 'maintenance',
    bindUser: '王五',
    createdAt: '2026-05-04'
  }]);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    serialNumber: '',
    name: '',
    status: 'online'
  });
  const handleAdd = () => {
    setEditingDevice(null);
    setFormData({
      serialNumber: '',
      name: '',
      status: 'online'
    });
    setShowModal(true);
  };
  const handleEdit = device => {
    setEditingDevice(device);
    setFormData({
      serialNumber: device.serialNumber,
      name: device.name,
      status: device.status
    });
    setShowModal(true);
  };
  const handleDelete = id => {
    if (confirm('确定要删除该设备吗？')) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };
  const handleSave = () => {
    if (editingDevice) {
      setDevices(devices.map(d => d.id === editingDevice.id ? {
        ...d,
        ...formData
      } : d));
    } else {
      setDevices([...devices, {
        ...formData,
        id: Date.now(),
        bindUser: '-',
        createdAt: new Date().toISOString().split('T')[0]
      }]);
    }
    setShowModal(false);
  };
  const getStatusColor = status => {
    const colors = {
      online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      offline: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[status] || colors.offline;
  };
  const getStatusText = status => {
    const texts = {
      online: '在线',
      offline: '离线',
      maintenance: '维护中'
    };
    return texts[status] || '未知';
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-mono">设备序列号管理</h2>
          <p className="text-slate-400 mt-1">管理服务器设备的序列号和基本信息</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Server className="w-4 h-4" />
          新增设备
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">序列号</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">设备名称</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">绑定用户</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">创建时间</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {devices.map(device => <tr key={device.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-mono text-cyan-400">{device.serialNumber}</td>
                <td className="px-6 py-4 text-slate-200">{device.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}`}>
                    {getStatusText(device.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{device.bindUser}</td>
                <td className="px-6 py-4 text-slate-400">{device.createdAt}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(device)} className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
                      编辑
                    </button>
                    <button onClick={() => handleDelete(device.id)} className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                      删除
                    </button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-6">
              {editingDevice ? '编辑设备' : '新增设备'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">序列号</label>
                <input type="text" value={formData.serialNumber} onChange={e => setFormData({
              ...formData,
              serialNumber: e.target.value
            })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="例如: DEV-2026-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">设备名称</label>
                <input type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="例如: 服务器A组" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">状态</label>
                <select value={formData.status} onChange={e => setFormData({
              ...formData,
              status: e.target.value
            })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors">
                  <option value="online">在线</option>
                  <option value="offline">离线</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>}
    </div>;
}

// 用户管理页面
function UserManagement({
  $w
}) {
  const [users] = useState([{
    id: 1,
    openid: 'oXXXX1',
    nickname: '用户A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    devices: ['DEV-2026-001'],
    createdAt: '2026-04-15'
  }, {
    id: 2,
    openid: 'oXXXX2',
    nickname: '用户B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    devices: ['DEV-2026-002'],
    createdAt: '2026-04-20'
  }, {
    id: 3,
    openid: 'oXXXX3',
    nickname: '用户C',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    devices: [],
    createdAt: '2026-05-01'
  }, {
    id: 4,
    openid: 'oXXXX4',
    nickname: '用户D',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    devices: ['DEV-2026-003', 'DEV-2026-004'],
    createdAt: '2026-05-03'
  }]);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-mono">用户管理</h2>
          <p className="text-slate-400 mt-1">查看微信登录用户及绑定的设备</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">总用户: <span className="text-cyan-400 font-mono">{users.length}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => <div key={user.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <img src={user.avatar} alt={user.nickname} className="w-14 h-14 rounded-full bg-slate-700" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100 truncate">{user.nickname}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {user.openid}</p>
                <p className="text-xs text-slate-500 mt-1">注册时间: {user.createdAt}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-2">绑定的设备:</p>
              <div className="flex flex-wrap gap-2">
                {user.devices.length > 0 ? user.devices.map((device, idx) => <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded font-mono">
                      {device}
                    </span>) : <span className="text-xs text-slate-500">未绑定设备</span>}
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}

// 配置表管理页面
function ConfigManagement({
  $w
}) {
  const [configs] = useState([{
    id: 1,
    filename: 'config.json',
    type: 'json',
    size: '2.3 KB',
    uploadUser: '用户A',
    uploadTime: '2026-05-05 10:30'
  }, {
    id: 2,
    filename: 'database.json',
    type: 'json',
    size: '15.8 KB',
    uploadUser: '用户B',
    uploadTime: '2026-05-04 15:20'
  }, {
    id: 3,
    filename: 'settings.db',
    type: 'db',
    size: '256 KB',
    uploadUser: '用户A',
    uploadTime: '2026-05-03 09:15'
  }, {
    id: 4,
    filename: 'backup.json',
    type: 'json',
    size: '8.1 KB',
    uploadUser: '用户C',
    uploadTime: '2026-05-02 14:45'
  }, {
    id: 5,
    filename: 'cache.db',
    type: 'db',
    size: '1.2 MB',
    uploadUser: '用户D',
    uploadTime: '2026-05-01 11:00'
  }]);
  const getTypeColor = type => {
    return type === 'json' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-mono">配置表管理</h2>
          <p className="text-slate-400 mt-1">管理用户上传的 JSON 和 DB 配置文件</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <FileJson className="w-4 h-4" />
          上传配置
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">文件名</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">类型</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">大小</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">上传用户</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">上传时间</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {configs.map(config => <tr key={config.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileJson className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-200 font-mono">{config.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(config.type)}`}>
                    {config.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{config.size}</td>
                <td className="px-6 py-4 text-slate-300">{config.uploadUser}</td>
                <td className="px-6 py-4 text-slate-400">{config.uploadTime}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
                      查看
                    </button>
                    <button className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
                      下载
                    </button>
                    <button className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                      删除
                    </button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}

// 设备绑定验证页面
function BindingVerification({
  $w
}) {
  const [serialNumber, setSerialNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载验证历史
  useEffect(() => {
    loadHistory();
  }, []);
  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'get-verification-history',
        data: {}
      });
      if (result && result.list) {
        setHistory(result.list);
      }
    } catch (error) {
      console.error('加载验证历史失败', error);
    } finally {
      setLoading(false);
    }
  };
  const handleVerify = async () => {
    if (!serialNumber.trim()) return;
    setLoading(true);
    try {
      // 调用云函数验证设备序列号
      const result = await $w.cloud.callFunction({
        name: 'device-binding',
        data: {
          action: 'verify',
          serialNumber: serialNumber.trim()
        }
      });
      setVerificationResult({
        serialNumber,
        isValid: result.success,
        message: result.message || (result.success ? '验证成功，该设备序列号有效' : '验证失败，该设备序列号无效'),
        bindUser: result.bindUser || null
      });

      // 刷新历史记录
      loadHistory();
    } catch (error) {
      console.error('验证失败', error);
      setVerificationResult({
        serialNumber,
        isValid: false,
        message: '验证请求失败，请稍后重试',
        bindUser: null
      });
    } finally {
      setLoading(false);
    }
  };
  const getResultColor = result => {
    return result === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30';
  };
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 font-mono">设备绑定验证</h2>
        <p className="text-slate-400 mt-1">验证设备序列号的有效性</p>
      </div>

      {/* 验证表单 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex gap-4">
          <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors font-mono" placeholder="输入设备序列号 (例如: DEV-2026-001)" onKeyDown={e => e.key === 'Enter' && handleVerify()} />
          <button onClick={handleVerify} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Link className="w-4 h-4" />
            验证
          </button>
        </div>

        {/* 验证结果 */}
        {verificationResult && <div className={`mt-6 p-4 rounded-lg border ${verificationResult.isValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              {verificationResult.isValid ? <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div> : <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>}
              <div>
                <p className={`font-medium ${verificationResult.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {verificationResult.message}
                </p>
                {verificationResult.bindUser && <p className="text-sm text-slate-400 mt-1">
                    绑定用户: <span className="text-cyan-400">{verificationResult.bindUser}</span>
                  </p>}
              </div>
            </div>
          </div>}
      </div>

      {/* 验证历史 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">验证历史</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">序列号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">结果</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">验证用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading && history.length === 0 ? <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">加载中...</td>
              </tr> : history.length === 0 ? <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">暂无验证记录</td>
              </tr> : history.map((item, index) => <tr key={item._id || index} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-mono text-cyan-400">{item.serial_number}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getResultColor(item.result)}`}>
                    {item.result === 'success' ? '成功' : '失败'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{item.user || '-'}</td>
                <td className="px-6 py-4 text-slate-400">{item.time || '-'}</td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}

// 微信小程序API接入说明页面
function WechatAPIPage({
  $w
}) {
  const [copiedCode, setCopiedCode] = useState(null);
  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  const codeExamples = [{
    id: 'login',
    title: '微信登录',
    description: '在微信小程序中调用云函数完成微信登录，获取用户信息并创建/更新用户记录',
    code: `// 微信小程序中调用云函数进行登录
const app = getApp();

// 调用微信登录云函数
wx.cloud.callFunction({
  name: 'wechat-login',
  data: {
    nickname: userInfo.nickName,
    avatar: userInfo.avatarUrl
  },
  success: res => {
    if (res.result.loginStatus === 'success') {
      console.log('登录成功', res.result);
      // 保存用户信息到本地
      wx.setStorageSync('userInfo', res.result);
    }
  },
  fail: err => {
    console.error('登录失败', err);
  }
});`
  }, {
    id: 'userinfo',
    title: '获取用户信息',
    description: '使用 wx.getUserProfile 获取微信用户基本信息（昵称、头像等）',
    code: `// 获取微信用户信息
wx.getUserProfile({
  desc: '用于完善用户资料',
  success: res => {
    const userInfo = res.userInfo;
    console.log('用户信息', userInfo);
    // 可以将用户信息传递给云函数
  }
});`
  }, {
    id: 'database',
    title: '数据库操作',
    description: '在微信小程序中查询、添加、修改云数据库中的数据记录',
    code: `// 微信小程序中操作云数据库
const db = wx.cloud.database();

// 查询设备列表
db.collection('device').where({
  _openid: '{openid}' // 自动获取当前用户openid
}).get().then(res => {
  console.log('设备列表', res.data);
});

// 添加设备
db.collection('device').add({
  data: {
    serial_number: 'DEV-2026-001',
    name: '服务器A组',
    status: 'online',
    created_at: new Date()
  }
}).then(res => {
  console.log('添加成功', res._id);
});`
  }, {
    id: 'upload',
    title: '文件上传',
    description: '选择本地文件（.json/.db）上传到云存储，并保存文件信息到数据库',
    code: `// 上传配置文件到云存储
wx.chooseMessageFile({
  count: 1,
  type: 'file',
  extension: ['json', 'db'],
  success: res => {
    const filePath = res.tempFiles[0].path;
    const fileName = res.tempFiles[0].name;
    
    // 上传到云存储
    const cloudPath = 'configs/' + Date.now() + '-' + fileName;
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        console.log('上传成功', res.fileID);
        // 保存文件信息到数据库
        db.collection('config_file').add({
          data: {
            file_name: fileName,
            file_url: res.fileID,
            file_type: fileName.endsWith('.json') ? 'json' : 'db',
            uploaded_by: '{openid}',
            uploaded_at: new Date()
          }
        });
      }
    });
  }
});`
  }, {
    id: 'binding',
    title: '设备绑定验证',
    description: '调用云函数进行设备绑定和序列号验证操作',
    code: `// 设备绑定验证
wx.cloud.callFunction({
  name: 'device-binding',
  data: {
    action: 'bind',
    serialNumber: 'DEV-2026-001',
    userId: '{userId}'
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
    console.log('验证结果', res.result);
  }
});`
  }];
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 font-mono">微信小程序API接入</h2>
        <p className="text-slate-400 mt-1">在微信小程序中调用云开发能力的完整示例代码</p>
      </div>

      {/* 接入前准备 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          接入前准备
        </h3>
        <div className="space-y-3 text-slate-300">
          <p>1. <span className="text-cyan-400">开通云开发</span>：在微信开发者工具中点击"云开发"按钮，创建云开发环境</p>
          <p>2. <span className="text-cyan-400">初始化云能力</span>：在 app.js 中调用 wx.cloud.init()</p>
          <p>3. <span className="text-cyan-400">安全域名配置</span>：在微信公众平台配置安全域名（request合法域名）</p>
          <p>4. <span className="text-cyan-400">上传云函数</span>：在云开发控制台上传并部署 wechat-login 等云函数</p>
        </div>
        
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">初始化代码（app.js）：</p>
          <pre className="text-sm text-cyan-400 font-mono overflow-x-auto">
          {`App({ onLaunch() { wx.cloud.init({ env: 'your-env-id' }); } })`}
          </pre>
        </div>
      </div>

      {/* API调用示例 */}
      <div className="space-y-4">
        {codeExamples.map(example => <div key={example.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{example.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{example.description}</p>
              </div>
              <button onClick={() => copyToClipboard(example.code, example.id)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-cyan-400">
                {copiedCode === example.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="p-4 bg-slate-950 overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                {example.code}
              </pre>
            </div>
          </div>)}
      </div>

      {/* 云函数列表 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">已部署的云函数</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-slate-100">wechat-login</p>
                <p className="text-sm text-slate-400">微信用户登录</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-300">device-binding</p>
                <p className="text-sm text-slate-400">设备绑定验证（待部署）</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据表说明 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">数据表说明</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">表名</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">说明</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">主要字段</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-mono">users</td>
                <td className="px-4 py-3 text-slate-300">用户信息表</td>
                <td className="px-4 py-3 text-slate-400">userId, openid, nickname, avatar</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-mono">device</td>
                <td className="px-4 py-3 text-slate-300">设备表</td>
                <td className="px-4 py-3 text-slate-400">serial_number, name, status, bind_user</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-mono">device_binding</td>
                <td className="px-4 py-3 text-slate-300">设备绑定关系</td>
                <td className="px-4 py-3 text-slate-400">device_id, user_id, bound_at</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-mono">config_file</td>
                <td className="px-4 py-3 text-slate-300">配置表</td>
                <td className="px-4 py-3 text-slate-400">file_name, file_url, file_type, version</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-mono">verification_history</td>
                <td className="px-4 py-3 text-slate-300">验证历史</td>
                <td className="px-4 py-3 text-slate-400">serial_number, result, user_id, verified_at</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// 主页面组件
export default function Dashboard(props) {
  const $w = props.$w;
  const [activePage, setActivePage] = useState('devices');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const renderPage = () => {
    switch (activePage) {
      case 'devices':
        return <DeviceManagement $w={$w} />;
      case 'users':
        return <UserManagement $w={$w} />;
      case 'configs':
        return <ConfigManagement $w={$w} />;
      case 'binding':
        return <BindingVerification $w={$w} />;
      case 'wechat-api':
        return <WechatAPIPage $w={$w} />;
      default:
        return <DeviceManagement $w={$w} />;
    }
  };
  return <div className="min-h-screen bg-slate-950">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 顶部导航栏 */}
      <header className="lg:ml-64 sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-200">管理员</p>
                <p className="text-xs text-slate-500">admin@servercloud.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>;
}