import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Key, RefreshCw } from 'lucide-react';
import zxcvbn from 'zxcvbn';

const CredentialModal = ({ isOpen, onClose, fetchCredentials, editingCred }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ score: 0, feedback: { warning: '', suggestions: [] } });

  useEffect(() => {
    if (editingCred) {
      setTitle(editingCred.title || '');
      setUsername(editingCred.username || '');
      setPassword(editingCred.password || '');
      setUrl(editingCred.url || '');
      setNotes(editingCred.notes || '');
    } else {
      setTitle('');
      setUsername('');
      setPassword('');
      setUrl('');
      setNotes('');
    }
  }, [editingCred]);

  useEffect(() => {
    if (password) {
      setStrength(zxcvbn(password));
    } else {
      setStrength({ score: 0, feedback: { warning: '', suggestions: [] } });
    }
  }, [password]);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < 16; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = { title, username, password, url, notes };
      
      if (editingCred) {
        await axios.put(`http://localhost:3002/api/credentials/${editingCred._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3002/api/credentials', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchCredentials();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStrengthBarColor = () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[strength.score] || colors[0];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <div className="modal-header">
          <h2>{editingCred ? 'Edit Credential' : 'Add New Credential'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Google, Netflix"
              required 
            />
          </div>

          <div className="form-group">
            <label>Username / Email *</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username or Email"
              required 
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-group">
              <input 
                type="text" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
                required 
              />
              <button type="button" onClick={generatePassword} className="btn-icon" title="Generate Password">
                <RefreshCw size={18} />
              </button>
            </div>
            
            {password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="strength-bar"
                      style={{ 
                        backgroundColor: i < strength.score ? getStrengthBarColor() : 'var(--border)'
                      }}
                    />
                  ))}
                </div>
                {strength.feedback.warning && (
                  <p className="strength-warning text-danger text-sm mt-1">{strength.feedback.warning}</p>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Optional notes"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialModal;
