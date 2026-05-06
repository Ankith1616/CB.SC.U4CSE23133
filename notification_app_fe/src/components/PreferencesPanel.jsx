import { useState, useEffect } from 'react';
import { fetchPreferences, updatePreferences } from '../services/api';

const NOTIF_TYPES = ['info', 'alert', 'warning', 'success', 'system'];

export default function PreferencesPanel({ onClose }) {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences().then((res) => setPrefs(res.data)).catch(console.error);
  }, []);

  const handleToggle = (field) => {
    setPrefs((p) => ({ ...p, [field]: !p[field] }));
  };

  const handleMuteToggle = (type) => {
    setPrefs((p) => {
      const muted = p.mutedTypes.includes(type)
        ? p.mutedTypes.filter((t) => t !== type)
        : [...p.mutedTypes, type];
      return { ...p, mutedTypes: muted };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updatePreferences(prefs);
      setPrefs(res.data);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) return null;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel prefs-panel" onClick={(e) => e.stopPropagation()} id="preferences-panel">
        <div className="panel-header">
          <h2>Preferences</h2>
          <button className="panel-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="panel-body prefs-body">
          <div className="pref-group">
            <h3>Channels</h3>
            <label className="pref-toggle">
              <span>Email Notifications</span>
              <input type="checkbox" checked={prefs.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
              <span className="toggle-slider" />
            </label>
            <label className="pref-toggle">
              <span>Push Notifications</span>
              <input type="checkbox" checked={prefs.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="pref-group">
            <h3>Muted Types</h3>
            <div className="pref-chips">
              {NOTIF_TYPES.map((t) => (
                <button
                  key={t}
                  className={`pref-chip ${prefs.mutedTypes.includes(t) ? 'muted' : ''}`}
                  onClick={() => handleMuteToggle(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pref-group">
            <h3>Quiet Hours</h3>
            <label className="pref-toggle">
              <span>Enable Quiet Hours</span>
              <input type="checkbox" checked={prefs.quietHours?.enabled} onChange={() => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, enabled: !p.quietHours.enabled } }))} />
              <span className="toggle-slider" />
            </label>
            {prefs.quietHours?.enabled && (
              <div className="quiet-hours-inputs">
                <label>
                  Start
                  <input type="time" value={prefs.quietHours.start} onChange={(e) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, start: e.target.value } }))} />
                </label>
                <label>
                  End
                  <input type="time" value={prefs.quietHours.end} onChange={(e) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, end: e.target.value } }))} />
                </label>
              </div>
            )}
          </div>

          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
