import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'lab_reagent_locations'

function ReagentPage() {
  const navigate = useNavigate()
  const { locationId } = useParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [location, setLocation] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    spec: '',
    quantity: '',
    detailLocation: '',
    openDate: '',
    remark: ''
  })

  useEffect(() => {
    loadLocationData()
  }, [locationId])

  const loadLocationData = () => {
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const found = locations.find(loc => loc.id === locationId)
    if (found) {
      setLocation(found)
      setAllItems(found.reagents || [])
    } else {
      navigate('/reagent')
    }
  }

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return allItems
    const term = searchTerm.toLowerCase()
    return allItems.filter(item =>
      (item.name || '').toLowerCase().includes(term) ||
      (item.spec || '').toLowerCase().includes(term) ||
      (item.quantity || '').toString().toLowerCase().includes(term) ||
      (item.detailLocation || '').toLowerCase().includes(term) ||
      (item.openDate || '').toLowerCase().includes(term) ||
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
      detailLocation: '',
      openDate: '',
      remark: ''
    })
    setEditingId(null)
    setShowMore(false)
  }

  const saveLocations = (locations) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请填写物品名称')
      return
    }

    const locations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const locIndex = locations.findIndex(loc => loc.id === locationId)
    if (locIndex === -1) return

    const reagents = locations[locIndex].reagents || []

    if (editingId) {
      const updatedReagents = reagents.map(item =>
        item.id === editingId
          ? {
              ...item,
              name: formData.name.trim(),
              spec: formData.spec.trim(),
              quantity: formData.quantity.trim(),
              detailLocation: formData.detailLocation.trim(),
              openDate: formData.openDate,
              remark: formData.remark.trim()
            }
          : item
      )
      locations[locIndex].reagents = updatedReagents
      saveLocations(locations)
      setShowSuccess(true)
      loadLocationData()
      resetForm()
      setTimeout(() => setShowSuccess(false), 2000)
    } else {
      const item = {
        id: uuidv4(),
        name: formData.name.trim(),
        spec: formData.spec.trim(),
        quantity: formData.quantity.trim(),
        detailLocation: formData.detailLocation.trim(),
        openDate: formData.openDate,
        remark: formData.remark.trim(),
        createdAt: new Date().toISOString()
      }
      reagents.unshift(item)
      locations[locIndex].reagents = reagents
      saveLocations(locations)
      setShowSuccess(true)
      loadLocationData()
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
      detailLocation: item.detailLocation || '',
      openDate: item.openDate || '',
      remark: item.remark || ''
    })
    setEditingId(item.id)
    setShowMore(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (!confirm('确定要删除这条记录吗？')) return
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const locIndex = locations.findIndex(loc => loc.id === locationId)
    if (locIndex === -1) return

    const filtered = (locations[locIndex].reagents || []).filter(item => item.id !== id)
    locations[locIndex].reagents = filtered
    saveLocations(locations)
    loadLocationData()
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

    const headers = ['名称', '规格', '数量', '存放点', '具体位置', '开启日期', '备注']
    const rows = itemsToExport.map(item => [
      item.name || '',
      item.spec || '',
      item.quantity || '',
      location?.name || '',
      item.detailLocation || '',
      item.openDate || '',
      item.remark || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const safeName = (location?.name || '未知存放点').replace(/[\\/:*?"<>|]/g, '_')
    link.download = `${today}_${safeName}_试剂清单.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBack = () => {
    navigate('/reagent')
  }

  const handleBackHome = () => {
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

  if (!location) {
    return <div className="entry-page">加载中...</div>
  }

  return (
    <div className="entry-page">
      <div className="entry-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回试剂库
        </button>
        <div className="entry-title">
          <span className="entry-icon">🧪</span>
          试剂录入
        </div>
      </div>

      <div className="current-location-bar">
        当前存放点：{location.name}
        {location.remark && <span className="location-remark">（{location.remark}）</span>}
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
              placeholder="比如：酒精、硫酸"
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
              placeholder="比如：500 mL、10 mL、99%"
            />
          </div>

          <div className="form-group form-group-half">
            <label>数量</label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="比如：5 瓶、2 盒、10 包"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📍 具体位置</label>
            <input
              type="text"
              name="detailLocation"
              value={formData.detailLocation}
              onChange={handleChange}
              placeholder="比如：上层、下层、A区、第二层"
            />
          </div>
        </div>

        <div
          className="expand-toggle"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? '▲ 点击收起更多信息' : '▼ 展开更多（开启日期、备注）'}
        </div>

        {showMore && (
          <div className="expand-section">
            <div className="form-row">
              <div className="form-group">
                <label>开启日期</label>
                <input
                  type="month"
                  name="openDate"
                  value={formData.openDate}
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
          <button className="save-btn" onClick={handleSave}>
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
          <button className="back-home-btn" onClick={handleBackHome}>
            返回首页
          </button>
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-title">── 已录入试剂 ──</div>

        {allItems.length === 0 ? (
          <div className="no-results">该存放点暂无试剂，请新增记录。</div>
        ) : (
          <>
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索试剂（名称、规格、数量、位置、备注）..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="all-items-list">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <span className="item-icon">🧪</span>
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
                        <span className="item-label">具体位置：</span>
                        <span className="item-value">{item.detailLocation || '无'}</span>
                      </div>
                      <div className="item-row">
                        <span className="item-label">开启日期：</span>
                        <span className="item-value">{item.openDate || '无'}</span>
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
                <div className="no-results">暂无匹配的试剂</div>
              )}
            </div>
          </>
        )}
      </div>

      {showSuccess && (
        <div className="success-toast">
          ✓ {editingId ? '修改成功！' : '保存成功！'}
        </div>
      )}
    </div>
  )
}

export default ReagentPage
