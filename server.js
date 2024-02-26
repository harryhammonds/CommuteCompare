import express, { json } from 'express'
import cors from 'cors'

const whitelist = ['https://commutecompare.net']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

const app = express()
const port = 3001

import dotenv from 'dotenv'
dotenv.config()

app.use(json())

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

import axios from 'axios'

app.get('/suggest', cors(corsOptions), async (req, res) => {
  const { value, randomUUID } = req.query
  try {
    const response = await axios.get(
      `https://api.mapbox.com/search/searchbox/v1/suggest?q=${value}&access_token=${process.env.MAPBOX_PUBLIC}&session_token=${randomUUID}&limit=4`
    )
    res.json(response.data)
  } catch (error) {
    res.status(500).send(error.toString())
    console.log(error)
  }
})

app.get('/retrieve', cors(corsOptions), async (req, res) => {
  const { mapboxId, randomUUID } = req.query
  try {
    const response = await axios.get(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${process.env.MAPBOX_PUBLIC}&session_token=${randomUUID}`
    )
    res.json(response.data)
  } catch (error) {
    res.status(500).send(error.toString())
    console.error(error)
  }
})

app.get('/matrix/:type/:coordinates/', cors(corsOptions), async (req, res) => {
  const { coordinates, type } = req.params
  if (type === 'driving-traffic') {
    const { depart_at } = req.query
    try {
      let url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${type}/${coordinates}?depart_at=${depart_at}&access_token=${process.env.MAPBOX_PUBLIC}`
      const response = await axios.get(url)
      res.json(response.data)
    } catch (error) {
      res.status(500).send(error.toString())
      console.error(error)
    }
  } else {
    try {
      let url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${type}/${coordinates}?access_token=${process.env.MAPBOX_PUBLIC}`
      const response = await axios.get(url)
      res.json(response.data)
    } catch (error) {
      res.status(500).send(error.toString())
      console.error(error)
    }
  }
})

import redis from 'redis'
import csv from 'csv-parser'
import fs from 'fs'

// create a Redis client
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
})

client.on('error', (error) => {
  console.log('Redis error: ', error)
})

client.on('connect', () => {
  console.log('Connected to Redis')
})

async function createIndex(client) {
  try {
    await client.sendCommand([
      'FT.CREATE',
      'idx:vehicle',
      'ON',
      'HASH',
      'PREFIX',
      '1',
      'vehicle:',
      'SCHEMA',
      'name',
      'TEXT',
      'SORTABLE',
      'make',
      'TEXT',
      'SORTABLE',
      'model',
      'TEXT',
      'SORTABLE',
      'year',
      'NUMERIC',
      'SORTABLE',
      'comb08',
      'NUMERIC',
      'SORTABLE',
      'city08',
      'NUMERIC',
      'SORTABLE',
      'highway08',
      'NUMERIC',
      'SORTABLE',
      'combA08',
      'NUMERIC',
      'SORTABLE',
      'cityA08',
      'NUMERIC',
      'SORTABLE',
      'highwayA08',
      'NUMERIC',
      'SORTABLE',
      'atvType',
      'TEXT',
      'SORTABLE',
      'id',
      'NUMERIC',
      'SORTABLE',
    ])
    console.log('Index created successfully')
  } catch (error) {
    console.error('Error creating index:', error)
  }
}

async function importCSV(filePath) {
  await client.connect()
  await client.FLUSHALL()

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      const id = row.id
      await client.hSet(`vehicle:${id}`, row)
    })
    .on('end', () => {
      console.log('CSV file loaded')
    })

  createIndex(client)
}
importCSV('./src/assets/vehicles-slim.csv')

app.get('/search', async (req, res) => {
  const queryText = req.query.query || 'tesla' // search?query=text
  const from = req.query.from || 0

  try {
    const results = await client.ft.search(
      'idx:vehicle',
      `@name:${queryText}*`,
      {
        LIMIT: { from: from, size: 20 },
      }
    )

    const formattedResults = results.documents.map((doc) => ({
      year: doc.value.year,
      make: doc.value.make,
      model: doc.value.model,
      comb08: doc.value.comb08,
      city08: doc.value.city08,
      highway08: doc.value.highway08,
      combA08: doc.value.combA08,
      cityA08: doc.value.cityA08,
      highwayA08: doc.value.highwayA08,
      atvType: doc.value.atvType,
      id: doc.value.id,
    }))

    res.json({ success: true, results: formattedResults })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Search error',
      error: error.message,
    })
  }
})
