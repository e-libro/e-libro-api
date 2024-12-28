import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";

class UserController {
  async createUser(req, res) {
    try {
      const { fullname, email, password } = req.body;

      if (!fullname || !email || !password)
        return res.status(400).json({
          errorMessage: "Fields are required!",
        });

      const createdUser = await userService.createUser({
        fullname,
        email,
        password,
      });

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(createdUser);

      return res.status(201).json({
        message: "User created successfully",
        user: userResponseDTO,
      });
    } catch (e) {
      console.log(e);
      if (e.message === "The email address is already in use.") {
        return res.status(409).json({
          errorMessage: e.message,
        });
      } else {
        return res.status(500).json({
          errorMessage: "Internal Server Error: Unable to create user",
        });
      }
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      if (!users || users.length === 0) {
        return res.status(204).json({ message: "No users exists." });
      }

      const userResponseDTOs = users.map(userDTO.mapUserToUserResponseDTO);

      return res.status(200).json({ users: userResponseDTOs });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        errorMessage: "Internal Server Error: Unable to retrieve users",
      });
    }
  }

  async getUserById(req, res) {
    const id = req?.params?.id;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    try {
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      const userResponseDTO = UserDTO.mapUserToUserResponseDTO(user);

      res.json({ user: userResponseDTO });
    } catch (e) {
      if (e.message === `User with ID ${id} not found`) {
        return res.status(404).json({ errorMessage: e.message });
      } else {
        return res.status(500).json({
          errorMessage: "Internal Server Error: Unable to retrieve users",
        });
      }
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedUser = await userService.updateUser(id, updates);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await userService.deleteUser(id);
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new UserController();
