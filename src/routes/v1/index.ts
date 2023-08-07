import express from 'express'
import { Log } from 'debug-next'

const router = express.Router()
const { log } = Log()

/**
 * @swagger
 * /:
 *   get:
 *     summary: Homepage
 *     description: Homepage.
 */
router.get('/', (req, res, next) => {
    log('V1 Home page')
    res.send({
        success: true,
        data: 'Welcome to express boilerplate.',
    })
})

export default router
