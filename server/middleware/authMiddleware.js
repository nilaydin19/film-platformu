const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız. Token bulunamadı.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kinoia_super_secret_premium_key_2026');

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

// Sadece aktif üyelerin veya adminlerin oynatmasına izin veren ara katman
const requireActiveSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Lütfen önce giriş yapın.' });
  }
  
  // Yöneticiler (Admin) her içeriği koşulsuz izleyebilir
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.subscriptionStatus !== 'active') {
    return res.status(403).json({ 
      message: 'Bu içeriği izlemek için aktif bir aboneliğinizin olması gerekmektedir.',
      subscriptionStatus: req.user.subscriptionStatus
    });
  }
  
  next();
};

// Sadece yöneticilerin CRUD rotalarına erişmesine izin veren ara katman
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Lütfen önce giriş yapın.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Bu işlem için yönetici (Admin) yetkisi gerekmektedir.'
    });
  }
  
  next();
};

module.exports = { authMiddleware, requireActiveSubscription, requireAdmin };
