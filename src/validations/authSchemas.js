import yup from "yup";

const signupSchema = yup.object().shape({
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

const signinSchema = yup.object().shape({
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

const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required("Current password is required")
    .min(8, "Current password must be at least 8 characters long"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export { signupSchema, signinSchema, changePasswordSchema };
