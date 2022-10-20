const express = require ('express')
const mongoose = require('mongoose') // 載入 mongoose
const RList = require('./models/restaurant.js') // 載入 model
const exphbs = require('express-handlebars')
const restaurantList = require('./restaurant.json')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // 設定連線到 mongoDB
// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

// 設定引擎
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(express.static('public'))// 設定靜態路徑
// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(bodyParser.urlencoded({ extended: true }))

// 瀏覽全部餐廳
app.get('/', (req, res) => {
       
   RList.find() // 取出  model 裡的所有資料
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then(restaurants => res.render('index', { restaurants })) // 將資料傳給 index 樣板
    .catch(error => console.error(error)) // 錯誤處理

  })

// 搜尋設定
app.get('/search', (req, res) => {
  const keywords = req.query.keyword
  const keyword=keywords.trim().toLowerCase()

  RList.find({})
    .lean()
    .then(restaurants => {
      const filterRestaurantsData = restaurants.filter(
        data =>
          data.name.toLowerCase().includes(keyword) ||
          data.category.includes(keyword)
      )
      res.render("index", { restaurants: filterRestaurantsData, keywords })
    })
    .catch(err => console.log(err))
})
// 新增餐廳頁面
app.get('/restaurants/new', (req, res) => {
     res.render('new')
  })

  //瀏覽特定餐廳
app.get('/restaurants/:restaurant_id', (req, res) => {
  const {restaurant_id} = req.params
    RList.findById(restaurant_id)
    .lean()
    .then(restaurant => res.render('show', { restaurant }))//注意傳進去的變數要與樣板一致
    .catch(error => console.log(error))
 
})

//編輯餐廳
app.get('/restaurants/:restaurant_id/edit', (req, res) => {
  const {restaurant_id} = req.params
  
  RList.findById(restaurant_id)
    .lean()
    .then(restaurant => res.render('edit', { restaurant }))
    .catch(error => console.log(error))
})

//新增餐廳
app.post('/restaurants', (req, res) => {
    
    return RList.create(req.body)     // 存入資料庫
      .then(() => res.redirect('/')) // 新增完成後導回首頁
      .catch(error => console.log(error))
  })

//儲存新編輯
app.post('/restaurants/:restaurant_id/edit', (req, res) => {
    const {restaurant_id} = req.params
    const name = req.body.name
    console.log(name)
    console.log(restaurant_id)
    RList.findById(restaurant_id)
      .then( restaurant => {
        restaurant.name = name
        restaurant.save()
      })
      .then(()=> res.redirect('/'))
      .catch(error => console.log(error))
  })
 
  // start and listen on the Express server
app.listen(port, () => {
    console.log(`Express is listening on localhost:${port}`)
  })