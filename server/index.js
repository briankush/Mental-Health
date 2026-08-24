const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/login', (req, res) =>{
  res.send('logged in')
})
app.listen(port, () => {
  console.log(`Listening port on http://localhost:${port}`)
})
