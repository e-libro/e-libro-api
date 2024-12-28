import { jest } from "@jest/globals";
import UserController from "../../src/controllers/userController.js";
import { userService } from "../../src/services/index.js";
import { userDTO } from "../../src/dtos/index.js";

describe("UserController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createUser - should return 201 if user is created successfully", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "john@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const createdUser = {
      id: "123",
      fullname: "John Doe",
      email: "john@example.com",
    };

    const userResponseDTO = {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
    };

    jest.spyOn(userService, "createUser").mockResolvedValue(createdUser);
    jest
      .spyOn(userDTO, "mapUserToUserResponseDTO")
      .mockReturnValue(userResponseDTO);

    await UserController.createUser(req, res);

    expect(userService.createUser).toHaveBeenCalledWith(req.body);
    expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledWith(createdUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: userResponseDTO,
    });
  });

  test("createUser - should return 400 if required fields are missing", async () => {
    const req = {
      body: { fullname: "", email: "", password: "" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await UserController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Fields are required!",
    });
  });

  test("getAllUsers - should return 200 with users if they exist", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const users = [
      { id: "1", fullname: "John Doe", email: "john@example.com" },
      { id: "2", fullname: "Jane Doe", email: "jane@example.com" },
    ];
    const userResponseDTOs = users.map((user) => ({
      id: user.id,
      name: user.fullname,
      email: user.email,
    }));

    jest.spyOn(userService, "getAllUsers").mockResolvedValue(users);
    jest
      .spyOn(userDTO, "mapUserToUserResponseDTO")
      .mockImplementation((user) => ({
        id: user.id,
        name: user.fullname,
        email: user.email,
      }));

    await UserController.getAllUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users: userResponseDTOs });
  });

  test("getUserById - should return 404 if user is not found", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(userService, "getUserById").mockResolvedValue(null);

    await UserController.getUserById(req, res);

    expect(userService.getUserById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ errorMessage: "User not found" });
  });

  test("updateUser - should update and return the updated user", async () => {
    const req = { params: { id: "123" }, body: { fullname: "Updated Name" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const updatedUser = {
      id: "123",
      fullname: "Updated Name",
      email: "john@example.com",
    };

    jest.spyOn(userService, "updateUser").mockResolvedValue(updatedUser);

    await UserController.updateUser(req, res);

    expect(userService.updateUser).toHaveBeenCalledWith("123", {
      fullname: "Updated Name",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });

  test("deleteUser - should delete user and return 200", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const deletedUser = {
      id: "123",
      fullname: "John Doe",
      email: "john@example.com",
    };

    jest.spyOn(userService, "deleteUser").mockResolvedValue(deletedUser);

    await UserController.deleteUser(req, res);

    expect(userService.deleteUser).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedUser);
  });
});
