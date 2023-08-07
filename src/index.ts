// load .env before everything
import dotenv from 'dotenv'
dotenv.config()

// centralised logging interface
import { LogBase, Log } from 'debug-next'
LogBase.init('boilerplate', __dirname)

import express from 'express'
import cors from 'cors'
import config from './configs/common'
import http from 'http'
import magic from 'express-routemagic'
import morgan from 'morgan'
import errorNotFound from './apps/error-handlers/notfound'
import errorServer from './apps/error-handlers/server-error'
import compression from 'compression'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'
import swaggerOptions from './configs/swagger.options'
import Sentry from './apps/sentry'
import helmet from 'helmet'
// @ts-ignore
import toobusy from 'node-toobusy'
import rateLimit from 'express-rate-limit'

// instantiations
const app = express()
const port = process.env.PORT || 3000
const { log } = Log()

// uncommented when pg is set up
// const pgPool = new pg.Pool({
// Insert pool options here
// })

app.set('port', port) // set port

/* MIDDLEWARES */
app.use((req, res, next) => {
    if (toobusy()) return res.status(503).send("I'm busy right now, sorry.")
    next()
})
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler)
app.use(helmet())
app.use(cors()) // enable cors for cross-domain api requests.
app.use(rateLimit(config.rateLimit))
app.use(express.json()) // parses JSON when it sees it
app.use(express.urlencoded({ extended: true })) // parses urlencoded (with object-rich payloads) when it sees it
app.use(morgan('dev'))
app.use(compression())

// set up sessions and cookies
// app.use(
//     session({
//         // store: new pgSession({
//         //     pool: pgPool,
//         //     tableName: 'Session'
//         // }),
//         secret: process.env.SESSION_SECRET,
//         cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 * 6 /*6 months*/ },
//         resave: false,
//         saveUninitialized: true,
//     }),
// )

// expose headers for cors
// so that requestor can use information such as RateLimit
app.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', '*')
    next()
})

// See https://swagger.io/docs/specification/basic-structure/
const swaggerSpec = swaggerJSDoc(swaggerOptions(__dirname, port))
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
// routings
magic.use(app, { debug: log, ...config.routeMagic })

// error handling
app.use(errorNotFound)
app.use(
    Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            log('Sentry handling error.')

            // sentry handles only >=500 errors by default
            // See https://docs.sentry.io/platforms/node/guides/express/
            // for our development purposes, let's capture per .env
            if (process.env.NODE_ENV === 'development') {
                // capture any errors that doesn't have a status code
                if (!error.statusCode) return true

                // In development, capture per env variable settings
                const errorsToCapture = process.env.SENTRY_DEV_CAPTURE_ERRORS?.split(',').map(
                    (code: string) => parseInt(code),
                )

                if (errorsToCapture) return errorsToCapture.indexOf(error.statusCode as number) > -1
            }

            // Capturing errors with no statusCode or >= 500
            if (!error.statusCode) return true
            if (typeof error.statusCode === 'number' && error.statusCode >= 500) return true

            return false
        },
    }) as express.ErrorRequestHandler,
)
app.use(errorServer)

/* CREATE SERVER */
const server = http.createServer(app)
server.listen(port)
server.on('listening', () => {
    console.log(`Listening on port ${port}.`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
    Sentry.captureException(error)

    if (error.syscall !== 'listen') throw error

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${port} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(`${port} is already in use`)
            process.exit(1)
            break
        default:
            throw error
    }
})
