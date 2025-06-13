import { Request, Response, NextFunction } from 'express';

export const fetchAndStoreSecurityGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(200).json({ message: 'Security groups synced' });
};
