import { check, validationResult } from 'express-validator';

const validateSnippet = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  check('language').notEmpty().withMessage('Language is required'),
  check('code').notEmpty().withMessage('Code is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { validateSnippet };
