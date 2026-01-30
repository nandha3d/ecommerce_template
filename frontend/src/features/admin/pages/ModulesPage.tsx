import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_core: boolean;
  is_active: boolean;
  version: string;
}

const iconMap: Record<string, string> = {
  'package': '📦',
  'shopping-cart': '🛒',
  'users': '👥',
  'ticket': '🎫',
  'plus-circle': '➕',
  'gift': '🎁',
  'percent': '💰',
  'credit-card': '💳',
  'image': '🖼️',
  'minimize': '✨',
};

const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await api.get('/modules');
      const data = response.data;
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (slug: string) => {
    setToggling(slug);
    try {
      const response = await fetch(`/api/v1/modules/${slug}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setModules(modules.map(m =>
          m.slug === slug ? { ...m, is_active: data.data.is_active } : m
        ));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to toggle module:', error);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="modules-loading">
        <div className="spinner"></div>
        <p>Loading modules...</p>
      </div>
    );
  }

  return (
    <div className="modules-page">
      <div className="modules-header">
        <h1>Module Management</h1>
        <p>Enable or disable features for your store</p>
      </div>

      <div className="modules-grid">
        {modules.map((module) => (
          <div
            key={module.id}
            className={`module-card ${module.is_active ? 'active' : 'inactive'} ${module.is_core ? 'core' : ''}`}
          >
            <div className="module-icon">
              {iconMap[module.icon] || '📦'}
            </div>

            <div className="module-info">
              <h3>{module.name}</h3>
              <p>{module.description}</p>
              <span className="module-version">v{module.version}</span>
            </div>

            <div className="module-toggle">
              {module.is_core ? (
                <span className="core-badge">Core Module</span>
              ) : (
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={module.is_active}
                    onChange={() => toggleModule(module.slug)}
                    disabled={toggling === module.slug}
                  />
                  <span className="toggle-slider"></span>
                </label>
              )}
            </div>

            {toggling === module.slug && (
              <div className="module-loading-overlay">
                <div className="spinner-small"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .modules-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .modules-header {
          margin-bottom: 32px;
        }

        .modules-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px;
        }

        .modules-header p {
          color: #666;
          margin: 0;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .module-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .module-card.active {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #fff 100%);
        }

        .module-card.inactive {
          opacity: 0.7;
        }

        .module-card.core {
          border-color: #6366f1;
          background: linear-gradient(135deg, #eef2ff 0%, #fff 100%);
        }

        .module-icon {
          font-size: 40px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .module-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px;
        }

        .module-info p {
          font-size: 14px;
          color: #666;
          margin: 0 0 12px;
          line-height: 1.5;
        }

        .module-version {
          font-size: 12px;
          color: #999;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .module-toggle {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
        }

        .core-badge {
          font-size: 12px;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 30px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        input:disabled + .toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .module-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }

        .modules-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #666;
        }

        .spinner, .spinner-small {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner {
          width: 40px;
          height: 40px;
        }

        .spinner-small {
          width: 24px;
          height: 24px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .modules-page {
            padding: 16px;
          }

          .modules-grid {
            grid-template-columns: 1fr;
          }

          .module-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ModulesPage;
