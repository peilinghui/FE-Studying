import axios from 'axios'

export async function getRandomRealmCoverImages(amount: number = 1) {
  const { data } = await axios.get('/files/random/realm/cover_images', {
    params: { amount }
  })
  return data
}

export async function create(url: string, mimeType: string, filename: string, userId: string) {
  const { data } = await axios.post('/files', {
    url, mimeType, filename, userId
  })
  return data
}

export async function upload(token: string, file: any) {
  const { path, mime } = file
  const formData = new FormData()
  formData.append('token', token)
  formData.append('file', {
    uri: path,
    type: mime,
    name: encodeURIComponent(path),
  })
  const { data } = await axios({
    method: 'post',
    url: 'https://upload.qiniup.com',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function qiniuToken() {
  const { data } = await axios.get('/files/storage/qiniu/uptoken')
  return data
}
