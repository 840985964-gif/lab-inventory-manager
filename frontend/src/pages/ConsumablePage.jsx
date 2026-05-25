import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'lab_consumables'

function ConsumablePage() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [allItems, setAllItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    spec: '',
    quantity: '',
    location: '',
    remark: ''
  })

  useEffect(() => {
    loadAllItems()
  }, [])

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
      (item.remark || '').toLowerCase().includes(term)
    )
  }, [allItems, searchTerm])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请填写物品名称')
      return
    }

    const item = {
      id: uuidv4(),
      name: formData.name.trim(),
      spec: formData.spec.trim(),
      quantity: formData.quantity.trim(),
      location: formData.location.trim(),
      remark: formData.remark.trim(),
      createdAt: new Date().toISOString()
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.unshift(item)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    setShowSuccess(true)
    loadAllItems()
    
    setTimeout(() => {
      setShowSuccess(false)
      setFormData({
        name: '',
        spec: '',
        quantity: '',
        location: '',
        remark: ''
      })
    }, 2000)
  }

  const handleExportCSV = () => {
    const itemsToExport = allItems
    if (itemsToExport.length === 0) {
      alert('暂无数据可导出')
      return
    }

    const headers = ['名称', '规格', '数量', '存放位置', '备注']
    const rows = itemsToExport.map(item => [
      item.name || '',
      item.spec || '',
      item.quantity || '',
      item.location || '',
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
        <div className="form-section-title">📝 基本信息</div>
        
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
          {showMore ? '▲ 点击收起更多信息' : '▼ 展开更多（备注）'}
        </div>

        {showMore && (
          <div className="expand-section">
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
            💾 保存
          </button>
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
                      <span className="item-value">{item.quantity || (item.unit ? `${item.quantity || 0}${item.unit}` : '无')}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">存放位置：</span>
                      <span className="item-value">{item.location || '无'}</span>
                    </div>
                    <div className="item-row">
                      <span className="item-label">备注：</span>
                      <span className="item-value">{item.remark || '无'}</span>
                    </div>
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
          ✓ 保存成功！
        </div>
      )}
    </div>
  )
}

export default ConsumablePage