import { validationResult } from "express-validator";

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        msg: err.msg,
        param: err.path,
      })),
    });
  }
  next();
};

export default validatorMiddleware;