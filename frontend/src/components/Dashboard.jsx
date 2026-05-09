import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CredentialModal from './CredentialModal';
import { LogOut, Plus, Shield, ShieldCheck, Key, Copy, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { logout } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3002/api/credentials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredentials(res.data);
    } catch (err) {
      console.error('Failed to fetch credentials', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/api/credentials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCredentials();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleEdit = (cred) => {
    setEditingCred(cred);
    setIsModalOpen(true);
  };

  const toggleVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a small toast notification here
  };

  const getStrengthColor = (score) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[score] || colors[0];
  };

  const getStrengthLabel = (score) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[score] || labels[0];
  };

  return (
    <div className="dashboard-page">
      <nav className="glass navbar">
        <div className="nav-brand">
          <ShieldCheck size={28} className="text-primary" />
          <span>SecureVault</span>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>My Credentials</h2>
            <p className="text-muted">Manage your securely encrypted passwords</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingCred(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={20} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading your vault...</div>
        ) : credentials.length === 0 ? (
          <div className="empty-state glass">
            <div className="icon-wrapper">
              <Key size={48} />
            </div>
            <h3>Your vault is empty</h3>
            <p>Add your first credential to securely store it.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsModalOpen(true)}
            >
              Add Credential
            </button>
          </div>
        ) : (
          <div className="credentials-grid">
            {credentials.map((cred) => (
              <div key={cred._id} className="credential-card glass">
                <div className="cred-header">
                  <h3>{cred.title}</h3>
                  <div className="cred-actions">
                    <button onClick={() => handleEdit(cred)} className="btn-icon" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(cred._id)} className="btn-icon text-danger" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="cred-body">
                  <div className="cred-field">
                    <label>Username</label>
                    <div className="copy-field">
                      <span>{cred.username}</span>
                      <button onClick={() => copyToClipboard(cred.username)} className="btn-icon">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cred-field">
                    <label>Password</label>
                    <div className="copy-field">
                      <span>{visiblePasswords[cred._id] ? cred.password : '••••••••••••'}</span>
                      <div className="field-actions">
                        <button onClick={() => toggleVisibility(cred._id)} className="btn-icon">
                          {visiblePasswords[cred._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => copyToClipboard(cred.password)} className="btn-icon">
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {cred.url && (
                    <div className="cred-field">
                      <label>Website</label>
                      <a href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`} target="_blank" rel="noreferrer" className="cred-link">
                        {cred.url}
                      </a>
                    </div>
                  )}
                </div>

                <div className="cred-footer">
                  <div className="strength-indicator">
                    <Shield size={14} color={getStrengthColor(cred.passwordStrength?.score || 0)} />
                    <span style={{ color: getStrengthColor(cred.passwordStrength?.score || 0) }}>
                      {getStrengthLabel(cred.passwordStrength?.score || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <CredentialModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          fetchCredentials={fetchCredentials}
          editingCred={editingCred}
        />
      )}
    </div>
  );
};

export default Dashboard;
