import React from 'react';
import {
  User, Building, Briefcase, ShieldCheck, Edit3, Shield, CheckCircle2, Lock,
  Camera, Upload, Trash2, Image as ImageIcon
} from 'lucide-react';

interface ProfileViewProps {
  users: any[];
  currentRole: string;
  customRoles: any[];
  isLight: boolean;
  windowWidth: number;
  profileToastMessage: string;
  handleStartEditProfile: (user: any) => void;
  handleOpenSecurityAuditModal: (user: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  users,
  currentRole,
  customRoles,
  isLight,
  windowWidth,
  profileToastMessage,
  handleStartEditProfile,
  handleOpenSecurityAuditModal
}) => {
  const currentUser = users.find(u => u.role === currentRole || (currentRole === 'SUPER_ADMIN' && (u.id === 'USR-01' || u.role === 'SUPER_ADMIN'))) || users.find(u => u.role === currentRole) || users[0] || {
    id: 'USR-01',
    username: 'Avishek Das (Owner)',
    full_name: 'Avishek Das',
    email: 'avishek.das@swaramayi.com',
    mobile: '+91 98490 00001',
    role: 'SUPER_ADMIN',
    branch_name: 'Head Office',
    department: 'Executive Board',
    team_name: 'Core Management',
    manager_name: 'Self',
    is_active: true,
    user_status: 'ACTIVE'
  };

  const storageKey = `swaramayi_user_avatar_${currentUser.id || currentUser.username}`;
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => localStorage.getItem(storageKey));
  const [toastMsg, setToastMsg] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const key = `swaramayi_user_avatar_${currentUser.id || currentUser.username}`;
    setAvatarUrl(localStorage.getItem(key));
  }, [currentUser.id, currentUser.username]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const key = `swaramayi_user_avatar_${currentUser.id || currentUser.username}`;
        localStorage.setItem(key, base64);
        setAvatarUrl(base64);
        setToastMsg('Profile logo updated successfully!');
        window.dispatchEvent(new Event('swaramayi-avatar-updated'));
        setTimeout(() => setToastMsg(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const key = `swaramayi_user_avatar_${currentUser.id || currentUser.username}`;
    localStorage.removeItem(key);
    setAvatarUrl(null);
    setToastMsg('Profile logo removed successfully.');
    window.dispatchEvent(new Event('swaramayi-avatar-updated'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const roleInfo = customRoles.find(r => {
    const uRole = (currentUser.role || '').toUpperCase();
    const rKey = (r.key || '').toUpperCase();
    const rNameClean = (r.name || '').replace(/^\d+\.\s*/, '').toUpperCase();
    return rKey === uRole || rNameClean === uRole;
  }) || {
    key: currentUser.role,
    name: currentUser.role === 'SUPER_ADMIN' ? '1. OWNER / SUPER ADMIN' : currentUser.role === 'ADMIN' ? '2. ADMIN' : currentUser.role,
    level: (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'OWNER') 
      ? 'Level 5 (Highest)' 
      : (currentUser.role === 'ADMIN') 
      ? 'Level 4 (High)' 
      : 'Level 3 (Branch Level)',
    scope: (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'OWNER') 
      ? 'Universal All-Data Access' 
      : (currentUser.role === 'ADMIN') 
      ? 'Company-Wide Operations' 
      : `${currentUser.branch_name || 'Assigned Branch'} Data Access`,
    desc: 'Enterprise role with authorized read/write access.',
    color: '#0284c7'
  };

  const designation = currentUser.designation || (
    currentUser.role === 'SUPER_ADMIN' ? 'Managing Director & Founder' :
    currentUser.role === 'ADMIN' ? 'System Administrator' :
    currentUser.role === 'GENERAL_MANAGER' ? 'General Manager' :
    currentUser.role === 'BRANCH_MANAGER' ? 'Branch Head & Manager' :
    currentUser.role === 'SALES_MANAGER' ? 'Senior Sales Manager' :
    currentUser.role === 'TEAM_LEAD' ? 'Sales Team Leader' :
    currentUser.role === 'TELECALLER' ? 'Telecalling Specialist' :
    currentUser.role === 'PROPERTY_MANAGEMENT' ? 'Property & Stock Controller' :
    currentUser.role === 'SALES_EMPLOYEE' ? 'Sales Executive' :
    `${roleInfo.name || currentUser.role} Officer`
  );

  const directReportsCount = users.filter(u => 
    u.id !== currentUser.id && 
    (
      (u.manager_name && (u.manager_name.includes(currentUser.full_name) || u.manager_name.includes(currentUser.username))) ||
      (currentUser.role === 'SUPER_ADMIN')
    )
  ).length;

  const permissionsList = currentUser.role === 'SUPER_ADMIN' ? [
    'Full Read, Write & Delete Authority',
    'Maker-Checker Universal Approvals',
    'Executive Price Override Rights',
    'Brokerage & Commission Governance',
    'Emergency System Lockdown Switch'
  ] : currentUser.role === 'ADMIN' ? [
    'Company-Wide Read & Write Rights',
    'Employee User Ingestion & Management',
    'Property Inventory Governance',
    'Lead Queue Allocation & Transfers',
    'System Audit Log Inspection'
  ] : currentUser.role === 'BRANCH_MANAGER' ? [
    'Branch Lead & Customer Pipeline Access',
    'Tower Unit Board & Stock View',
    'Team Performance Reporting',
    'Site Visit Scheduling & Approvals',
    'Branch Expense & Target Tracking'
  ] : currentUser.role === 'TELECALLER' ? [
    'Inbound & Outbound Calling Queue Access',
    'Customer Requirement Profiling',
    'Follow-Up Scheduling & Lead Ingestion',
    'Call Status & Activity Logging',
    'Telecalling Conversion Performance'
  ] : currentUser.role === 'PROPERTY_MANAGEMENT' ? [
    'Live Tower Unit Board & Stock Ingestion',
    'Property Pricing Updates & Unit Matrix',
    'Floor Plan & Brochure Attachments',
    'Amenity & Spec Tagging Governance',
    'Developer Inventory Sync'
  ] : [
    'Assigned Lead Management',
    'Customer Communication Logging',
    'Follow-Up & Site Visit Requests',
    'Property Inventory Lookup',
    'Personal Performance Metrics'
  ];

  const activeToast = profileToastMessage || toastMsg;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HIDDEN LOGO FILE INPUT */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLogoUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* SUCCESS TOAST MESSAGE */}
      {activeToast && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', borderRadius: '12px', padding: '14px 20px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="#22c55e" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* PROFILE BANNER / HEADER CARD */}
      <div style={{
        background: isLight 
          ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)' 
          : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* AVATAR BADGE WITH PROFILE LOGO SUPPORT */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload or change profile logo"
              style={{
                width: '95px',
                height: '95px',
                borderRadius: '24px',
                background: avatarUrl ? '#0f172a' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2.2rem',
                fontWeight: '900',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                border: '3px solid #38bdf8',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                currentUser.full_name ? currentUser.full_name.split(' ').map((n: string) => n[0]).join('') : 'RV'
              )}

              {/* CAMERA OVERLAY ON HOVER */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <Camera size={28} color="#ffffff" />
              </div>
            </div>

            {/* CAMERA BADGE OVERLAY BUTTON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload Profile Logo"
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#0284c7',
                color: '#ffffff',
                border: isLight ? '3px solid #ffffff' : '3px solid #0f172a',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                padding: 0
              }}
            >
              <Camera size={15} color="#ffffff" />
            </button>
          </div>

          {/* USER INFO */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                {currentUser.full_name}
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '900',
                letterSpacing: '0.5px'
              }}>
                👑 {currentUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN / OWNER' : (roleInfo.name || currentUser.role)}
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: '800'
              }}>
                ● {currentUser.user_status || 'ACTIVE & VERIFIED'}
              </span>
            </div>

            <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.9rem', marginTop: '6px', marginBottom: '8px' }}>
              {currentUser.username} • User ID: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{currentUser.id}</strong>
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: isLight ? '#475569' : '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Building size={15} color="#38bdf8" /> {currentUser.branch_name || 'Head Office'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={15} color="#fbbf24" /> {currentUser.department || 'Operations'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={15} color="#4ade80" /> Security {roleInfo.level}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={() => handleStartEditProfile(currentUser)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Edit3 size={16} /> Edit Details
          </button>
          <button 
            onClick={() => handleOpenSecurityAuditModal(currentUser)}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Shield size={16} color="#ffffff" /> Security Audit
          </button>
        </div>
      </div>

      {/* 3-COLUMN DETAIL GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* COLUMN 1: CONTACT & PERSONAL INFORMATION */}
        <div style={{
          background: isLight ? '#ffffff' : '#1e293b',
          border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
            <User size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              Personal & Contact Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Full Name</span>
              <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.95rem', marginTop: '2px' }}>{currentUser.full_name || currentUser.username}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Username & Alias</span>
              <span style={{ display: 'block', color: '#fbbf24', fontWeight: '800', marginTop: '2px' }}>{currentUser.username}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Email Address</span>
              <span style={{ display: 'block', color: '#38bdf8', fontWeight: '700', marginTop: '2px' }}>{currentUser.email || 'admin@swaramayi.com'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Mobile Contact</span>
              <span style={{ display: 'block', color: '#4ade80', fontWeight: '800', marginTop: '2px' }}>{currentUser.mobile || '+91 98490 00001'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Official Designation</span>
              <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', marginTop: '2px' }}>{designation}</strong>
            </div>
          </div>
        </div>

        {/* COLUMN 2: ORGANIZATIONAL HIERARCHY */}
        <div style={{
          background: isLight ? '#ffffff' : '#1e293b',
          border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
            <Building size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              Organizational Hierarchy
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Assigned Branch</span>
              <strong style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.95rem', marginTop: '2px' }}>{currentUser.branch_name || 'Head Office (Kolkata)'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Department</span>
              <span style={{ display: 'block', color: '#38bdf8', fontWeight: '800', marginTop: '2px' }}>{currentUser.department || 'Executive Board'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Team Assignment</span>
              <span style={{ display: 'block', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', marginTop: '2px' }}>{currentUser.team_name || 'Corporate Leadership Squad'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Reporting Manager</span>
              <span style={{ display: 'block', color: '#4ade80', fontWeight: '800', marginTop: '2px' }}>{currentUser.manager_name || 'Avishek Das (Super Admin)'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Direct Reports Managed</span>
              <strong style={{ display: 'block', color: '#f59e0b', fontWeight: '800', marginTop: '2px' }}>{directReportsCount} Active Staff Members</strong>
            </div>
          </div>
        </div>

        {/* COLUMN 3: RBAC SCOPE & PRIVILEGES */}
        <div style={{
          background: isLight ? '#ffffff' : '#1e293b',
          border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
            <ShieldCheck size={20} color="#4ade80" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              RBAC Scope & Privileges
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Data Scope Level</span>
              <strong style={{ display: 'block', color: '#0284c7', fontSize: '0.9rem', marginTop: '2px' }}>{roleInfo.scope} ({roleInfo.level})</strong>
            </div>

            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {permissionsList.map((perm: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isLight ? '#475569' : '#cbd5e1' }}>
                  <CheckCircle2 size={14} color="#38bdf8" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ACTIVE SESSIONS & SECURITY AUTHENTICATION CARD */}
      <div style={{
        background: isLight ? '#ffffff' : '#1e293b',
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              Active Sessions & Security Authentication
            </h3>
          </div>
          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
            🔐 Hardware Key 2FA Active
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: isLight ? '#64748b' : '#94a3b8', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <th style={{ padding: '8px 12px' }}>Session ID</th>
                <th style={{ padding: '8px 12px' }}>Authenticated User</th>
                <th style={{ padding: '8px 12px' }}>IP Address</th>
                <th style={{ padding: '8px 12px' }}>Device / Browser</th>
                <th style={{ padding: '8px 12px' }}>Login Time</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #334155' }}>
                <td style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: '700', fontFamily: 'monospace' }}>SES-01</td>
                <td style={{ padding: '10px 12px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{currentUser.full_name || currentUser.username} ({roleInfo.name || currentUser.role})</td>
                <td style={{ padding: '10px 12px', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>127.0.0.1 (Localhost)</td>
                <td style={{ padding: '10px 12px', color: isLight ? '#64748b' : '#94a3b8' }}>Chrome / Windows 11</td>
                <td style={{ padding: '10px 12px', color: '#fbbf24', fontWeight: '700' }}>27 Aug 09:00 AM</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                    ● ACTIVE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
