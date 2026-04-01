import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'
import {
  createCategory,
  createMerchant,
  createPromo,
  deleteCategory,
  deleteMerchant,
  deletePromo,
  deleteUser,
  getAdminPromos,
  getMerchants,
  getRedemptions,
  getStats,
  getUsers,
  toggleAdmin,
  updateCategory,
  updateMerchant,
  updatePromo,
} from '../controllers/adminController.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.patch('/users/:id/admin', toggleAdmin)
router.delete('/users/:id', deleteUser)

router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/merchants', getMerchants)
router.post('/merchants', createMerchant)
router.put('/merchants/:id', updateMerchant)
router.delete('/merchants/:id', deleteMerchant)

router.get('/promos', getAdminPromos)
router.post('/promos', createPromo)
router.put('/promos/:id', updatePromo)
router.delete('/promos/:id', deletePromo)

router.get('/redemptions', getRedemptions)

export default router
