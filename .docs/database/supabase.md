# Supabase Documentation

## Client Setup

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    realtime: {
      channels,
      endpoint,
    },
  }
)
```

### Python

```python
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
```

## Authentication

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})
```

### Auth Provider (React)

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## Database Queries

### Select

```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
```

### Insert

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: 'Content here' })
  .select()
```

### Update

```typescript
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
```

### Delete

```typescript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

## Real-time Subscriptions

### Subscribe to Changes

```typescript
const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'posts',
    },
    (payload) => console.log(payload)
  )
  .subscribe()
```

### With Filter

```typescript
const channel = supabase
  .channel('filtered-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'products',
      filter: 'name=in.(red, blue, yellow)',
    },
    (payload) => console.log(payload)
  )
  .subscribe()
```

### Presence

```typescript
const channel = supabase.channel('room:123', {
  config: {
    presence: {
      key: user.id,
    },
  },
})

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Current state:', state)
})

channel.track({ user_id: user.id, status: 'online' })
```

### Broadcast

```typescript
const channel = supabase.channel('broadcast-test', {
  broadcast: { ack: false, self: false }
})

channel.on('broadcast', { event: 'some-event' }, (payload) =>
  console.log(payload)
)

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.send({
      type: 'broadcast',
      event: 'some-event',
      payload: { hello: 'world' },
    })
  }
})
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);
```

## Server-Side (Next.js)

```typescript
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Usage in Server Component
export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('posts').select('*')
  return <div>{/* render data */}</div>
}
```

## Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file)

// Get public URL
const { data } = supabase.storage
  .from('public-bucket')
  .getPublicUrl('folder/avatar1.png')

// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar1.png')
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Migrations

```bash
# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Start local Supabase
supabase start
```
