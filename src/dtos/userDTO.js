class UserDTO {
  static UserResponseDTO = class {
    constructor(user) {
      this.id = user.id;
      this.fullname = user.fullname;
      this.email = user.email;
      this.role = user.role;
      this.createdAt = user.createdAt;
    }
  };

  mapUserToUserResponseDTO(user) {
    if (!user) {
      throw new Error("User entity is required");
    }

    return new UserDTO.UserResponseDTO({
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
}

export default new UserDTO();
