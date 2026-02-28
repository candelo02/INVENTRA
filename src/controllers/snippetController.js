import asyncHandler from '../middleware/asyncHandler.js';
import Snippet from '../models/Snippet.js';

// @desc    Create new snippet
// @route   POST /api/v1/snippets
// @access  Private
export const createSnippet = asyncHandler(async (req, res) => {
  const { title, language, code, tags } = req.body;

  const snippet = new Snippet({
    user: req.user._id, // Tomado de JWT vía protect middleware
    title,
    language,
    code,
    tags,
  });

  const createdSnippet = await snippet.save();
  res.status(201).json(createdSnippet);
});

// @desc    Get user snippets
// @route   GET /api/v1/snippets
// @access  Private
export const getSnippets = asyncHandler(async (req, res) => {
  // Regla de Oro: Solo devolver los creados por el usuario actual
  const snippets = await Snippet.find({ user: req.user._id });
  res.json(snippets);
});

// @desc    Update snippet
// @route   PUT /api/v1/snippets/:id
// @access  Private
export const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (snippet) {
    // El "Muro de Privacidad": Verificar que pertenezca al usuario
    if (snippet.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this snippet');
    }

    snippet.title = req.body.title || snippet.title;
    snippet.language = req.body.language || snippet.language;
    snippet.code = req.body.code || snippet.code;
    snippet.tags = req.body.tags || snippet.tags;

    const updatedSnippet = await snippet.save();
    res.json(updatedSnippet);
  } else {
    res.status(404);
    throw new Error('Snippet not found');
  }
});

// @desc    Delete snippet
// @route   DELETE /api/v1/snippets/:id
// @access  Private
export const deleteSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (snippet) {
    // El "Muro de Privacidad": Verificar que pertenezca al usuario
    if (snippet.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this snippet');
    }

    await snippet.deleteOne();
    res.json({ message: 'Snippet removed' });
  } else {
    res.status(404);
    throw new Error('Snippet not found');
  }
});
