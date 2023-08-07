import { Log } from 'debug-next'

const { log, logError } = Log()

interface IErrorObject {
    message: string
    timestamp: number
    timestamptz: string
    error?: object
}

const resFormatter = (err: any, customMessage?: string) => {
    // if err doesn't contain timestamp, set our own.
    let timestamp: number | undefined | null = err.timestamp
    var timestamptz: string
    if (!timestamp) {
        const now = new Date()
        timestamp = +now / 1000
        timestamptz = now.toISOString()
    } else {
        timestamptz = new Date(timestamp * 1000).toISOString()
    }

    const errorObject: IErrorObject = {
        message: '',
        timestamp,
        timestamptz,
    }
    if (process.env.NODE_ENV === 'development') {
        // use the original error message, and attach the full error object for debugging purposes.
        errorObject.message = err.message
        errorObject.error = err
    } else {
        // only attach message. if not defined, return with a generic message.
        errorObject.message = customMessage
            ? _formatMsgWithTS(customMessage, timestamp)
            : _formatMsgWithTS('Something went wrong.', timestamp)
    }

    return errorObject
}

// let's put timestamp inside of message for the time being.
const _formatMsgWithTS = (msg: string, ts: number) => {
    return `${msg} [Fault no.: ${ts}]`
}

export default resFormatter
export { resFormatter, IErrorObject }
