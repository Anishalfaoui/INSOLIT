import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favoritesController.js'

const router = Router()

router.get('/', requireAuth, getFavorites)
router.post('/', requireAuth, addFavorite)
router.get('/:promoId', requireAuth, checkFavorite)
router.delete('/:promoId', requireAuth, removeFavorite)

export default router
