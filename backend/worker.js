import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";


const worker = new Worker(
    'pdf-processing',
    async (job) => {
        console.log('Processing job:', job.id);
        const data = JSON.parse(job.data);

        const loader = new PDFLoader(data.path)
        const docs = await loader.load()

        const client = new QdrantClient({ url: `http://localhost:6333` });

        const embeddings = new OpenAIEmbeddings({
            apikey: process.env.OPENAI_API_KEY,
            model: 'text-embedding-3-small',
            // maxConcurrency: 100,
            // maxRetries: 3,
            // timeout: 60000,
            // requestTimeout: 60000,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                collectionName: 'pdf-rag',
                url: `http://localhost:6333`,
            }
        )

        await vectorStore.addDocuments(docs);
        console.log(`All docs are added to The Vectore Store`)
    }, 
    { concurrency: 100,
        connection: {
            host: 'localhost',
            port: 6379 // Assuming Redis is running on localhost:6379
        }
     }   
)