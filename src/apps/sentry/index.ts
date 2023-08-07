import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

const colorRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [
        new RewriteFrames({
            root: global.__dirname,
        }),
    ],
    normalizeDepth: 5,
    beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console')
            breadcrumb.message = breadcrumb.message?.replace(colorRegex, '').trim()
        return breadcrumb
    },
})

export default Sentry
export { Sentry }
