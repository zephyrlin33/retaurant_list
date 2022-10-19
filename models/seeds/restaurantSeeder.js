const mongoose = require('mongoose')
const Restaurant = require('../restaurant.js')
const RList = require('../../restaurant.json').results // 載入 restaurant model
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
  Restaurant.create(RList)
    .then(() => {
      console.log('Restaurant list is already created!')
      db.close()
    })
    .catch(err => console.log(err))
})