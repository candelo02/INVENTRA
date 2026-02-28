import express from 'express';
import {
    createSnippet,
    deleteSnippet,
    getSnippets,
    updateSnippet,
} from '../controllers/snippetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateSnippet } from '../validators/snippetValidator.js';

const router = express.Router();

router.route('/')
  .post(protect, validateSnippet, createSnippet)
  .get(protect, getSnippets);

router.route('/:id')
  .put(protect, validateSnippet, updateSnippet)
  .delete(protect, deleteSnippet);

export default router;
