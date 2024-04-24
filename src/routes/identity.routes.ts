import express from 'express';
import { identify } from '../controllers/identity.controller';

const router = express.Router();

router.post('/', identify);

export default router;
