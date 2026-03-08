import { Router, Request, Response } from 'express';
import stateMachine from '../services/stateMachine';

const router = Router();

router.get('/state/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const state = await stateMachine.getState(userId);
    res.json({ userId, state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
