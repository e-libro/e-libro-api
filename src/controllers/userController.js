import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";

class UserController {
  async createUser(req, res) {
    try {
      const { fullname, email, password, role } = req.body;

      if (!fullname || !email || !password)
        return res.status(400).json({
          errorMessage: "Fields are required!",
        });

      const createdUser = await userService.createUser({
        fullname,
        email,
        password,
        role,
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
      const page = Math.max(0, parseInt(req.query.page)) - 1 || 0;
      const limit = parseInt(req.query.limit) || 5;
      const fullname = req.query.fullname || "";
      const email = req.query.email || "";

      const filters = {};

      if (fullname) {
        filters.fullname = { $regex: new RegExp(fullname, "i") };
      }

      if (email) {
        filters.email = { $regex: new RegExp(email, "i") };
      }

      const sortBy = { fullname: "asc" };
      console.log(filters);
      const users = await userService.getAllUsers(filters, sortBy, page, limit);
      const total = await userService.countUsers(filters);

      if (!users || users.length === 0) {
        return res.sendStatus(204);
      }

      const userResponseDTOs = users.map((user) =>
        userDTO.mapUserToUserResponseDTO(user)
      );

      const response = {
        totalUsers: total,
        totalPages: Math.ceil(total / limit),
        page: page + 1,
        limit,
        users: userResponseDTOs,
      };
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getAllUsers:", error.message);
      return res.status(500).json({
        errorMessage: "Internal Server Error",
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

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(user);

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
