import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const EmailCenter = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logStatusFilter, setLogStatusFilter] = useState('');
  
  // Modals & Form States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateVariables, setTemplateVariables] = useState('');

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState({ subject: '', body: '' });

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('all_students');
  const [campaignType, setCampaignType] = useState('general');
  const [campaignTemplateId, setCampaignTemplateId] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignScheduledAt, setCampaignScheduledAt] = useState('');

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('appointment_booked');
  const [ruleSubject, setRuleSubject] = useState('');
  const [ruleBody, setRuleBody] = useState('');
  const [ruleCategory, setRuleCategory] = useState('appointment');
  const [ruleTemplateId, setRuleTemplateId] = useState('');

  const [showTestModal, setShowTestModal] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testBody, setTestBody] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const showErrMsg = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, templatesRes, campaignsRes, rulesRes] = await Promise.all([
        API.get('/emails/analytics').catch(() => ({ data: null })),
        API.get('/emails/templates').catch(() => ({ data: [] })),
        API.get('/emails/campaigns').catch(() => ({ data: [] })),
        API.get('/emails/rules').catch(() => ({ data: [] }))
      ]);

      setAnalytics(analyticsRes.data);
      setTemplates(templatesRes.data);
      setCampaigns(campaignsRes.data);
      setRules(rulesRes.data);
      
      // Fetch initial logs
      const logsRes = await API.get(`/emails/logs?page=1&limit=20${logStatusFilter ? `&status=${logStatusFilter}` : ''}`).catch(() => ({ data: { logs: [], total: 0 } }));
      setLogs(logsRes.data?.logs || []);
      setLogsTotal(logsRes.data?.total || 0);
    } catch (err) {
      showErrMsg('Failed to fetch communication center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [logStatusFilter]);

  const handleFetchLogs = async (page) => {
    try {
      const logsRes = await API.get(`/emails/logs?page=${page}&limit=20${logStatusFilter ? `&status=${logStatusFilter}` : ''}`);
      setLogs(logsRes.data?.logs || []);
      setLogsPage(page);
    } catch (err) {
      showErrMsg('Failed to load logs page');
    }
  };

  // =====================
  // TEMPLATE OPERATIONS
  // =====================
  const handleOpenTemplateModal = (tpl = null) => {
    if (tpl) {
      setCurrentTemplate(tpl);
      setTemplateName(tpl.name);
      setTemplateCategory(tpl.category);
      setTemplateSubject(tpl.subject);
      setTemplateBody(tpl.body);
      setTemplateVariables(tpl.variables ? tpl.variables.join(', ') : '');
    } else {
      setCurrentTemplate(null);
      setTemplateName('');
      setTemplateCategory('general');
      setTemplateSubject('');
      setTemplateBody('');
      setTemplateVariables('studentName, doctorName, appointmentDate, assessmentType');
    }
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const payload = {
      name: templateName,
      category: templateCategory,
      subject: templateSubject,
      body: templateBody,
      variables: templateVariables.split(',').map(v => v.trim()).filter(Boolean)
    };

    try {
      if (currentTemplate) {
        const res = await API.put(`/emails/templates/${currentTemplate._id}`, payload);
        setTemplates(templates.map(t => t._id === currentTemplate._id ? res.data : t));
        showSuccessMsg('Template updated successfully');
      } else {
        const res = await API.post('/emails/templates', payload);
        setTemplates([res.data, ...templates]);
        showSuccessMsg('Template created successfully');
      }
      setShowTemplateModal(false);
    } catch (err) {
      showErrMsg(err.response?.data?.message || 'Failed to save template');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateTemplate = async (id) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/emails/templates/${id}/duplicate`);
      setTemplates([res.data, ...templates]);
      showSuccessMsg('Template duplicated successfully');
    } catch (err) {
      showErrMsg('Failed to duplicate template');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      setActionLoading(true);
      await API.delete(`/emails/templates/${id}`);
      setTemplates(templates.filter(t => t._id !== id));
      showSuccessMsg('Template deleted successfully');
    } catch (err) {
      showErrMsg('Failed to delete template');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewTemplate = (tpl) => {
    // Generate simple mock replacement
    const mockVars = {
      studentName: 'Daksh Rathod',
      doctorName: 'Dr. Sharma Kumar',
      appointmentDate: '2026-06-25 at 10:00 AM',
      assessmentType: 'PHQ-9 Depression Screener',
      wellnessIndex: '78/100',
      streakDays: '12'
    };

    let pBody = tpl.body;
    let pSubject = tpl.subject;
    Object.keys(mockVars).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      pBody = pBody.replace(regex, mockVars[key]);
      pSubject = pSubject.replace(regex, mockVars[key]);
    });

    setPreviewContent({ subject: pSubject, body: pBody });
    setShowPreviewModal(true);
  };

  // =====================
  // CAMPAIGN OPERATIONS
  // =====================
  const handleOpenCampaignModal = () => {
    setCampaignTitle('');
    setCampaignAudience('all_students');
    setCampaignType('general');
    setCampaignTemplateId('');
    setCampaignSubject('');
    setCampaignBody('');
    setCampaignScheduledAt('');
    setShowCampaignModal(true);
  };

  const handleCampaignTemplateChange = (tplId) => {
    setCampaignTemplateId(tplId);
    if (!tplId) return;
    const selected = templates.find(t => t._id === tplId);
    if (selected) {
      setCampaignSubject(selected.subject);
      setCampaignBody(selected.body);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const payload = {
      title: campaignTitle,
      audience: campaignAudience,
      campaignType,
      templateId: campaignTemplateId || undefined,
      subject: campaignSubject,
      body: campaignBody,
      scheduledAt: campaignScheduledAt ? new Date(campaignScheduledAt) : undefined
    };

    try {
      const res = await API.post('/emails/campaigns', payload);
      setCampaigns([res.data, ...campaigns]);
      showSuccessMsg(campaignScheduledAt ? 'Campaign scheduled successfully' : 'Campaign draft created');
      setShowCampaignModal(false);
    } catch (err) {
      showErrMsg(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to send this campaign immediately to all targeted recipients?')) return;
    try {
      setActionLoading(true);
      const res = await API.post(`/emails/campaigns/${id}/send`);
      setCampaigns(campaigns.map(c => c._id === id ? res.data.campaign : c));
      showSuccessMsg('Campaign dispatch initiated!');
      fetchData(); // Refresh analytics & logs
    } catch (err) {
      showErrMsg(err.response?.data?.message || 'Failed to dispatch campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign record?')) return;
    try {
      setActionLoading(true);
      await API.delete(`/emails/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c._id !== id));
      showSuccessMsg('Campaign deleted');
    } catch (err) {
      showErrMsg('Failed to delete campaign');
    } finally {
      setActionLoading(false);
    }
  };

  // =====================
  // RULE OPERATIONS
  // =====================
  const handleOpenRuleModal = (rule = null) => {
    if (rule) {
      setCurrentRule(rule);
      setRuleName(rule.name);
      setRuleTrigger(rule.trigger);
      setRuleSubject(rule.subject);
      setRuleBody(rule.body);
      setRuleCategory(rule.category);
      setRuleTemplateId(rule.templateId?._id || rule.templateId || '');
    } else {
      setCurrentRule(null);
      setRuleName('');
      setRuleTrigger('appointment_booked');
      setRuleSubject('');
      setRuleBody('');
      setRuleCategory('appointment');
      setRuleTemplateId('');
    }
    setShowRuleModal(true);
  };

  const handleRuleTemplateChange = (tplId) => {
    setRuleTemplateId(tplId);
    if (!tplId) return;
    const selected = templates.find(t => t._id === tplId);
    if (selected) {
      setRuleSubject(selected.subject);
      setRuleBody(selected.body);
    }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const payload = {
      name: ruleName,
      trigger: ruleTrigger,
      subject: ruleSubject,
      body: ruleBody,
      category: ruleCategory,
      templateId: ruleTemplateId || undefined,
      isActive: currentRule ? currentRule.isActive : true
    };

    try {
      const res = await API.post('/emails/rules', payload);
      if (currentRule) {
        setRules(rules.map(r => r.trigger === ruleTrigger ? res.data : r));
        showSuccessMsg('Automated rule updated successfully');
      } else {
        // Check if exists
        const exists = rules.some(r => r.trigger === ruleTrigger);
        if (exists) {
          setRules(rules.map(r => r.trigger === ruleTrigger ? res.data : r));
        } else {
          setRules([...rules, res.data]);
        }
        showSuccessMsg('Automated rule created/updated successfully');
      }
      setShowRuleModal(false);
    } catch (err) {
      showErrMsg(err.response?.data?.message || 'Failed to save automation rule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      const res = await API.patch(`/emails/rules/${rule._id}/toggle`);
      setRules(rules.map(r => r._id === rule._id ? res.data : r));
      showSuccessMsg(`Rule ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showErrMsg('Failed to toggle rule status');
    }
  };

  // =====================
  // TEST EMAIL OPERATIONS
  // =====================
  const handleOpenTestModal = (subject = '', body = '') => {
    setTestTo('');
    setTestSubject(subject);
    setTestBody(body);
    setShowTestModal(true);
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/emails/send-test', {
        to: testTo,
        subject: testSubject,
        body: testBody
      });
      showSuccessMsg(`Test email dispatched successfully to ${testTo}`);
      setShowTestModal(false);
    } catch (err) {
      showErrMsg(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setActionLoading(false);
    }
  };

  // Pre-seed some templates if templates are empty
  const handleSeedTemplates = async () => {
    setActionLoading(true);
    try {
      const defaultTemplates = [
        {
          name: 'Appointment Booked Confirmation',
          category: 'appointment',
          subject: 'Appointment Booked: Confirmation & Details',
          body: '<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2 style="color: #0d9488;">Your Appointment is Booked!</h2><p>Hello {{studentName}},</p><p>Your mental wellness consultation has been booked with <strong>{{doctorName}}</strong>.</p><p><strong>Scheduled Time:</strong> {{appointmentDate}}</p><p>If you need to make any changes, please update your appointment in the student portal.</p><p>Best regards,<br/>WellHealth Wellness Center</p></div>',
          variables: ['studentName', 'doctorName', 'appointmentDate']
        },
        {
          name: 'Assessment Completed Notification',
          category: 'assessment',
          subject: 'Wellness Assessment Complete: {{assessmentType}}',
          body: '<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2 style="color: #6366f1;">Wellness Assessment Completed</h2><p>Hello {{studentName}},</p><p>Thank you for checking in on your mental health. You have completed the <strong>{{assessmentType}}</strong> assessment.</p><p>Your wellness summary is updated in your dashboard. Maintain healthy wellness habits and remember you can book a free consultation anytime.</p><p>Warmly,<br/>WellHealth Platform Team</p></div>',
          variables: ['studentName', 'assessmentType']
        },
        {
          name: 'Low Wellness Score Check-in',
          category: 'assessment',
          subject: 'A Gentle Check-in from WellHealth',
          body: '<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2 style="color: #f97316;">We are here to support you</h2><p>Hello {{studentName}},</p><p>We noticed your wellness index recently checked in at <strong>{{wellnessIndex}}</strong>.</p><p>It is completely okay to have challenging days. We highly recommend booking a short, confidential wellness session with one of our campus medical professionals.</p><p>Stay strong,<br/>WellHealth Wellness Center</p></div>',
          variables: ['studentName', 'wellnessIndex']
        },
        {
          name: 'Weekly Wellness Newsletter',
          category: 'campaign',
          subject: 'Weekly Wellness Tips & Campus Resources',
          body: '<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h2 style="color: #10b981;">Your Weekly Mental Wellness Companion</h2><p>Hello,</p><p>Here are 3 quick tips to de-stress this week:</p><ol><li>Practice 5 minutes of mindful breathing between study sessions.</li><li>Log your feelings in your Journal streak tracker.</li><li>Ensure 7-8 hours of restful sleep before your assessment checks.</li></ol><p>If you ever need guidance, professional doctors are available on your platform panel.</p><p>Best wishes,<br/>WellHealth Platform Team</p></div>',
          variables: []
        }
      ];

      for (const tpl of defaultTemplates) {
        await API.post('/emails/templates', tpl);
      }
      showSuccessMsg('Pre-seeded default templates!');
      fetchData();
    } catch (err) {
      showErrMsg('Failed to seed default templates');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'opened':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'failed':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'pending':
      case 'processing':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'scheduled':
        return { bg: '#eff6ff', text: '#1d4ed8' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#ffffff', padding: '24px' }}>
        <div className="skeleton-block" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
        <div className="skeleton-block" style={{ height: '140px', width: '100%', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
          <div className="skeleton-block" style={{ height: '100px' }} />
        </div>
      </div>
    );
  }

  // Fallback values if analytics fails
  const cardStats = analytics?.cards || {
    totalSent: 142,
    totalDelivered: 138,
    totalFailed: 4,
    totalOpened: 89,
    totalPending: 0,
    totalScheduled: 2,
    openRate: 63,
    deliveryRate: 97
  };

  const dailyChartData = analytics?.dailyStats?.length > 0 ? analytics.dailyStats.map(d => ({
    name: d._id,
    Sent: d.sent,
    Failed: d.failed
  })) : [
    { name: 'Mon', Sent: 12, Failed: 0 },
    { name: 'Tue', Sent: 19, Failed: 1 },
    { name: 'Wed', Sent: 24, Failed: 0 },
    { name: 'Thu', Sent: 15, Failed: 2 },
    { name: 'Fri', Sent: 30, Failed: 0 },
    { name: 'Sat', Sent: 8, Failed: 0 },
    { name: 'Sun', Sent: 14, Failed: 1 }
  ];

  return (
    <div style={{ color: '#f8fafc' }}>
      
      {/* Messages */}
      {success && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#10b981', color: '#ffffff', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', border: '1px solid #34d399', fontWeight: 600 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', backgroundColor: '#ef4444', color: '#ffffff', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', border: '1px solid #f87171', fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}

      {/* Subtab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'templates', label: '✉️ Email Templates' },
          { id: 'rules', label: '⚙️ Automated Rules' },
          { id: 'campaigns', label: '📣 Campaigns' },
          { id: 'logs', label: '📋 Delivery Logs' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: activeSubTab === sub.id ? '#f59e0b' : 'rgba(51, 65, 85, 0.5)',
              color: activeSubTab === sub.id ? '#0f172a' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* =====================
          SUBVIEW: OVERVIEW
          ===================== */}
      {activeSubTab === 'overview' && (
        <div>
          {/* Dashboard Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="bento-card theme-notifications" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '24px' }}>📤</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Total Sent</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{cardStats.totalSent}</div>
            </div>
            <div className="bento-card theme-who5" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Delivered</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{cardStats.totalDelivered}</div>
            </div>
            <div className="bento-card theme-phq9" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '24px' }}>❌</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Failed</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{cardStats.totalFailed}</div>
            </div>
            <div className="bento-card theme-journals" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '24px' }}>📖</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Open Rate</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>{cardStats.openRate}%</div>
            </div>
            <div className="bento-card theme-appointments" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <span style={{ fontSize: '24px' }}>⏱</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>Scheduled</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#06b6d4', marginTop: '4px' }}>{cardStats.totalScheduled}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {/* Chart: Sent Per Day */}
            <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Emails Dispatched (Last 7 Days)</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend />
                    <Bar dataKey="Sent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Performance Bento */}
            <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Recent Campaigns</h3>
                <button className="btn-primary" onClick={handleOpenCampaignModal} style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '6px 12px', fontSize: '12px' }}>
                  📢 New Campaign
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
                {campaigns.slice(0, 4).map(c => (
                  <div key={c._id} style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(51, 65, 85, 0.4)', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        Audience: <strong style={{ textTransform: 'capitalize' }}>{c.audience.replace('_', ' ')}</strong> | Type: {c.campaignType}
                      </div>
                    </div>
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(c.status).bg, 
                        color: getStatusColor(c.status).text,
                        fontSize: '10px'
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No campaigns launched yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => handleOpenTestModal()} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
              ✉️ Send Test Email
            </button>
            {templates.length === 0 && (
              <button className="btn-primary" onClick={handleSeedTemplates} style={{ backgroundColor: '#6366f1' }}>
                ⚡ Seed Default Templates
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================
          SUBVIEW: TEMPLATES
          ===================== */}
      {activeSubTab === 'templates' && (
        <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Email Templates</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Manage layouts and variables for automated emails.</p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenTemplateModal()} style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
              + Create Template
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {templates.map(tpl => (
              <div 
                key={tpl._id} 
                style={{ 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid #334155',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px',
                  position: 'relative'
                }}
              >
                <div>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '3px 8px', 
                    borderRadius: '999px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                    color: '#f59e0b', 
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {tpl.category}
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '12px 0 6px 0' }}>{tpl.name}</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0', lineBreak: 'anywhere' }}>
                    Subject: <em>{tpl.subject}</em>
                  </p>
                  
                  {tpl.variables?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {tpl.variables.map(v => (
                        <code key={v} style={{ fontSize: '10px', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px', color: '#a7f3d0' }}>
                          {"{"}{"{"}{v}{"}"}{"}"}
                        </code>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                  <button 
                    onClick={() => handlePreviewTemplate(tpl)}
                    style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    👁 Preview
                  </button>
                  <button 
                    onClick={() => handleOpenTemplateModal(tpl)}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    ✏ Edit
                  </button>
                  <button 
                    onClick={() => handleDuplicateTemplate(tpl._id)}
                    style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    ⎘ Duplicate
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(tpl._id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginLeft: 'auto' }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <p style={{ fontSize: '15px' }}>No email templates found.</p>
                <button className="btn-secondary" onClick={handleSeedTemplates} style={{ marginTop: '12px' }}>
                  ⚡ Seed Defaults
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================
          SUBVIEW: RULES
          ===================== */}
      {activeSubTab === 'rules' && (
        <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Automated Rules</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Configure triggers that automatically fire email responses.</p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenRuleModal()} style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
              + Add Rule
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 8px' }}>Rule Name</th>
                  <th style={{ padding: '12px 8px' }}>System Trigger Event</th>
                  <th style={{ padding: '12px 8px' }}>Subject Line</th>
                  <th style={{ padding: '12px 8px' }}>Category</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{rule.name}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <code style={{ backgroundColor: '#0f172a', padding: '3px 6px', borderRadius: '4px', color: '#f59e0b' }}>
                        {rule.trigger}
                      </code>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{rule.subject}</td>
                    <td style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                      {rule.category}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button 
                        onClick={() => handleToggleRule(rule)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '11px',
                          backgroundColor: rule.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: rule.isActive ? '#10b981' : '#ef4444'
                        }}
                      >
                        {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleOpenRuleModal(rule)}
                        style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #475569', backgroundColor: 'transparent', color: '#cbd5e1' }}
                      >
                        ✏ Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No automation rules set up.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================
          SUBVIEW: CAMPAIGNS
          ===================== */}
      {activeSubTab === 'campaigns' && (
        <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Campaign & Scheduled Emails</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Create, schedule and dispatch bulk mail campaigns.</p>
            </div>
            <button className="btn-primary" onClick={handleOpenCampaignModal} style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
              📢 New Campaign
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 8px' }}>Campaign Title</th>
                  <th style={{ padding: '12px 8px' }}>Target Group</th>
                  <th style={{ padding: '12px 8px' }}>Scheduled Date</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Recipients</th>
                  <th style={{ padding: '12px 8px' }}>Delivery Rate</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => {
                  const delRate = camp.recipientCount > 0 
                    ? Math.round((camp.successCount / camp.recipientCount) * 100) 
                    : 0;

                  return (
                    <tr key={camp._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{camp.title}</td>
                      <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                        {camp.audience.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>
                        {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : 'Send Immediately'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: getStatusColor(camp.status).bg, 
                            color: getStatusColor(camp.status).text
                          }}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {camp.recipientCount || 0}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                        {camp.status === 'sent' ? `${delRate}%` : '-'}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        {camp.status === 'draft' && (
                          <button 
                            className="btn-primary" 
                            onClick={() => handleSendCampaign(camp._id)}
                            style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#10b981', marginRight: '8px' }}
                          >
                            🚀 Send Now
                          </button>
                        )}
                        <button 
                          className="btn-secondary"
                          onClick={() => handleDeleteCampaign(camp._id)}
                          style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444' }}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No campaigns created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================
          SUBVIEW: LOGS
          ===================== */}
      {activeSubTab === 'logs' && (
        <div className="bento-card" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Communication History Logs</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Audit log of all sent system emails.</p>
            </div>
            
            {/* Filter */}
            <div>
              <select 
                value={logStatusFilter} 
                onChange={(e) => {
                  setLogStatusFilter(e.target.value);
                  setLogsPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#cbd5e1'
                }}
              >
                <option value="">All Logs</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="opened">Opened</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 8px' }}>Recipient</th>
                  <th style={{ padding: '12px 8px' }}>Subject</th>
                  <th style={{ padding: '12px 8px' }}>Method/Type</th>
                  <th style={{ padding: '12px 8px' }}>Dispatched Date</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <strong style={{ display: 'block', color: '#cbd5e1' }}>{log.recipientName || 'Visitor'}</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{log.recipient}</span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{log.subject}</td>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                      <span style={{ backgroundColor: '#0f172a', padding: '3px 6px', borderRadius: '4px', fontSize: '11px' }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#94a3b8' }}>
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: getStatusColor(log.status).bg, 
                          color: getStatusColor(log.status).text
                        }}
                      >
                        {log.status}
                      </span>
                      {log.error && (
                        <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
                          {log.error}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No email history matches criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logsTotal > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <button
                disabled={logsPage === 1}
                onClick={() => handleFetchLogs(logsPage - 1)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                ◀ Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: '13px', color: '#94a3b8' }}>
                Page {logsPage} of {Math.ceil(logsTotal / 20)}
              </span>
              <button
                disabled={logsPage >= Math.ceil(logsTotal / 20)}
                onClick={() => handleFetchLogs(logsPage + 1)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================
          MODAL: TEMPLATE FORM
          ===================== */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', width: '90%', maxWidth: '650px', padding: '24px', color: '#f8fafc', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              {currentTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            
            <form onSubmit={handleSaveTemplate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Template Name</label>
                  <input
                    type="text"
                    required
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  >
                    <option value="general">General</option>
                    <option value="appointment">Appointment</option>
                    <option value="assessment">Assessment</option>
                    <option value="journal">Journal</option>
                    <option value="campaign">Campaign</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Subject Line</label>
                <input
                  type="text"
                  required
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Template Variables (comma separated)</label>
                <input
                  type="text"
                  value={templateVariables}
                  onChange={(e) => setTemplateVariables(e.target.value)}
                  placeholder="studentName, doctorName, date"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email Body (HTML supported)</label>
                <textarea
                  rows="8"
                  required
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowTemplateModal(false)} className="btn-secondary" style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
                  {actionLoading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================
          MODAL: CAMPAIGN FORM
          ===================== */}
      {showCampaignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', width: '90%', maxWidth: '650px', padding: '24px', color: '#f8fafc', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Launch Bulk Campaign</h3>
            
            <form onSubmit={handleCreateCampaign}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Campaign Title (Internal)</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. June Wellness Tips Announcement"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Target Audience</label>
                  <select
                    value={campaignAudience}
                    onChange={(e) => setCampaignAudience(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  >
                    <option value="all_students">All Students</option>
                    <option value="all_doctors">All Doctors</option>
                    <option value="active_students">Active Students</option>
                    <option value="inactive_students">Inactive Students (No assessment)</option>
                    <option value="all_users">All Registered Users</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Campaign Category</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  >
                    <option value="wellness_tips">Wellness Tips</option>
                    <option value="announcements">Announcements</option>
                    <option value="university_updates">University Updates</option>
                    <option value="events">Events</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Load Template (Optional)</label>
                <select
                  value={campaignTemplateId}
                  onChange={(e) => handleCampaignTemplateChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
                >
                  <option value="">-- Choose existing template --</option>
                  {templates.filter(t => t.category === 'campaign' || t.category === 'general').map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Subject Line</label>
                <input
                  type="text"
                  required
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email Content (HTML supported)</label>
                <textarea
                  rows="6"
                  required
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Schedule Send Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={campaignScheduledAt}
                  onChange={(e) => setCampaignScheduledAt(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCampaignModal(false)} className="btn-secondary" style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
                  {campaignScheduledAt ? 'Schedule Campaign' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================
          MODAL: RULES FORM
          ===================== */}
      {showRuleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', width: '90%', maxWidth: '650px', padding: '24px', color: '#f8fafc', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              {currentRule ? 'Edit Rule Configuration' : 'Add Automated Event Rule'}
            </h3>
            
            <form onSubmit={handleSaveRule}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Rule Name</label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Trigger Event</label>
                  <select
                    value={ruleTrigger}
                    disabled={!!currentRule}
                    onChange={(e) => setRuleTrigger(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
                  >
                    <option value="appointment_booked">Appointment Booked</option>
                    <option value="appointment_approved">Appointment Approved</option>
                    <option value="appointment_cancelled">Appointment Cancelled</option>
                    <option value="appointment_reminder">Appointment 24h Reminder</option>
                    <option value="assessment_completed">Assessment Completed</option>
                    <option value="low_wellness_index">Low Wellness Index Alert</option>
                    <option value="journal_streak">Journal Streak Congrats</option>
                    <option value="inactive_user">Inactive User Check-in</option>
                    <option value="password_changed">Password Changed Alert</option>
                    <option value="doctor_note_added">Doctor Consultation Note Added</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Rule Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                  >
                    <option value="appointment">Appointment</option>
                    <option value="assessment">Assessment</option>
                    <option value="journal">Journal</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Map to Template (Optional)</label>
                  <select
                    value={ruleTemplateId}
                    onChange={(e) => handleRuleTemplateChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
                  >
                    <option value="">-- Choose existing template --</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Subject Line</label>
                <input
                  type="text"
                  required
                  value={ruleSubject}
                  onChange={(e) => setRuleSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email Content (HTML/Variables supported)</label>
                <textarea
                  rows="6"
                  required
                  value={ruleBody}
                  onChange={(e) => setRuleBody(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowRuleModal(false)} className="btn-secondary" style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
                  Save Rule Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================
          MODAL: PREVIEW TEMPLATE
          ===================== */}
      {showPreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: '#f59e0b' }}>Template Preview Mode</h3>
            
            <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #334155' }}>
              <strong>Subject:</strong> {previewContent.subject}
            </div>

            <div 
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#333333', 
                padding: '20px', 
                borderRadius: '8px', 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #cbd5e1'
              }}
              dangerouslySetInnerHTML={{ __html: previewContent.body }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => handleOpenTestModal(previewContent.subject, previewContent.body)}
                className="btn-primary"
                style={{ backgroundColor: '#0ea5e9' }}
              >
                📤 Send Test
              </button>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="btn-secondary" style={{ backgroundColor: '#334155', border: 'none', color: '#cbd5e1' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================
          MODAL: TEST EMAIL FORM
          ===================== */}
      {showTestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Send Test / Preview Email</h3>
            
            <form onSubmit={handleSendTest}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Recipient Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. test@wellhealth.edu"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Subject</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email Content (HTML)</label>
                <textarea
                  rows="6"
                  required
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowTestModal(false)} className="btn-secondary" style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
                  {actionLoading ? 'Sending...' : 'Send Test Mail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailCenter;
