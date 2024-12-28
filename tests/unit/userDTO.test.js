import { jest } from "@jest/globals";
import bookDTO from "../../src/dtos/bookDTO.js";
import userDTO from "../../src/dtos/userDTO.js";

describe("UserDTO", () => {
  test("mapUserToUserResponseDTO - should map user entity to UserResponseDTO correctly", () => {
    const user = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: "2023-01-01T00:00:00Z",
    };

    const result = userDTO.mapUserToUserResponseDTO(user);

    expect(result).toEqual({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: "2023-01-01T00:00:00Z",
    });
  });

  test("mapUserToUserResponseDTO - should throw error if user entity is missing", () => {
    expect(() => userDTO.mapUserToUserResponseDTO(null)).toThrow(
      "User entity is required"
    );
  });
});
