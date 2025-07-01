import express from 'express';
import {
    syncSecurityGroups,
    getAllSecurityGroups,
    getSecurityGroupById,
    deleteAllSecurityGroups,
    deleteSecurityGroupById
} from '../controllers/security-group.controller';

const router = express.Router();

router.post('/sync', syncSecurityGroups);

router.get('/', getAllSecurityGroups);
router.get('/:id', getSecurityGroupById);
router.delete('/', deleteAllSecurityGroups);
router.delete('/:id', deleteSecurityGroupById);

export default router;
