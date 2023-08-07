import { join, relative } from 'path'
import { Log } from 'debug-next'

const { log } = Log(__filename)

const options = (baseDir: string, port: number | string) => {
    const fileExtension = _getFileExtension(__filename)

    const appBasePath = join(baseDir, '../')
    const routesPath = join(relative(appBasePath, baseDir), 'routes')
    const apisPathWildcard = join(routesPath, '**', `*.${fileExtension}`)
    log(apisPathWildcard)

    return {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Express API for JSONPlaceholder',
                version: '1.0.0',
                description:
                    'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
                license: {
                    name: 'Licensed Under MIT',
                    url: 'https://spdx.org/licenses/MIT.html',
                },
                contact: {
                    name: 'JSONPlaceholder',
                    url: 'https://jsonplaceholder.typicode.com',
                },
            },
            servers: [
                {
                    url: `http://localhost:${port}`,
                    description: 'Development server',
                },
            ],
        },
        apis: [apisPathWildcard],
    }
}

const _getFileExtension = (path: string) => {
    const arr = path.split('.')
    const fileExtension = arr[arr.length - 1]
    if (['js', 'ts'].indexOf(fileExtension) === -1)
        throw Error('File extension must be only `js` or `ts`.')
    return arr[arr.length - 1]
}

export default options
