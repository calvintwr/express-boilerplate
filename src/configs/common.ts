import { join } from 'path'
const config = Object.freeze({
    rateLimit: Object.freeze({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    }),
    routeMagic: Object.freeze({
        invokerPath: join(__dirname, '../'),
        logMapping: process.env.NODE_ENV === 'production' ? false : true,
        ignoreSuffix: 'bak',
    }),
})
export default config
