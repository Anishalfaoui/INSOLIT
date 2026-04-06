import { Router } from 'express'
import { loginPartner, mePartner, registerPartner } from '../controllers/partnerController.js'
import { requirePartnerAuth } from '../middleware/partnerAuth.js'

const router = Router()

router.post('/register', registerPartner)
router.post('/login', loginPartner)
router.get('/me', requirePartnerAuth, mePartner)

export default router
