import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getPermissions,
  shareDocument,
  removeUserAccess,
  getUserDetails
} from '../controllers/documentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Document routes
router.get('/', getAllDocuments);
router.post('/', createDocument);

// Routes for a specific document
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

// Sharing routes
router.get('/:id/permissions', getPermissions);
router.post('/:id/share', shareDocument);
router.post('/:id/remove_access', removeUserAccess); // Changed to post to have a body
router.post('/users/details', getUserDetails); // New route for getting user details

export default router;