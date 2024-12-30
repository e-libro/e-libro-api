import { userService } from "../services/index.js";
import { userDTO } from "../dtos/index.js";

class AuthController {
  async signup(req, res) {
    try {
      const { fullname, email, password } = req.body;

      if (!fullname || !email || !password)
        return res.status(400).json({
          errorMessage: "Fields are required",
        });

      const emailExists = await userService.userExists(email);

      if (emailExists) {
        return res.status(409).json({
          errorMessage: "The email address is already in use.",
        });
      }

      const createdUser = await userService.createUser({
        fullname,
        email,
        password,
      });

      const userResponseDTO = userDTO.mapUserToUserResponseDTO(createdUser);

      return res.status(201).json({
        message: "Signup successful",
        user: userResponseDTO,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        errorMessage: "Internal Server Error: Signup failed",
      });
    }
  }

  async signin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Invalid email or password ",
      });
    }

    try {
      const user = await userService.getUserByEmail(email);

      if (user) {
        const match = user.comparePassword(password);

        if (match) {
          const accessToken = user.createAccessToken();
          const refreshToken = await user.createRefreshToken();

          res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "Strict",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
          });

          return res.status(200).json({
            message: "Signin successful",
            accessToken,
          });
        } else {
          console.log("Invalid email or password");
          return res.status(401).json({
            errorMessage: "Invalid email or password",
          });
        }
      } else {
        console.log("Invalid email or password");
        return res.status(401).json({
          errorMessage: "Invalid email or password",
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ errorMessage: "Internal Server Error: Signin failed" });
    }
  }

  async refresh(req, res) {
    let refreshToken;

    if (req.cookies && req?.cookies?.jwt) {
      refreshToken = req.cookies.jwt;
    }

    if (refreshToken) {
      try {
        const verifiedToken =
          await userService.verifyRefreshToken(refreshToken);

        if (!verifiedToken) {
          return res.status(401).json({ errorMessage: "Unauthorized" });
        }

        const foundUser = await userService.getUserById(verifiedToken.user.id);

        if (!foundUser) {
          return res.status(401).json({ errorMessage: "Unauthorized" });
        }

        const newAccessToken = foundUser.createAccessToken();
        const newRefreshToken = await foundUser.createRefreshToken();

        // TODO set secure: true on production
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        console.log(newAccessToken);
        return res.status(200).json({
          statusCode: 200,
          message: "refresh successful",
          accessToken: newAccessToken,
        });
      } catch (err) {
        console.log(err);
        return res.status(401).json({ errorMessage: "Unauthorized" });
      }
    }

    return res.status(401).json({ errorMessage: "Unauthorized" });
  }

  async signout(req, res) {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(404).json({ errorMessage: "Not Found" });
    }

    const verifiedToken = await userService.verifyRefreshToken(cookies.jwt);
    console.log(verifiedToken);

    if (!verifiedToken) {
      return res.status(404).json({ errorMessage: "Not Found" });
    }

    const foundUser = await userService.getUserById(verifiedToken.user.id);

    if (!foundUser) {
      return res.status(404).json({ errorMessage: "Not Found" });
    }

    await foundUser.deleteRefreshToken();

    // res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: true });
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "Strict", // "strict",
      secure: true,
    });

    return res.status(204).json({ message: "Signout successful" });
  }

  async getAuthenticatedUser(req, res) {
    try {
      const authenticatedUser = userDTO.mapUserToUserResponseDTO(req.user);

      if (!authenticatedUser) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
      }

      return res.status(200).json({
        message: "Authenticated user retrieved successfully",
        user: authenticatedUser,
      });
    } catch (error) {
      console.error(
        `Error in AuthController.getAuthenticatedUser: ${error.message}`
      );
      return res.status(500).json({
        errorMessage: "Internal Server Error",
      });
    }
  }
}

export default new AuthController();
