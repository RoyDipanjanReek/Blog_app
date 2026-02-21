import { validationResult, body, query } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const error = validationResult(req);

    if (error.isEmpty) {
      return next();
    }

    const extractedError = error.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new Error("Validation Error");
  };
};

export const registerValidator = [
  body("email")
    .isEmail()
    .withMessage("Invalid Email"),
  body("name")
    .isLength({min: 3})
    .withMessage("Name should be at least 3 charecter long."),
   body("password") 
    .isLength({ min: 6 })
    .withMessage("Password should be atleast 6 charecter long"),
];


export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password should be atleast 6 charecter long"),
];