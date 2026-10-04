// models/footerSettingsModel.js
const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok'],
    required: true,
  },
  url: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
});

const footerSettingsSchema = new mongoose.Schema(
  {
    navbarLogo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bannerLogo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    galleryImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        alt: { type: String, default: 'Gallery image' },
        order: { type: Number, default: 0 },
      },
    ],
    socialLinks: [socialLinkSchema],
    contactInfo: {
      address: {
        line1: { type: String, default: 'Bangkok, Thailand' },
        line2: { type: String, default: 'International Shipping Office' },
        country: { type: String, default: 'Thailand' },
      },
      email: {
        type: String,
        default: 'info@thaishipping.com',
        trim: true,
        lowercase: true,
      },
      phone: { type: String, default: '+66 00 000 0000', trim: true },
    },
    companyName: { type: String, default: 'Thai Shipping' },
    description: {
      type: String,
      default:
        'Connecting Thailand with global markets through reliable shipping, logistics and international trade solutions.',
    },
    copyrightText: {
      type: String,
      default: 'Copyright © 2009 ThaiShipping.com',
    },
    discoverLinks: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],
    informationLinks: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

footerSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({
      isActive: true,
      socialLinks: [
        { platform: 'facebook', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'linkedin', url: '#' },
        { platform: 'twitter', url: '#' },
      ],
      discoverLinks: [
        { label: 'Thai Imports', href: '/thai-imports', order: 1 },
        { label: 'Thai Exports', href: '/thai-exports', order: 2 },
        { label: 'Thai Food Shipping', href: '/thai-food-shipping', order: 3 },
        { label: 'Shipping Regulations', href: '/shipping-regulations', order: 4 },
        { label: 'Shipping Services', href: '/shipping-services', order: 5 },
      ],
      informationLinks: [
        { label: 'Contact Us', href: '/contact', order: 1 },
        { label: 'About Us', href: '/about', order: 2 },
        { label: 'Track Shipment', href: '/track-shipment', order: 3 },
      ],
    });
  }
  return settings;
};

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);