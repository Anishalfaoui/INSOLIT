import { Router } from 'express'
import { login, loginPartner, me, register, registerPartner, updateMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/register-partner', registerPartner)
router.post('/login', login)
router.post('/login-partner', loginPartner)
router.get('/me', requireAuth, me)
router.put('/me', requireAuth, updateMe)

export default router
