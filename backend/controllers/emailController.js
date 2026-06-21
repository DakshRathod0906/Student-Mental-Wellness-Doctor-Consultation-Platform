const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const EmailLog = require('../models/EmailLog');
const EmailRule = require('../models/EmailRule');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// --- Email Service Utility ---
const sendEmail = async (to, subject, htmlBody) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  const isPlaceholder = (val) => {
    if (!val) return true;
    const v = val.trim().toLowerCase();
    return v === '' || v.includes('your_') || v.includes('placeholder') || v.includes('example') || v === 'your_email' || v === 'your_password';
  };

  // Graceful fallback if SMTP is not configured or uses placeholder credentials
  if (isPlaceholder(user) || isPlaceholder(pass)) {
    console.log('==================================================');
    console.log(' MOCK EMAIL SENT (SMTP NOT CONFIGURED IN .ENV)');
    console.log(` To:      ${to}`);
    console.log(` Subject: ${subject}`);
    console.log('==================================================');
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const info = await transporter.sendMail({
      from: `"WellHealth Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

const replaceVariables = (text, variables) => {
  let result = text;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  return result;
};

// =====================
// EMAIL TEMPLATES CRUD
// =====================

// @desc    Get all email templates
// @route   GET /api/emails/templates
const getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create email template
// @route   POST /api/emails/templates
const createTemplate = async (req, res) => {
  try {
    const { name, category, subject, body, variables } = req.body;
    const template = await EmailTemplate.create({
      name,
      category,
      subject,
      body,
      variables: variables || [],
      createdBy: req.user._id
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update email template
// @route   PUT /api/emails/templates/:id
const updateTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Duplicate email template
// @route   POST /api/emails/templates/:id/duplicate
const duplicateTemplate = async (req, res) => {
  try {
    const original = await EmailTemplate.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Template not found' });

    const duplicate = await EmailTemplate.create({
      name: `${original.name} (Copy)`,
      category: original.category,
      subject: original.subject,
      body: original.body,
      variables: original.variables,
      createdBy: req.user._id
    });
    res.status(201).json(duplicate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete email template
// @route   DELETE /api/emails/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// EMAIL CAMPAIGNS
// =====================

// @desc    Get all campaigns
// @route   GET /api/emails/campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find()
      .populate('templateId', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create campaign
// @route   POST /api/emails/campaigns
const createCampaign = async (req, res) => {
  try {
    const { title, audience, campaignType, templateId, subject, body, scheduledAt } = req.body;
    const campaign = await EmailCampaign.create({
      title,
      audience,
      campaignType,
      templateId: templateId || null,
      subject,
      body,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt || null,
      createdBy: req.user._id
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Send campaign immediately
// @route   POST /api/emails/campaigns/:id/send
const sendCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    campaign.status = 'processing';
    await campaign.save();

    // Get target audience
    let filter = {};
    switch (campaign.audience) {
      case 'all_students': filter = { role: 'student' }; break;
      case 'all_doctors': filter = { role: 'doctor' }; break;
      case 'active_students': filter = { role: 'student' }; break;
      case 'inactive_students': filter = { role: 'student' }; break;
      case 'all_users': filter = {}; break;
    }

    const recipients = await User.find(filter).select('email firstName lastName');
    campaign.recipientCount = recipients.length;

    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      const personalizedBody = replaceVariables(campaign.body, {
        studentName: `${recipient.firstName} ${recipient.lastName}`,
        doctorName: `${recipient.firstName} ${recipient.lastName}`
      });

      const result = await sendEmail(recipient.email, campaign.subject, personalizedBody);

      await EmailLog.create({
        recipient: recipient.email,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        subject: campaign.subject,
        body: personalizedBody,
        status: result.success ? 'sent' : 'failed',
        type: 'campaign',
        campaignId: campaign._id,
        sentAt: result.success ? new Date() : undefined,
        error: result.error || undefined
      });

      if (result.success) successCount++;
      else failureCount++;
    }

    campaign.successCount = successCount;
    campaign.failureCount = failureCount;
    campaign.status = failureCount === recipients.length ? 'failed' : 'sent';
    campaign.sentAt = new Date();
    await campaign.save();

    res.json({
      message: `Campaign sent to ${successCount}/${recipients.length} recipients`,
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/emails/campaigns/:id
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// EMAIL RULES (Automated)
// =====================

// @desc    Get all automation rules
// @route   GET /api/emails/rules
const getRules = async (req, res) => {
  try {
    const rules = await EmailRule.find().populate('templateId', 'name').sort({ category: 1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update automation rule
// @route   POST /api/emails/rules
const upsertRule = async (req, res) => {
  try {
    const { trigger, name, subject, body, category, templateId, isActive } = req.body;
    const rule = await EmailRule.findOneAndUpdate(
      { trigger },
      { name, subject, body, category, templateId, isActive },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle rule active status
// @route   PATCH /api/emails/rules/:id/toggle
const toggleRule = async (req, res) => {
  try {
    const rule = await EmailRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// EMAIL LOGS
// =====================

// @desc    Get email logs with filters
// @route   GET /api/emails/logs
const getLogs = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await EmailLog.countDocuments(filter);

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// EMAIL ANALYTICS
// =====================

// @desc    Get email analytics/stats
// @route   GET /api/emails/analytics
const getAnalytics = async (req, res) => {
  try {
    const totalSent = await EmailLog.countDocuments({ status: { $in: ['sent', 'delivered'] } });
    const totalDelivered = await EmailLog.countDocuments({ status: 'delivered' });
    const totalFailed = await EmailLog.countDocuments({ status: 'failed' });
    const totalOpened = await EmailLog.countDocuments({ status: 'opened' });
    const totalPending = await EmailLog.countDocuments({ status: 'pending' });
    const totalScheduled = await EmailCampaign.countDocuments({ status: 'scheduled' });

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const deliveryRate = totalSent > 0 ? Math.round(((totalSent - totalFailed) / totalSent) * 100) : 0;

    // Emails sent per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered']] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Campaign performance
    const campaignStats = await EmailCampaign.find({ status: 'sent' })
      .select('title recipientCount successCount failureCount sentAt')
      .sort({ sentAt: -1 })
      .limit(10);

    res.json({
      cards: {
        totalSent,
        totalDelivered,
        totalFailed,
        totalOpened,
        totalPending,
        totalScheduled,
        openRate,
        deliveryRate
      },
      dailyStats,
      campaignStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// SEND TEST EMAIL
// =====================

// @desc    Send a test/preview email
// @route   POST /api/emails/send-test
const sendTestEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const result = await sendEmail(to, subject, body);

    if (result.success) {
      await EmailLog.create({
        recipient: to,
        subject,
        body,
        status: 'sent',
        type: 'system',
        sentAt: new Date()
      });
      res.json({ message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      await EmailLog.create({
        recipient: to,
        subject,
        body,
        status: 'failed',
        type: 'system',
        error: result.error
      });
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
  getCampaigns,
  createCampaign,
  sendCampaign,
  deleteCampaign,
  getRules,
  upsertRule,
  toggleRule,
  getLogs,
  getAnalytics,
  sendTestEmail
};
