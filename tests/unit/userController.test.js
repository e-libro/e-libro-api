import { jest } from "@jest/globals";
import UserController from "../../src/controllers/UserController.js";
import { userService } from "../../src/services/index.js";
import { userDTO } from "../../src/dtos/index.js";
import ApiError from "../../src/errors/ApiError.js";
import mongoose from "mongoose";

let req, res, next;

beforeEach(() => {
  req = { body: {}, params: {}, query: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  next = jest.fn();
});

describe("UserController", () => {
  describe("createUser", () => {
    test("should create a new user and return 201", async () => {
      req.body = {
        fullname: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      };
      const userMock = {
        id: "1",
        fullname: "Test User",
        email: "test@example.com",
        role: "user",
      };
      const userResponseDTO = {
        id: "1",
        fullname: "Test User",
        email: "test@example.com",
        role: "user",
      };

      jest.spyOn(userService, "createUser").mockResolvedValue(userMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(userResponseDTO);

      await UserController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledWith(userMock);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User created successfully",
        data: userResponseDTO,
        error: null,
      });
    });

    test("should call next with an error if required fields are missing", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      await UserController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        ApiError.BadRequest("Fullname, email, and password are required")
      );
    });
  });

  describe("getAllUsers", () => {
    test("should return a list of users and metadata", async () => {
      req.query = { page: "1", limit: "5", fullname: "Test" };
      const usersMock = [
        {
          id: "1",
          fullname: "Test User",
          email: "test@example.com",
          role: "user",
        },
      ];
      const userResponseDTOs = [
        {
          id: "1",
          fullname: "Test User",
          email: "test@example.com",
          role: "user",
        },
      ];
      jest.spyOn(userService, "getAllUsers").mockResolvedValue(usersMock);
      jest.spyOn(userService, "countUsers").mockResolvedValue(1);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(userResponseDTOs[0]);

      await UserController.getAllUsers(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(userService.countUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Users retrieved successfully",
        data: {
          totalDocuments: 1,
          totalPages: 1,
          page: 1,
          limit: 5,
          documents: userResponseDTOs,
        },
        error: null,
      });
    });

    test("should call next with an error if no users are found", async () => {
      jest.spyOn(userService, "getAllUsers").mockResolvedValue([]);
      jest.spyOn(userService, "countUsers").mockResolvedValue(0);

      await UserController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(
        ApiError.NotFound("No users found with the provided filters")
      );
    });
  });

  describe("getUserById", () => {
    test("should return a user by ID", async () => {
      req.params.id = "60e6f965b4d6c9e529c7f0b3";
      const userMock = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "Test User",
        email: "test@example.com",
        role: "user",
      };
      const userResponseDTO = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "Test User",
        email: "test@example.com",
        role: "user",
      };

      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(userResponseDTO);

      await UserController.getUserById(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User retrieved successfully",
        data: userResponseDTO,
        error: null,
      });
    });

    test("should call next with an error if ID is invalid", async () => {
      req.params.id = "invalid-id";

      await UserController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        ApiError.BadRequest("Valid User ID is required")
      );
    });
  });

  describe("updateUser", () => {
    test("should update a user and return the updated document", async () => {
      req.params.id = "60e6f965b4d6c9e529c7f0b3";
      req.body = { fullname: "Updated User" };
      const updatedUserMock = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "Updated User",
        role: "user",
      };

      jest.spyOn(userService, "updateUser").mockResolvedValue(updatedUserMock);

      await UserController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith(
        req.params.id,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User updated successfully",
        data: updatedUserMock,
        error: null,
      });
    });
  });

  describe("deleteUser", () => {
    test("should delete a user and return the deleted document", async () => {
      req.params.id = "60e6f965b4d6c9e529c7f0b3";
      const deletedUserMock = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "Deleted User",
        role: "user",
      };
      const userResponseDTO = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "Deleted User",
        role: "user",
      };

      jest.spyOn(userService, "deleteUser").mockResolvedValue(deletedUserMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(userResponseDTO);

      await UserController.deleteUser(req, res, next);

      expect(userService.deleteUser).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User deleted successfully",
        data: userResponseDTO,
        error: null,
      });
    });
  });
});
