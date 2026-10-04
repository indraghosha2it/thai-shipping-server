// controllers/footerSettingsController.js
const FooterSettings = require('../models/footerSettingsModel');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinaryUpload');

// ========== GET (Public) ==========
exports.getFooterSettings = async (req, res) => {
  try {
    const settings = await FooterSettings.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get footer settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE TEXT SETTINGS (Admin) ==========
exports.updateFooterSettings = async (req, res) => {
  try {
    const {
      contactInfo,
      socialLinks,
      companyName,
      description,
      copyrightText,
      discoverLinks,
      informationLinks,
    } = req.body;

    const settings = await FooterSettings.getSettings();

    if (contactInfo) {
      settings.contactInfo = {
        ...settings.contactInfo.toObject(),
        ...contactInfo,
      };
    }
    if (socialLinks) settings.socialLinks = socialLinks;
    if (companyName) settings.companyName = companyName;
    if (description) settings.description = description;
    if (copyrightText) settings.copyrightText = copyrightText;
    if (discoverLinks) settings.discoverLinks = discoverLinks;
    if (informationLinks) settings.informationLinks = informationLinks;

    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Footer settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update footer settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPLOAD NAVBAR LOGO ==========
exports.uploadNavbarLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const settings = await FooterSettings.getSettings();

    if (settings.navbarLogo?.publicId) {
      await deleteFromCloudinary(settings.navbarLogo.publicId);
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'thai-shipping/footer/navbar-logo',
      transformation: [{ width: 400, height: 400, crop: 'limit' }],
    });

    settings.navbarLogo = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Navbar logo uploaded successfully',
      data: settings.navbarLogo,
    });
  } catch (error) {
    console.error('Upload navbar logo error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPLOAD BANNER LOGO ==========
exports.uploadBannerLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const settings = await FooterSettings.getSettings();

    if (settings.bannerLogo?.publicId) {
      await deleteFromCloudinary(settings.bannerLogo.publicId);
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'thai-shipping/footer/banner-logo',
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    });

    settings.bannerLogo = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Banner logo uploaded successfully',
      data: settings.bannerLogo,
    });
  } catch (error) {
    console.error('Upload banner logo error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPLOAD GALLERY IMAGES ==========
exports.uploadGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const settings = await FooterSettings.getSettings();
    const currentCount = settings.galleryImages?.length || 0;

    if (currentCount + req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: `Maximum 6 images allowed. You have ${currentCount}, trying to add ${req.files.length}.`,
      });
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder: 'thai-shipping/footer/gallery',
          transformation: [
            { width: 600, height: 600, crop: 'fill', quality: 'auto' },
          ],
        })
      )
    );

    const newImages = uploads.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      alt: `Gallery image ${currentCount + index + 1}`,
      order: currentCount + index,
    }));

    settings.galleryImages = [...(settings.galleryImages || []), ...newImages];
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: `${newImages.length} image(s) uploaded successfully`,
      data: settings.galleryImages,
    });
  } catch (error) {
    console.error('Upload gallery images error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REPLACE GALLERY IMAGE ==========
exports.replaceGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const settings = await FooterSettings.getSettings();
    const image = settings.galleryImages.id(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'thai-shipping/footer/gallery',
      transformation: [
        { width: 600, height: 600, crop: 'fill', quality: 'auto' },
      ],
    });

    image.url = result.secure_url;
    image.publicId = result.public_id;

    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Image replaced successfully',
      data: image,
    });
  } catch (error) {
    console.error('Replace gallery image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DELETE GALLERY IMAGE ==========
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const settings = await FooterSettings.getSettings();
    const image = settings.galleryImages.id(imageId);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    settings.galleryImages.pull(imageId);
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: settings.galleryImages,
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DELETE LOGO ==========
exports.deleteLogo = async (req, res) => {
  try {
    const { type } = req.params;
    const logoField = type === 'navbar' ? 'navbarLogo' : 'bannerLogo';

    const settings = await FooterSettings.getSettings();

    if (settings[logoField]?.publicId) {
      await deleteFromCloudinary(settings[logoField].publicId);
    }

    settings[logoField] = { url: '', publicId: '' };
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: `${type} logo deleted successfully`,
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};