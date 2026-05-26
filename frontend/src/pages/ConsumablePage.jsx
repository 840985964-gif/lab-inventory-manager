import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'lab_consumables'

const DEFAULT_CONSUMABLES = [
  {
    id: 'consumable-demo-1',
    name: '96 孔板',
    spec: '无菌，平底',
    quantity: '5 盒',
    location: '耗材柜 C-1',
    arrivalDate: '2026-05',
    remark: '细胞实验常用',
    createdAt: '2026-05-10T08:00:00.000Z'
  },
  {
    id: 'consumable-demo-2',
    name: '1.5 mL 离心管',
    spec: '500 支/包',
    quantity: '2 包',
    location: '耗材柜 A-2',
    arrivalDate: '2026-05',
    remark: '常规耗材',
    createdAt: '2026-05-08T08:00:00.000Z'
  },
  {
    id: 'consumable-demo-3',
    name: '10 μL 枪头',
    spec: '盒装，无菌',
    quantity: '4 盒',
    location: '耗材柜 B-3',
    arrivalDate: '2026-05',
    remark: '移液器配套耗材',
    createdAt: '2026-05-12T08:00:00.000Z'
  }
]

function ConsumablePage() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [allItems, setAllItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    spec: '',
    quantity: '',
    location: '',
    arrivalDate: '',
    remark: ''
  })

  useEffect(() => {
    initDefaultData()
    loadAllItems()
  }, [])

  const initDefaultData = () => {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONSUMABLES))
    }
  }

  const loadAllItems = () => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setAllItems(list)
  }

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return allItems
    const term = searchTerm.toLowerCase()
    return allItems.filter(item =>
      (item.name || '').toLowerCase().includes(term) ||
      (item.spec || '').toLowerCase().includes(term) ||
      (item.quantity || '').toString().toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term) ||
      (item.arrivalDate || '').toLowerCase().includes(term) ||
      (item.remark || '').toLowerCase().includes(term)
    )
  }, [allItems, searchTerm])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      spec: '',
      quantity: '',
      location: '',
      arrivalDate: '',
      remark: ''
    })
    setEditingId(null)
    setShowMore(false)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请填写物品名称')
      return
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (editingId) {
      const updated = existing.map(item =>
        item.id === editingId
          ? {
              ...item,
              name: formData.name.trim(),
              spec: formData.spec.trim(),
              quantity: formData.quantity.trim(),
              location: formData.location.trim(),
              arrivalDate: formData.arrivalDate,
              remark: formData.remark.trim()
            }
          : item
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setShowSuccess(true)
      loadAllItems()
      resetForm()
      setTimeout(() => setShowSuccess(false), 2000)
    } else {
      const item = {
        id: uuidv4(),
        name: formData.name.trim(),
        spec: formData.spec.trim(),
        quantity: formData.quantity.trim(),
        location: formData.location.trim(),
        arrivalDate: formData.arrivalDate,
        remark: formData.remark.trim(),
        createdAt: new Date().toISOString()
      }
      existing.unshift(item)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
      setShowSuccess(true)
      loadAllItems()
      setTimeout(() => {
        setShowSuccess(false)
        resetForm()
      }, 2000)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      spec: item.spec || '',
      quantity: item.quantity || '',
      location: item.location || '',
      arrivalDate: item.arrivalDate || '',
      remark: item.remark || ''
    })
    setEditingId(item.id)
    setShowMore(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (!confirm('确定要删除这条记录吗？')) return
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = existing.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    loadAllItems()
    if (editingId === id) {
      resetForm()
    }
  }

  const handleExportCSV = () => {
    const itemsToExport = allItems
    if (itemsToExport.length === 0) {
      alert('暂无数据可导出')
      return
    }

    const headers = ['名称', '规格', '数量', '存放位置', '到货日期', '备注']
    const rows = itemsToExport.map(item => [
      item.name || '',
      item.spec || '',
      item.quantity || '',
      item.location || '',
      item.arrivalDate || '',
      item.remark || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'consumables_inventory.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBack = () => {
    navigate('/')
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return `${Math.floor(diff / 86400)}天前`
  }

  return (
    <div className="entry-page">
      <div className="entry-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <div className="entry-title">
          <span className="entry-icon">🔬</span>
          耗材录入
        </div>
      </div>

      <div className="entry-form">
        <div className="form-section-title">
          {editingId ? `✏️ 正在编辑：${formData.name}` : '📝 基本信息'}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>名称 <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="比如：移液管、培养皿、手套"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-half">
            <label>规格</label>
            <input
              type="text"
              name="spec"
              value={formData.spec}
              onChange={handleChange}
              placeholder="比如：10 mL、100 个/盒、96 孔"
            />
          </div>

          <div className="form-group form-group-half">
            <label>数量</label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="比如：5 盒、2 包、10 个"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📍 存放位置</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="比如：B柜2层、耗材室3号架"
            />
          </div>
        </div>

        <div
          className="expand-toggle"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? '▲ 点击收起更多信息' : '▼ 展开更多（到货日期、备注）'}
        </div>

        {showMore && (
          <div className="expand-section">
            <div className="form-row">
              <div className="form-group">
                <label>到货日期</label>
                <input
                  type="month"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>备注</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                placeholder="其他想记录的..."
                rows="2"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="save-btn save-btn-green" onClick={handleSave}>
            {editingId ? '💾 保存修改' : '💾 保存'}
          </button>
          {editingId && (
            <button className="cancel-btn" onClick={resetForm}>
              取消编辑
            </button>
          )}
          <button className="export-btn" onClick={handleExportCSV}>
            📄 导出 CSV
          </button>
          <button className="back-home-btn" onClick={handleBack}>
            返回首页
          </button>
        </div>
      </div>

      {allItems.length > 0 && (
        <div className="recent-section">
          <div className="recent-title">── 已录入耗材 ──</div>

          <div className="demo-hint">
            以下为示例数据，可编辑或删除；新增数据将保存在当前浏览器中。
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="搜索耗材（名称、规格、数量、位置、备注）..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="all-items-list">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <span className="item-icon">🔬</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-time">{formatTime(item.createdAt)}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-row">
                      <span className="item-label">规格：</span>
                      <span className="item-value">{item.spec || '无'}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">数量：</span>
                      <span className="item-value">{item.quantity || '无'}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">存放位置：</span>
                      <span className="item-value">{item.location || '无'}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">到货日期：</span>
                      <span className="item-value">{item.arrivalDate || '无'}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">备注：</span>
                      <span className="item-value">{item.remark || '无'}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>
                      ✏️ 编辑
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">暂无匹配的耗材</div>
            )}
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-toast">
          ✓ {editingId ? '修改成功！' : '保存成功！'}
        </div>
      )}
    </div>
  )
}

export default ConsumablePage