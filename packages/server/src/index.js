require('dotenv').config()
const express = require('express')
const { postgraphile } = require('postgraphile')

const Keycloak = require('./lib/keycloak-verify')
const cors = require('cors')
const ConnectionFilterPlugin = require('postgraphile-plugin-connection-filter')

const app = express()

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? 'https://1sc-project.moun3im.com'
      : 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('web'))
  app.get('*', (req, res, next) => {
    console.log(req.url)
    if (req.url === '/graphiql' || req.url === '/graphql') return next()
    res.sendFile('index.html', { root: 'web' })
  })
}

const config = {
  realm: process.env.KEYCLOAK_REALME,
  authServerUrl: process.env.KEYCLOAK_URL
}
const keycloak = Keycloak(config)

const DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`

const canSplit = (str, token) => {
  return (str || '').split(token).length > 1
}
console.log('this is the token ', process.env.POSTGRES_DB)
app.use(
  postgraphile(DATABASE_URL, 'app', {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    allowExplain: (req) => {
      return true
    },
    appendPlugins: [ConnectionFilterPlugin],
    pgSettings: async (req) => {
      const authorization = req.headers.authorization
      const bearerStr = 'Bearer'
      if (canSplit(authorization, bearerStr)) {
        const token = authorization.split(bearerStr)
        if (token.length > 1) {
          try {
            const user = await keycloak.verifyOnline(token[1])
            const role = user.resourceAccess.web.roles[0]
            const id = user.id.split(':')[2]

            return {
              'jwt.claims.user_id': id,
              'jwt.claims.role': role,
            }
          } catch (e) {}
        }
      }

      return {
        role: 'medecin'
      }
    }
  })
)

app.listen(process.env.PORT || 4000)
