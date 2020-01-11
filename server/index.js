const keys = require('./keys')

// Express App Setup
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// Postgres Client Setup
const { Pool} = require('pg')

const pgClient = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  user: keys.pgUser,
  password: keys.pgPassword,
  database: keys.pgDatabase,
})
pgClient.on('error', () => console.log('Lost PG connection'))
pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch(err => console.log(err))

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
})
const pub = redisClient.duplicate()

// Express routes
app.get('/', (req, res) => {
  res.send('Hi there')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')
  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const { index } = req.body

  if (parseInt(index, 10) > 40) {
    res.status(422).send('Index too high')
  }

  redisClient.hset('values', index, 'Nothing yet!')
  pub.publish('insert', index)
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.send({ working: true })
})

app.listen(5000, () => {
  console.log('Server listening on port 5000')
})
