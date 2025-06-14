import { Request, Response, NextFunction } from 'express';
import { fetchSecurityGroupsBySdk } from '../services/security-group.service';

export const fetchAndStoreSecurityGroups = async (req: Request, res: Response, next: NextFunction) => {
    const groups = await fetchSecurityGroupsBySdk();
    res.status(200).json({ message: 'Security groups synced', count: groups.length, data: groups });
};
