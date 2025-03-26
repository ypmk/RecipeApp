import { Router, Request, Response } from 'express';
import { authenticateJWT, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, authorizeRole('admin'), (req: Request, res: Response) => {
    res.json({ message: 'Добро пожаловать, администратор!' });
    return
});

export default router;
