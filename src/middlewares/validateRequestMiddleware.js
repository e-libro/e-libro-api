import * as yup from "yup";
import ApiError from "../errors/ApiError.js";

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
      next(ApiError.BadRequest(error.errors));
    }
  };
};
