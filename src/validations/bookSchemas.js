import * as yup from "yup";

export const getBookByIdSchema = yup.object().shape({
  id: yup
    .string()
    .required("Book ID is required")
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid Book ID format"),
});
