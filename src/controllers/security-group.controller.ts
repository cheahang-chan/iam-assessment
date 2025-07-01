import { Request, Response } from 'express';
import { createSecurityGroupService } from '../services/security-group/security-group.factory';
import { success } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const syncSecurityGroups = async (req: Request, res: Response) => {
    const dryRun = req.query.dryRun === 'true';
    const service = await createSecurityGroupService();
    const groups = await service.syncSecurityGroups({ dryRun });

    return success(res, 'Security Groups Synced', groups);
};

/**
 * GET /security-groups
 * Fetch all security groups
 * 
 * Future Improvements: Include paginated requests if data grows large.
 */
export const getAllSecurityGroups = async (req: Request, res: Response) => {
    const service = await createSecurityGroupService();
    const groups = await service.getAllSecurityGroups();

    return success(res, "Fetched All Security Groups", groups);
};

/**
 * GET /security-groups/:id
 * Fetch a security group by MongoDB _id
 */
export const getSecurityGroupById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new BadRequestError("Group ID is required");

    const service = await createSecurityGroupService();
    const group = await service.getSecurityGroupById(id);
    if (!group) throw new NotFoundError("Security Group cannot be found");

    return success(res, "Fetched Security Group", group);
};

/**
 * DELETE /security-groups
 * Delete all security groups
 */
export const deleteAllSecurityGroups = async (req: Request, res: Response) => {
    const service = await createSecurityGroupService();
    const result = await service.deleteAllSecurityGroups();

    return success(res, "Deleted All Security Groups", result);
};

/**
 * DELETE /security-groups/:id
 * Delete a security group by MongoDB _id
 */
export const deleteSecurityGroupById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new BadRequestError("Group ID is required");

    const service = await createSecurityGroupService();
    const deleted = await service.deleteSecurityGroupById(id);
    if (!deleted) throw new NotFoundError("Security Group cannot be found");

    return success(res, "Deleted Security Groups", deleted);
};
