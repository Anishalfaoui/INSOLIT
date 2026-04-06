import jwt from 'jsonwebtoken'

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me'
}

export function requirePartnerAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentification partenaire requise' })
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    if (payload.role !== 'merchant' && payload.role !== 'partner') {
      return res.status(401).json({ error: 'Token marchand invalide' })
    }

    req.merchant = { id: payload.sub, email: payload.email }
    req.partner = req.merchant
    return next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expire' })
  }
}
