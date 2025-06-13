import express from 'express';
import { fetchAndStoreSecurityGroups } from '../controllers/security-group.controller';

const router = express.Router();

router.get('/sync', fetchAndStoreSecurityGroups);

export default router;
