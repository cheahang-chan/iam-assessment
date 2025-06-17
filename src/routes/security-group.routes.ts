import express from 'express';
import { fetchAndStoreSecurityGroups } from '../controllers/security-group.controller';

const router = express.Router();

router.post('/sync', fetchAndStoreSecurityGroups);

export default router;
