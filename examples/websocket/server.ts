// #10 FIX: CORS restrito a origens permitidas (antes: origin: "*")
// #11 FIX: Autenticação no handshake WebSocket (antes: sem auth)
// #12 FIX: IDs de mensagem com crypto.randomUUID() (antes: Math.random)
//
// O WebSocket server exige um token JWT válido no handshake
// (query param ?token=... ou header Authorization). Sem token válido,
// a conexão é recusada (401). Isso impede que qualquer cliente anônimo
// se conecte e envie/receba mensagens.

import { createServer, IncomingMessage } from 'http'
import { Server, Socket } from 'socket.io'
import crypto from 'crypto'

// ─── Allowed Origins ────────────────────────────────────────────────────
// Em produção, restringir ao domínio do app. Em dev, permitir localhost.
const ALLOWED_ORIGINS = process.env.WS_ALLOWED_ORIGINS
  ? process.env.WS_ALLOWED_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production'
    ? ['https://gemgym.com.br', 'https://www.gemgym.com.br']
    : ['http://localhost:3000', 'http://localhost:3001']

// ─── JWT Verification (minimal, same logic as src/lib/auth.ts) ──────────
// Re-implemented here because the WebSocket server runs as a separate
// process without Next.js imports. In production, consider extracting
// a shared auth package.

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, 'base64')
}

function verifyHandshakeToken(token: string): string | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerPart, payloadPart, signaturePart] = parts

  // Verify signature
  const expectedSig = (() => {
    const data = `${headerPart}.${payloadPart}`
    const buf = crypto.createHmac('sha256', secret).update(data).digest()
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  })()

  const provided = base64urlDecode(signaturePart)
  const expected = base64urlDecode(expectedSig)
  if (provided.length !== expected.length) return null
  if (!crypto.timingSafeEqual(provided, expected)) return null

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart).toString('utf8'))
    if (!payload.sub || typeof payload.exp !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null // expired
    return payload.sub // userId
  } catch {
    return null
  }
}

// ─── Extract token from handshake ───────────────────────────────────────
function extractToken(req: IncomingMessage): string | null {
  // 1. Query param: ?token=...
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const queryToken = url.searchParams.get('token')
  if (queryToken) return queryToken

  // 2. Authorization header
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim()

  return null
}

// ─── Server Setup ───────────────────────────────────────────────────────
const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Auth middleware: reject connections without valid token ─────────────
io.use((socket, next) => {
  const token = extractToken(socket.request)
  if (!token) {
    return next(new Error('Authentication required'))
  }

  const userId = verifyHandshakeToken(token)
  if (!userId) {
    return next(new Error('Invalid or expired token'))
  }

  // Attach userId to socket for use in handlers
  ;(socket.data as any).userId = userId
  next()
})

interface User {
  id: string
  username: string
  userId: string // authenticated user ID from JWT
}

interface Message {
  id: string
  username: string
  content: string
  timestamp: Date
  type: 'user' | 'system'
}

const users = new Map<string, User>()

// #12 FIX: crypto.randomUUID() em vez de Math.random()
const generateMessageId = () => crypto.randomUUID()

const createSystemMessage = (content: string): Message => ({
  id: generateMessageId(),
  username: 'System',
  content,
  timestamp: new Date(),
  type: 'system'
})

const createUserMessage = (username: string, content: string): Message => ({
  id: generateMessageId(),
  username,
  content,
  timestamp: new Date(),
  type: 'user'
})

// Rate limiting: max 30 messages per minute per socket
const messageRateLimit = new Map<string, { count: number; resetAt: number }>()
const MSG_RATE_LIMIT = 30
const MSG_RATE_WINDOW = 60_000

io.on('connection', (socket) => {
  const userId = (socket.data as any).userId as string
  console.log(`User connected: ${socket.id} (userId: ${userId})`)

  // Add test event handler
  socket.on('test', (data) => {
    console.log('Received test message:', data)
    socket.emit('test-response', {
      message: 'Server received test message',
      data: data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('join', (data: { username: string }) => {
    const { username } = data

    // Basic input validation
    if (!username || typeof username !== 'string' || username.length > 50 || username.length < 1) {
      socket.emit('error', { message: 'Invalid username' })
      return
    }

    // Create user object
    const user: User = {
      id: socket.id,
      username,
      userId,
    }

    // Add to user list
    users.set(socket.id, user)

    // Send join message to all users
    const joinMessage = createSystemMessage(`${username} joined the chat room`)
    io.emit('user-joined', { user: { id: user.id, username: user.username }, message: joinMessage })

    // Send current user list to new user
    const usersList = Array.from(users.values()).map(u => ({ id: u.id, username: u.username }))
    socket.emit('users-list', { users: usersList })

    console.log(`${username} joined the chat room, current online users: ${users.size}`)
  })

  socket.on('message', (data: { content: string; username: string }) => {
    const { content, username } = data

    // Input validation
    if (!content || typeof content !== 'string' || content.length > 2000) {
      socket.emit('error', { message: 'Invalid message content' })
      return
    }

    // Rate limiting
    const now = Date.now()
    const rl = messageRateLimit.get(socket.id) || { count: 0, resetAt: now + MSG_RATE_WINDOW }
    if (now > rl.resetAt) {
      rl.count = 0
      rl.resetAt = now + MSG_RATE_WINDOW
    }
    rl.count++
    messageRateLimit.set(socket.id, rl)

    if (rl.count > MSG_RATE_LIMIT) {
      socket.emit('error', { message: 'Rate limit exceeded. Slow down.' })
      return
    }

    const user = users.get(socket.id)

    if (user && user.username === username) {
      const message = createUserMessage(username, content)
      io.emit('message', message)
      console.log(`${username}: ${content}`)
    }
  })

  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    messageRateLimit.delete(socket.id)

    if (user) {
      // Remove from user list
      users.delete(socket.id)

      // Send leave message to all users
      const leaveMessage = createSystemMessage(`${user.username} left the chat room`)
      io.emit('user-left', { user: { id: socket.id, username: user.username }, message: leaveMessage })

      console.log(`${user.username} left the chat room, current online users: ${users.size}`)
    } else {
      console.log(`User disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})
