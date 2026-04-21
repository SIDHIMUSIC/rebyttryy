import jwt from "jsonwebtoken";

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(req) {
  try {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : header;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireRole(req, role) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== role) return null;
  return decoded;
}
