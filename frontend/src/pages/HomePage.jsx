import { useNavigate } from 'react-router-dom'

function CabinetCard({ type, title, icon, color, description, onClick }) {
  return (
    <div 
      className={`cabinet-card cabinet-card-${color}`}
      onClick={onClick}
    >
      <div className="cabinet-card-inner">
        <div className="cabinet-icon">{icon}</div>
        <div className="cabinet-title">{title}</div>
        <div className="cabinet-description">{description}</div>
        <div className="cabinet-door">
          <span>点击进入</span>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🧪 实验室物资管理</h1>
        <p>选择要录入的物资类型</p>
      </div>
      
      <div className="cabinet-container">
        <CabinetCard
          type="reagent"
          title="试剂柜"
          icon="🧪"
          color="blue"
          description="化学试剂、生物试剂、标准品等"
          onClick={() => navigate('/reagent')}
        />
        
        <CabinetCard
          type="consumable"
          title="耗材柜"
          icon="🔬"
          color="green"
          description="实验耗材、器具、耗材等"
          onClick={() => navigate('/consumable')}
        />
      </div>
    </div>
  )
}

export default HomePage
