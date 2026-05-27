import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'lab_reagent_locations'

const DEFAULT_LOCATIONS = [
  {
    id: 'location-demo-1',
    name: '1号冰箱',
    type: '冰箱',
    remark: '4℃保存',
    reagents: [
      {
        id: 'reagent-demo-1',
        name: 'DMSO',
        spec: '100 mL',
        quantity: '1 瓶',
        detailLocation: '上层左侧',
        openDate: '2026-05',
        remark: '细胞实验常用',
        createdAt: '2026-05-18T08:00:00.000Z'
      },
      {
        id: 'reagent-demo-2',
        name: 'PBS 缓冲液',
        spec: '500 mL',
        quantity: '3 瓶',
        detailLocation: '下层右侧',
        openDate: '2026-05',
        remark: '常用缓冲液',
        createdAt: '2026-05-15T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'location-demo-2',
    name: '有机试剂柜',
    type: '试剂柜',
    remark: '常温避光保存',
    reagents: [
      {
        id: 'reagent-demo-3',
        name: '无水乙醇',
        spec: '500 mL',
        quantity: '2 瓶',
        detailLocation: '第二层',
        openDate: '2026-05',
        remark: '常用有机试剂',
        createdAt: '2026-05-20T08:00:00.000Z'
      }
    ]
  }
]

function ReagentLocationsPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '冰箱',
    remark: ''
  })

  useEffect(() => {
    initDefaultData()
    loadLocations()
  }, [])

  const initDefaultData = () => {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS))
      return
    }
    const parsed = JSON.parse(existing)
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS))
    }
  }

  const loadLocations = () => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setLocations(list)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ name: '', type: '冰箱', remark: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请填写存放点名称')
      return
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (editingId) {
      const updated = existing.map(loc =>
        loc.id === editingId
          ? { ...loc, name: formData.name.trim(), type: formData.type, remark: formData.remark.trim() }
          : loc
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      loadLocations()
      resetForm()
    } else {
      const newLoc = {
        id: uuidv4(),
        name: formData.name.trim(),
        type: formData.type,
        remark: formData.remark.trim(),
        reagents: []
      }
      existing.unshift(newLoc)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
      loadLocations()
      resetForm()
    }
  }

  const handleEdit = (loc) => {
    setFormData({
      name: loc.name || '',
      type: loc.type || '冰箱',
      remark: loc.remark || ''
    })
    setEditingId(loc.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (!confirm('删除该存放点会同时删除其中已录入的试剂信息，确定删除吗？')) return
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = existing.filter(loc => loc.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    loadLocations()
    if (editingId === id) {
      resetForm()
    }
  }

  const handleEnter = (id) => {
    navigate(`/reagent/${id}`)
  }

  const handleBack = () => {
    navigate('/')
  }

  const getTypeIcon = (type) => {
    if (type === '冰箱') return '🧊'
    if (type === '试剂柜') return '🗄️'
    return '📦'
  }

  return (
    <div className="entry-page">
      <div className="entry-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <div className="entry-title">
          <span className="entry-icon">🧪</span>
          试剂库
        </div>
      </div>

      <div className="location-intro">
        请先选择或创建试剂存放位置，再录入对应位置下的试剂信息。
      </div>

      {!showForm && (
        <button className="create-location-btn" onClick={() => setShowForm(true)}>
          + 创建存放点
        </button>
      )}

      {showForm && (
        <div className="entry-form">
          <div className="form-section-title">
            {editingId ? `✏️ 编辑存放点` : '+ 创建存放点'}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>存放点名称 <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：1号冰箱、有机试剂柜"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>存放点类型</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="冰箱">冰箱</option>
                <option value="试剂柜">试剂柜</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>备注</label>
              <input
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                placeholder="例如：4℃保存、常温避光"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              {editingId ? '💾 保存修改' : '💾 创建'}
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className="recent-section">
        <div className="recent-title">── 存放点列表 ──</div>

        {locations.length === 0 ? (
          <div className="no-results">暂无存放点，请创建一个</div>
        ) : (
          <div className="location-cards">
            {locations.map(loc => (
              <div key={loc.id} className="location-card">
                <div className="location-card-header">
                  <span className="location-icon">{getTypeIcon(loc.type)}</span>
                  <span className="location-name">{loc.name}</span>
                </div>
                <div className="location-card-info">
                  <div className="location-info-row">
                    <span className="location-info-label">类型：</span>
                    <span className="location-info-value">{loc.type}</span>
                  </div>
                  <div className="location-info-row">
                    <span className="location-info-label">备注：</span>
                    <span className="location-info-value">{loc.remark || '无'}</span>
                  </div>
                  <div className="location-info-row">
                    <span className="location-info-label">试剂数量：</span>
                    <span className="location-info-value">{(loc.reagents || []).length} 种</span>
                  </div>
                </div>
                <div className="location-card-actions">
                  <button className="enter-btn" onClick={() => handleEnter(loc.id)}>
                    进入管理
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(loc)}>
                    ✏️ 编辑
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(loc.id)}>
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReagentLocationsPage
