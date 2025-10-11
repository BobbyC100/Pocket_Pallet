import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

console.log('API Service initialized with URL:', API_URL)

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log('API Request:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          hasAuth: !!token
        })
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        })
        return response
      },
      (error) => {
        console.error('API Response Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        })
        
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  getClient() {
    return this.client
  }
}

const apiService = new ApiService()
const api = apiService.getClient()

// Types
export interface User {
  id: string
  email: string
  username?: string
  is_active?: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
}

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    console.log('authService.login called', { email })
    
    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    try {
      const response = await api.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      console.log('authService.login response:', response.data)
      return response.data
    } catch (error) {
      console.error('authService.login error:', error)
      throw error
    }
  },

  register: async (email: string, password: string, username: string): Promise<LoginResponse> => {
    console.log('authService.register called', { email, username })
    const response = await api.post('/api/auth/register', {
      email,
      password,
      username,
    })
    console.log('authService.register response:', response.data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    console.log('authService.getCurrentUser called')
    const response = await api.get('/api/auth/me')
    console.log('authService.getCurrentUser response:', response.data)
    return response.data
  },
}

export default api

