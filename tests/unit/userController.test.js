import { jest } from "@jest/globals";
import userController from "../../src/controllers/userController.js";
import { userService } from "../../src/services/index.js";
import { userDTO } from "../../src/dtos/index.js";

describe("userController", () => {
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

    await userController.createUser(req, res);

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

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Fields are required!",
    });
  });

  test("should return 200 with paginated users and metadata", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        fullname: "John",
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const filters = {
      fullname: { $regex: /John/i },
      email: { $regex: /john@example.com/i },
    };

    const users = [
      { id: "1", fullname: "John Doe", email: "john@example.com" },
      { id: "2", fullname: "Johnny Smith", email: "johnny@example.com" },
    ];
    const total = 10;

    const userResponseDTOs = users.map((user) => ({
      id: user.id,
      name: user.fullname,
      email: user.email,
    }));

    jest.spyOn(userService, "getAllUsers").mockResolvedValue(users);
    jest.spyOn(userService, "countUsers").mockResolvedValue(total);
    jest
      .spyOn(userDTO, "mapUserToUserResponseDTO")
      .mockImplementation((user) => ({
        id: user.id,
        name: user.fullname,
        email: user.email,
      }));

    await userController.getAllUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      filters,
      { fullname: "asc" },
      0,
      5
    );
    expect(userService.countUsers).toHaveBeenCalledWith(filters);
    expect(userDTO.mapUserToUserResponseDTO).toHaveBeenCalledTimes(
      users.length
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalUsers: total,
      totalPages: 2,
      page: 1,
      limit: 5,
      users: userResponseDTOs,
    });
  });

  test("should return 204 if no users are found", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        fullname: "Unknown",
        email: "unknown@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };

    const filters = {
      fullname: { $regex: /Unknown/i },
      email: { $regex: /unknown@example.com/i },
    };

    jest.spyOn(userService, "getAllUsers").mockResolvedValue([]);
    jest.spyOn(userService, "countUsers").mockResolvedValue(0);

    await userController.getAllUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      filters,
      { fullname: "asc" },
      0,
      5
    );
    expect(userService.countUsers).toHaveBeenCalledWith(filters);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("should return 500 on service error", async () => {
    const req = {
      query: {
        page: "1",
        limit: "5",
        fullname: "John",
        email: "john@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest
      .spyOn(userService, "getAllUsers")
      .mockRejectedValue(new Error("Service error"));

    await userController.getAllUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: "Internal Server Error",
    });
  });

  test("getUserById - should return 404 if user is not found", async () => {
    const req = { params: { id: "123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(userService, "getUserById").mockResolvedValue(null);

    await userController.getUserById(req, res);

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

    await userController.updateUser(req, res);

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

    await userController.deleteUser(req, res);

    expect(userService.deleteUser).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedUser);
  });
});
