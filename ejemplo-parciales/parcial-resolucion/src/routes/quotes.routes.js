import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { getRandomQuote, getQuoteServiceError, getFavorites, addFavorite, deleteFavorite } from '../services/quoteService.js';

const router = express.Router();

router.get('/random', authMiddleware, async (req, res) => {
  try {
    const quoteData = await getRandomQuote();
    res.json(quoteData);
  } catch (error) {
    if (error.message === 'Service unavailable') {
      return res.status(503).json({ message: 'External service unavailable' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/favorites', authMiddleware, async (req, res) => {
  const { quote, author } = req.body;
  const userId = req.user.username;

  if (!quote || !author) {
    return res.status(400).json({ message: 'Quote and author are required' });
  }

  try {
    const newFavorite = await addFavorite(userId, quote, author);
    res.status(201).json({ message: 'Favorite added', favorite: newFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/favorites', authMiddleware, async (req, res) => {
  const userId = req.user.username;
  
  try {
    const userFavorites = await getFavorites(userId);
    res.json({ favorites: userFavorites });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/favorites/:id', authMiddleware, async (req, res) => {
  const userId = req.user.username;
  const favoriteId = parseInt(req.params.id, 10);

  try {
    const result = await deleteFavorite(userId, favoriteId);
    
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    res.json({ message: 'Favorite deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;