# Next.js 15 App Router Documentation

## Server and Client Components

```typescript
// Server Component (default)
import 'server-only'

export async function getData() {
  const res = await fetch('https://external-service.com/data', {
    headers: {
      authorization: process.env.API_KEY,
    },
  })
  return res.json()
}

// Client Component
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function ExampleClientComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // ...
}
```

## Composition Patterns

```tsx
// Pass Server Components as children to Client Components
import ClientComponent from './client-component'
import ServerComponent from './server-component'

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}
```

## Route Handlers

```typescript
// app/api/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  return NextResponse.json({ query })
}

export async function POST(request: Request) {
  const data = await request.json()
  return Response.json({ received: data })
}
```

## Route Segment Config

```typescript
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
```

## Data Fetching & Caching

```typescript
// Cached by default (GET with Response object)
export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()
  return Response.json({ data })
}

// Revalidating cached data
export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })
  const data = await res.json()
  return Response.json(data)
}
```

## Cookies and Headers

```typescript
import { cookies, headers } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  const headersList = headers()
  const referer = headersList.get('referer')

  return new Response('Hello!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token.value}` },
  })
}
```

## Dynamic Routes

```typescript
// app/items/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug
  return Response.json({ slug })
}
```

## Middleware

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
```

## Linking and Navigation

```typescript
'use client'
import { usePathname } from 'next/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()

  function switchLocale(locale: string) {
    const newPath = `/${locale}${pathname}`
    window.history.replaceState(null, '', newPath)
  }

  return (
    <>
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('fr')}>French</button>
    </>
  )
}
```

## Project Structure

```
app/
├── globals.css
├── layout.tsx
├── loading.tsx
├── error.tsx
├── api/
│   └── route.ts
├── [id]/
│   └── page.tsx
└── (index)
    ├── components/
    │   └── SearchBox.tsx
    └── page.tsx
```

## Dynamic Client-Only Component

```typescript
'use client'
import dynamic from 'next/dynamic'

const App = dynamic(() => import('../../App'), { ssr: false })

export function ClientOnly() {
  return <App />
}
```

## Server Actions

```typescript
'use client'

export default function MyPage() {
  async function formAction(formData) {
    'use server'
    client.insert({ name: formData.get('username') })
  }

  return (
    <form action={formAction}>
      <input name="username" />
      <button type="submit">Submit</button>
    </form>
  )
}
```
