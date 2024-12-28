import yup from "yup";

const createUserSchema = yup.object().shape({
  fullname: yup
    .string()
    .required("Fullname is required")
    .min(3, "Fullname must be at least 3 characters long"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email must have a valid domain (e.g., example.com)"
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/\d/, "Password must contain a number")
    .matches(/[@$!%*?&#]/, "Password must contain a special character"),
});

const updateUserSchema = yup.object().shape({
  fullname: yup
    .string()
    .required("Fullname is required")
    .min(3, "Fullname must be at least 3 characters long"),
});

export { createUserSchema, updateUserSchema };
