import jwt from "jsonwebtoken";

export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
