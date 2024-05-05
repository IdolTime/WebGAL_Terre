import axios from 'axios'

const instance = axios.create({
  timeout: 9000,
})

instance.interceptors.request.use((config) => {
  const user = localStorage.getItem('userToken')
  if (!user) return config
  config.headers.editorToken = user
  return config
})

export default instance
