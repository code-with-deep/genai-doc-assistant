
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, 
})


export const checkHealth = async () => {
  const res = await client.get('/health')
  return res.data // { status: "ok" }
}


export const uploadDocument = async (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0
      onProgress?.(pct)
    },
  })
  return res.data 
}

export const listDocuments = async () => {
  const res = await client.get('/documents')
  return res.data 
}

export const deleteDocument = async (doc_id) => {
  const res = await client.delete(`/documents/${doc_id}`)
  return res.data // { message }
}


export const askQuestion = async (question, doc_id = null) => {
  const payload = { question }
  if (doc_id) payload.doc_id = doc_id
  const res = await client.post('/ask', payload)
  return res.data // { answer, sources: [{ filename, page, score }] }
}
