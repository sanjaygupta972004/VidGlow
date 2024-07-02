import {Router} from 'express';

const router = Router();

import {healthCheck} from '../controllers/healthCheck.controller.js';

router.route('/').get(healthCheck);

export default router;