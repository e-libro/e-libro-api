import { jest } from "@jest/globals";
import userController from "../../src/controllers/userController.js";
import userService from "../../src/services/userService.js";
import userDTO from "../../src/dtos/userDTO.js";
import ApiError from "../../src/errors/ApiError.js";

describe("UserController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should create a new user and return success response", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "user",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const createdUserMock = {
        id: "1",
        fullname: "John Doe",
        email: "john@example.com",
        role: "user",
      };
      jest.spyOn(userService, "createUser").mockResolvedValue(createdUserMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(createdUserMock);

      await userController.createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User created successfully",
        data: createdUserMock,
        error: null,
      });
    });

    test("should call next with ApiError.Conflict if email is already in use", async () => {
      const req = {
        body: {
          fullname: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "user",
        },
      };
      const res = {};
      const next = jest.fn();

      jest
        .spyOn(userService, "createUser")
        .mockRejectedValue(new Error("The email address is already in use."));

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe(
        "The email address is already in use."
      );
    });
  });

  describe("getAllUsers", () => {
    test("should return a list of users with pagination", async () => {
      const req = {
        query: {
          page: "1",
          limit: "5",
          fullname: "John",
          email: "example.com",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const usersMock = [
        { id: "1", fullname: "John Doe", email: "john@example.com" },
        { id: "2", fullname: "Jane Doe", email: "jane@example.com" },
      ];
      const totalUsers = 10;

      jest.spyOn(userService, "getAllUsers").mockResolvedValue(usersMock);
      jest.spyOn(userService, "countUsers").mockResolvedValue(totalUsers);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockImplementation((user) => user);

      await userController.getAllUsers(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        {
          fullname: { $regex: /John/i },
          email: { $regex: /example.com/i },
        },
        { fullname: "asc" },
        0,
        5
      );
      expect(userService.countUsers).toHaveBeenCalledWith({
        fullname: { $regex: /John/i },
        email: { $regex: /example.com/i },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Users retrieved successfully",
        data: {
          totalDocuments: 10,
          totalPages: 2,
          page: 1,
          limit: 5,
          documents: usersMock,
        },
        error: null,
      });
    });

    test("should call next with ApiError.NotFound if no users are found", async () => {
      const req = { query: { page: "1", limit: "5" } };
      const res = {};
      const next = jest.fn();

      jest.spyOn(userService, "getAllUsers").mockResolvedValue([]);

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe("Not Found");
    });
  });

  describe("getUserById", () => {
    test("should return a user by ID", async () => {
      const req = { params: { id: "1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const userMock = {
        id: "1",
        fullname: "John Doe",
        email: "john@example.com",
      };
      jest.spyOn(userService, "getUserById").mockResolvedValue(userMock);
      jest.spyOn(userDTO, "mapUserToUserResponseDTO").mockReturnValue(userMock);

      await userController.getUserById(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User retrieved successfully",
        data: userMock,
        error: null,
      });
    });

    test("should call next with ApiError.NotFound if user is not found", async () => {
      const req = { params: { id: "1" } };
      const res = {};
      const next = jest.fn();

      jest
        .spyOn(userService, "getUserById")
        .mockRejectedValue(ApiError.NotFound("Not Found"));

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(next.mock.calls[0][0].message).toBe("Not Found");
    });
  });

  describe("updateUser", () => {
    test("should update a user and return success response", async () => {
      const req = { params: { id: "1" }, body: { fullname: "Updated Name" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const updatedUserMock = {
        id: "1",
        fullname: "Updated Name",
        email: "john@example.com",
      };
      jest.spyOn(userService, "updateUser").mockResolvedValue(updatedUserMock);

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith("1", {
        fullname: "Updated Name",
      });
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
    test("should delete a user and return success response", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const deletedUserMock = {
        id: "60e6f965b4d6c9e529c7f0b3",
        fullname: "John Doe",
        email: "john@example.com",
      };
      jest.spyOn(userService, "deleteUser").mockResolvedValue(deletedUserMock);
      jest
        .spyOn(userDTO, "mapUserToUserResponseDTO")
        .mockReturnValue(deletedUserMock);

      await userController.deleteUser(req, res, next);

      expect(userService.deleteUser).toHaveBeenCalledWith(
        "60e6f965b4d6c9e529c7f0b3"
      );
      expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledWith(
        deletedUserMock
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User deleted successfully",
        data: deletedUserMock,
        error: null,
      });
    });

    test("should call next with ApiError.NotFound if user is not found", async () => {
      const req = { params: { id: "60e6f965b4d6c9e529c7f0b3" } };
      const res = {};
      const next = jest.fn();

      jest.spyOn(userService, "deleteUser").mockResolvedValue(null);

      await userController.deleteUser(req, res, next);

      expect(userService.deleteUser).toHaveBeenCalledWith(
        "60e6f965b4d6c9e529c7f0b3"
      );
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not Found",
          code: 404,
        })
      );
    });

    test("should call next with ApiError.BadRequest if ID is missing", async () => {
      const req = { params: {} };
      const res = {};
      const next = jest.fn();

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User ID is required",
          code: 400,
        })
      );
    });
  });
});
