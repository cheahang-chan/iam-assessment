import { Request, Response, NextFunction } from 'express';
import { createSecurityGroupService } from '../services/security-group/security-group.factory';

export const fetchAndStoreSecurityGroups = async (req: Request, res: Response, next: NextFunction) => {
    const dryRun = req.query.dryRun === 'true';
    const service = await createSecurityGroupService();
    const groups = await service.syncSecurityGroups({ dryRun });
    res.status(200).json({
        status: true,
        message: 'Security groups synced',
        data: groups
    });
};
