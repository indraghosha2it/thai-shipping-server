// routes/footerSettingsRoutes.js
const express = require('express');
const router = express.Router();
const footerController = require('../controller/footerSettingsController');
const { protect, adminOnly } = require('../middleware/AuthVerifyMiddleWare');
const upload = require('../middleware/uploadMiddleware');

// ========== PUBLIC ==========
router.get('/footer-settings', footerController.getFooterSettings);

// ========== ADMIN ==========
router.put(
  '/footer-settings',
  protect,
  adminOnly,
  footerController.updateFooterSettings
);

router.post(
  '/footer-settings/upload/navbar-logo',
  protect,
  adminOnly,
  upload.single('logo'),
  footerController.uploadNavbarLogo
);

router.post(
  '/footer-settings/upload/banner-logo',
  protect,
  adminOnly,
  upload.single('logo'),
  footerController.uploadBannerLogo
);

router.post(
  '/footer-settings/upload/gallery',
  protect,
  adminOnly,
  upload.array('images', 6),
  footerController.uploadGalleryImages
);

router.put(
  '/footer-settings/gallery/:imageId',
  protect,
  adminOnly,
  upload.single('image'),
  footerController.replaceGalleryImage
);

router.delete(
  '/footer-settings/gallery/:imageId',
  protect,
  adminOnly,
  footerController.deleteGalleryImage
);

router.delete(
  '/footer-settings/logo/:type',
  protect,
  adminOnly,
  footerController.deleteLogo
);

module.exports = router;