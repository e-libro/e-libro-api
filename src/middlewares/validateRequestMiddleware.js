import * as yup from "yup";

export const RequestSourceEnum = Object.freeze({
  BODY: "body",
  PARAMS: "params",
  QUERY: "query",
});

export const validateRequest = (schema, source = RequestSourceEnum.BODY) => {
  const validSources = Object.values(RequestSourceEnum);

  if (!validSources.includes(source)) {
    throw new Error(
      `Invalid source: ${source}. Must be one of ${validSources.join(", ")}`
    );
  }

  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      await schema.validate(dataToValidate, { abortEarly: false }); // Validación estricta
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        errors: error.errors,
      });
    }
  };
};
