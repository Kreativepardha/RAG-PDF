import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq'
import { QdrantVectorStore } from '@langchain/qdrant'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Worker } from 'bullmq'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { CharacterTextSplitter } from '@langchain/textsplitters'
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai'

const client = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
})

const queue = new Queue('pdf-processing', {
  connection: {
    host: 'localhost',
    port: 6379 // Assuming Redis is running on localhost:6379
  }
})

// const vectorStore = QdrantVectorStore.fromExistingCollection({
//   url: 'http://localhost:6333',
//   collectionName: 'pdf-rag',
// })

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

app.get('/chat', async (req, res) => {
  const userQuery = 'What is in skill section '
  const embeddings = new OpenAIEmbeddings({
    apikey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
  })
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: 'http://localhost:6333',
      collectionName: 'pdf-rag',
    }
  )
  const ret = vectorStore.asRetriever({
    k: 2,
  })

  const result = await ret.invoke(userQuery)

  const SYSTEM_PROMPT = `You are a helpful assistant who answers the user query based on available context from PDF files.
  context: ${JSON.stringify(result)}
 If you don't know the answer, just say "I don't know".` 

 const chatResult = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery }
    ],
  })


  return res.json({
    status: 'Success',
    message: 'Query processed successfully',
    result: chatResult.choices[0].message.content,
    docs: result
  })
})

app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000')
})