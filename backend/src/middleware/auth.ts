import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthenticatedRequest extends Request {
    user?: { id: number; username: string; role: string };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user as { id: number; username: string; role: string };
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export const authorizeRole = (role: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.sendStatus(403);
        }
    };
};
