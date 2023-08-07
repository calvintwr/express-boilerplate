import { NextFunction, Request, Response } from 'express'
import { Log } from 'debug-next'
import resFormatter from './util/resFormatter'

const { log, logError } = Log(__filename)

const errorServer = function (err: any, req: Request, res: Response, next: NextFunction) {
    log('Handling server errors.')

    // set timestamp
    const now = new Date()
    const timestamp = Math.round(+now / 1000)

    try {
        err.timestamp = timestamp
    } catch (err) {
        logError('Unable to set timestamp property for ', err)
    }

    // if statusCode has not been previously changed, sync it up with statusCode if exist.
    // else, set everything to generic 500
    if (res.statusCode >= 200 && res.statusCode <= 299) {
        res.statusCode = err.statusCode = err.statusCode ? err.statusCode : 500
    }

    res.locals = resFormatter(err)

    res.send({
        success: false,
        ...res.locals,
    })

    if (res.statusCode === 404) return

    logError(err.timestamp)
    logError(err)
}
export default errorServer
export { errorServer }
