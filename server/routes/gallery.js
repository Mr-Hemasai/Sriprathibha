const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Public gallery endpoints
router.get('/albums', galleryController.listAlbums);
router.get('/albums/:id', galleryController.getAlbum);
router.get('/photo/:fileId', galleryController.getPhoto);

module.exports = router;
