import { Router } from 'express'
import {
  createPromo,
  deletePromo,
  getMyPromos,
  updatePromo,
} from '../controllers/partnerPromosController.js'
import { requirePartnerAuth } from '../middleware/partnerAuth.js'

const router = Router()

router.use(requirePartnerAuth)
router.get('/promos', getMyPromos)
router.post('/promos', createPromo)
router.put('/promos/:id', updatePromo)
router.delete('/promos/:id', deletePromo)

export default router
