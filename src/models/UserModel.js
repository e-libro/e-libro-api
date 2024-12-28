import dotenv from "dotenv";
import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

import { userDTO } from "../dtos/index.js";

dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const UTF_KEY = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const IV = CryptoJS.enc.Base64.parse(SECRET_KEY);
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
      minlength: [4, "Fullname must be at least 4 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    salt: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true, collecion: "users" }
);

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    try {
      const salt = randomBytes(16).toString("hex");
      this.salt = salt;
      this.password = CryptoJS.SHA256(this.password + salt).toString();
    } catch (error) {
      return next(error);
    }
  }

  UserSchema.post("save", function (doc, next) {
    try {
      doc.email = CryptoJS.AES.decrypt(doc.email, UTF_KEY, { iv: IV }).toString(
        CryptoJS.enc.Utf8
      );
      doc.fullname = CryptoJS.AES.decrypt(doc.fullname, SECRET_KEY).toString(
        CryptoJS.enc.Utf8
      );
      doc.password = undefined;
      doc.salt = undefined;
      next();
    } catch (error) {
      console.error("Error in post-save middleware:", error);
      next(error);
    }
  });

  if (this.isNew || this.isModified("email")) {
    this.email = CryptoJS.AES.encrypt(this.email, UTF_KEY, {
      iv: IV,
    }).toString();
  }

  if (this.isNew || this.isModified("fullname")) {
    this.fullname = CryptoJS.AES.encrypt(this.fullname, SECRET_KEY).toString();
  }

  this.updatedAt = new Date();
  next();
});

UserSchema.pre("findOne", function async(next) {
  const query = this.getQuery();

  if (query.email) {
    const encryptedEmail = CryptoJS.AES.encrypt(query.email, UTF_KEY, {
      iv: IV,
    }).toString();

    this.setQuery({ ...query, email: encryptedEmail });
  }

  next();
});

UserSchema.post("findOne", function (doc) {
  if (doc) {
    doc.email = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(doc.email) },
      UTF_KEY,
      {
        iv: IV,
      }
    ).toString(CryptoJS.enc.Utf8);

    doc.fullname = CryptoJS.AES.decrypt(doc.fullname, SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }
});

UserSchema.post("find", function (docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      if (doc.email) {
        // Descifrar email
        doc.email = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Base64.parse(doc.email) },
          UTF_KEY,
          {
            iv: IV,
          }
        ).toString(CryptoJS.enc.Utf8);
      }

      if (doc.fullname) {
        // Descifrar fullname
        doc.fullname = CryptoJS.AES.decrypt(doc.fullname, SECRET_KEY).toString(
          CryptoJS.enc.Utf8
        );
      }
    });
  }
});

UserSchema.post("findById", function (doc) {
  if (doc) {
    doc.email = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(doc.email) },
      UTF_KEY,
      {
        iv: IV,
      }
    ).toString(CryptoJS.enc.Utf8);

    doc.fullname = CryptoJS.AES.decrypt(doc.fullname, SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }
});

UserSchema.pre("findOneAndDelete", function async(next) {
  const query = this.getQuery();

  if (query.email) {
    const encryptedEmail = CryptoJS.AES.encrypt(query.email, UTF_KEY, {
      iv: IV,
    }).toString();

    this.setQuery({ ...query, email: encryptedEmail });
  }

  next();
});

UserSchema.post("findByIdAndDelete", function (doc) {
  if (doc) {
    doc.email = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(doc.email) },
      UTF_KEY,
      {
        iv: IV,
      }
    ).toString(CryptoJS.enc.Utf8);

    doc.fullname = CryptoJS.AES.decrypt(doc.fullname, SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }
});

UserSchema.methods.emailExists = async function (email) {
  try {
    const result = await mongoose.model("User").findOne({ email });
    return !!result;
  } catch (error) {
    throw new Error("Error checking if email exists: " + error.message);
  }
};

UserSchema.methods.comparePassword = function (candidatePassword) {
  try {
    const hashedCandidatePassword = CryptoJS.SHA256(
      candidatePassword + this.salt
    ).toString();
    return this.password === hashedCandidatePassword;
  } catch (error) {
    throw new Error("Error comparing passwords: " + error.message);
  }
};

UserSchema.methods.createAccessToken = function () {
  try {
    const userResponseDTO = userDTO.mapUserToUserResponseDTO(this);

    const accessToken = jwt.sign(
      { user: userResponseDTO },
      ACCESS_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "15s", // TODO cambiar a valores recomendados para buena práctica
      }
    );

    const encryptedToken = CryptoJS.AES.encrypt(accessToken, UTF_KEY, {
      iv: IV,
    }).toString();

    return encryptedToken;
  } catch (error) {
    throw new Error("Error creating access token: " + error.message);
  }
};

UserSchema.methods.createRefreshToken = async function () {
  try {
    const userResponseDTO = userDTO.mapUserToUserResponseDTO(this);

    const refreshToken = jwt.sign(
      { user: userResponseDTO },
      REFRESH_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "7d", // TODO cambiar a valores recomendados para buena práctica
      }
    );

    const encryptedToken = CryptoJS.AES.encrypt(refreshToken, UTF_KEY, {
      iv: IV,
    }).toString();

    this.refreshToken = encryptedToken;
    await this.save();

    return encryptedToken;
  } catch (err) {
    // TODO logging
    throw new Error(`Token generation error: ${err}`);
  }
};

UserSchema.statics.verifyRefreshToken = async function (refreshToken) {
  try {
    // Buscar el documento del usuario con el refresh token
    const doc = await this.findOne({ refreshToken });

    if (!doc) {
      throw new Error("User not found or invalid token");
    }
    // Desencriptar el token
    const decryptedToken = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(doc.refreshToken) },
      UTF_KEY,
      {
        iv: IV,
      }
    ).toString(CryptoJS.enc.Utf8);

    if (!decryptedToken) {
      throw new Error("Failed to decrypt the token");
    }

    return jwt.verify(decryptedToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

UserSchema.statics.verifyAccessToken = async function (accessToken) {
  try {
    const decryptedToken = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(accessToken) },
      UTF_KEY,
      {
        iv: IV,
      }
    ).toString(CryptoJS.enc.Utf8);

    return jwt.verify(decryptedToken, ACCESS_TOKEN_SECRET);
  } catch (err) {
    // TODO - Implement logging
    throw new Error("Invalid or expired token");
  }
};

UserSchema.methods.deleteRefreshToken = async function () {
  try {
    this.refreshToken = undefined;
    return await this.save();
  } catch (err) {
    throw new Error(`Token deletion error: ${err}`);
  }
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
