import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq'

const queue = new Queue('pdf-processing', {
  connection: {
    host: 'localhost',
    port: 6379 // Assuming Redis is running on localhost:6379
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})


const upload = multer({ storage: storage })

const app = express()
app.use(cors())

app.get('/', (req, res) => {
  return res.json({
    status: 'All Good',
    message: 'Welcome to the PDF RAG API'
  })
})

app.post('/api/upload', upload.single('pdf'), async (req, res) => {

  await queue.add('process-pdf', JSON.stringify({
    filename: req.file.filename,
    destination: req.file.destination,
    path: req.file.path,
  }))

  return res.json({
    status: 'Success',
    message: 'File uploaded successfully',
    file: req.file
  })
}
)

app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000')
})