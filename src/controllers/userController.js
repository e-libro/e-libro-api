import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";
import ApiError from "../errors/ApiError.js";
import mongoose from "mongoose";

class UserController {
  async createUser(req, res, next) {
    try {
      const { fullname, email, password, role } = req.body;

      if (!fullname || !email || !password) {
        throw ApiError.BadRequest("Fullname, email, and password are required");
      }

      const createdUser = await userService.createUser({
        fullname,
        email,
        password,
        role,
      });

      const foundUser = await userService.getUserById(createdUser._id);

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(foundUser);

      return res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: userResponseDTO,
        error: null,
      });
    } catch (error) {
      if (error.message === "The email address is already in use.") {
        next(ApiError.Conflict(error.message));
      } else {
        next(error);
      }
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const page = Math.max(0, parseInt(req.query.page) - 1 || 0);
      const limit = parseInt(req.query.limit) || 5;
      const fullname = req.query.fullname || "";
      const email = req.query.email || "";
      const role = req.query.role || "";

      const filters = {};

      if (fullname) {
        filters.fullname = { $regex: new RegExp(fullname, "i") };
      }

      if (email) {
        filters.email = { $regex: new RegExp(email, "i") };
      }

      if (role) {
        filters.role = role;
      }

      const sortBy = { fullname: "asc" };

      const users = await userService.getAllUsers(filters, sortBy, page, limit);
      const total = await userService.countUsers(filters);

      if (!users || users.length === 0) {
        throw ApiError.NotFound("No users found with the provided filters");
      }

      const userResponseDTOs = users.map((user) =>
        userDTO.mapUserToUserResponseDTO(user)
      );

      return res.status(200).json({
        status: "success",
        message: "Users retrieved successfully",
        data: {
          totalDocuments: total,
          totalPages: Math.ceil(total / limit),
          page: page + 1,
          limit,
          documents: userResponseDTOs,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.isValidObjectId(id)) {
        throw ApiError.BadRequest("Valid User ID is required");
      }

      const user = await userService.getUserById(id);

      if (!user) {
        throw ApiError.NotFound(`User with ID ${id} not found`);
      }

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(user);

      return res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        data: userResponseDTO,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id || !mongoose.isValidObjectId(id)) {
        throw ApiError.BadRequest("User ID is required");
      }

      if (
        !updates ||
        typeof updates !== "object" ||
        Object.keys(updates).length === 0
      ) {
        throw ApiError.BadRequest("Updates must be a non-empty object");
      }

      const updatedUser = await userService.updateUser(id, updates);

      if (!updatedUser) {
        throw ApiError.NotFound(`User with ID ${id} not found`);
      }

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(updatedUser);

      return res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: userResponseDTO,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.isValidObjectId(id)) {
        throw ApiError.BadRequest("Valid User ID is required");
      }

      const deletedUser = await userService.deleteUser(id);

      if (!deletedUser) {
        throw ApiError.NotFound(`User with ID ${id} not found`);
      }

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(deletedUser);

      return res.status(200).json({
        status: "success",
        message: "User deleted successfully",
        data: userResponseDTO,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
