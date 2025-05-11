import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}
import jwt from 'jsonwebtoken';


interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.session?.refreshToken;
    if (!token) {
        res.status(401).render('login', { error: "Unauthorized" });
        return;
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, async (err, decoded) => {
      if (err) {
        res.status(401).render('login', { error: "Unauthorized" });
        return;
      }
      req.user = decoded as DecodedToken; // Cast to DecodedToken interface
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};