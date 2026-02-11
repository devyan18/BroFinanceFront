# Sistema de 3 Estados del Usuario

## Estados del Usuario

El sistema de autenticación utiliza **3 estados distintos** para el usuario, cada uno con un significado específico:

### 1. `undefined` - Estado Inicial (Verificando)

- **Cuándo:** Cuando la aplicación acaba de cargar y aún no se ha verificado el token
- **Significado:** "No sabemos si el usuario está autenticado o no, estamos verificando"
- **Comportamiento:** Muestra pantalla de carga

```typescript
user === undefined; // Verificando autenticación...
```

### 2. `null` - No Autenticado

- **Cuándo:** Después de verificar y confirmar que NO hay token válido
- **Significado:** "El usuario definitivamente NO está autenticado"
- **Comportamiento:** Redirige al login

```typescript
user === null; // No autenticado, redirigir a login
```

### 3. `User` - Autenticado

- **Cuándo:** Después de verificar y confirmar que el token es válido
- **Significado:** "El usuario está autenticado con estos datos"
- **Comportamiento:** Permite acceso a rutas protegidas

```typescript
user === { id, email, firstName, ... }  // Autenticado
```

---

## Flujo de Estados

### Carga Inicial de la App

```
1. App inicia
   └─> user = undefined
   └─> isLoading = true

2. AuthProvider.verifyAuth() se ejecuta automáticamente
   ├─> Si NO hay token en localStorage:
   │   └─> user = null
   │   └─> isLoading = false
   │
   └─> Si HAY token en localStorage:
       ├─> Llama a GET /auth/verify
       │
       ├─> Si el token es VÁLIDO:
       │   └─> user = { ...userData }
       │   └─> isLoading = false
       │
       └─> Si el token es INVÁLIDO:
           └─> user = null
           └─> isLoading = false
           └─> Token eliminado de localStorage
```

### Login Exitoso

```
1. Usuario ingresa credenciales
2. POST /auth/login
3. Respuesta: { token, user }
4. user = { ...userData }
5. Token guardado en localStorage
6. Redirección a /dashboard
```

### Logout

```
1. Usuario hace click en Logout
2. user = null
3. Token eliminado de localStorage
4. Redirección a /
```

---

## Implementación en ProtectedRoute

```typescript
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Estado 1: undefined - Verificando
  if (user === undefined) {
    return <LoadingScreen />;
  }

  // Estado 2: null - No autenticado
  if (user === null) {
    return <Redirect to="/" />;
  }

  // Estado 3: User object - Autenticado
  return <>{children}</>;
}
```

---

## Ventajas de este Sistema

### ✅ **Claridad Semántica**

- `undefined` = "No sé"
- `null` = "Sé que NO"
- `User` = "Sé que SÍ"

### ✅ **Evita Redirecciones Innecesarias**

Sin el estado `undefined`, el usuario vería un flash del login antes de ser redirigido al dashboard cuando tiene un token válido.

### ✅ **Mejor UX**

Muestra una pantalla de carga apropiada mientras se verifica la autenticación.

### ✅ **Type Safety**

TypeScript puede distinguir entre los 3 estados:

```typescript
type User = {
  id: string;
  email: string;
  // ...
};

// El tipo del usuario es explícito
user: User | null | undefined;

// Puedes hacer type narrowing
if (user === undefined) {
  // TypeScript sabe que estamos verificando
}
if (user === null) {
  // TypeScript sabe que NO está autenticado
}
if (user) {
  // TypeScript sabe que user es de tipo User
  console.log(user.email); // ✅ Type-safe
}
```

---

## Ejemplo de Uso en Componentes

```typescript
import { useAuth } from '../providers/AuthProvider';

function MyComponent() {
  const { user } = useAuth();

  // Verificando autenticación
  if (user === undefined) {
    return <div>Cargando...</div>;
  }

  // No autenticado
  if (user === null) {
    return <div>Por favor, inicia sesión</div>;
  }

  // Autenticado
  return (
    <div>
      <h1>Bienvenido, {user.firstName}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

---

## Debugging

Para verificar el estado actual del usuario en cualquier momento:

```typescript
const { user, isLoading } = useAuth();

console.log("User state:", {
  user,
  isLoading,
  state:
    user === undefined
      ? "VERIFYING"
      : user === null
        ? "NOT_AUTHENTICATED"
        : "AUTHENTICATED",
});
```

---

## Resumen Visual

```
┌─────────────────────────────────────────────────────┐
│                   APP INICIA                        │
│                  user = undefined                   │
│                  isLoading = true                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  verifyAuth()      │
         └────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ┌─────────┐         ┌─────────┐
   │ No Token│         │ Token   │
   └────┬────┘         └────┬────┘
        │                   │
        ▼                   ▼
   user = null      GET /auth/verify
   isLoading = false       │
        │              ┌────┴────┐
        │              │         │
        │              ▼         ▼
        │          ┌──────┐  ┌──────┐
        │          │Valid │  │Invalid│
        │          └──┬───┘  └──┬───┘
        │             │         │
        │             ▼         ▼
        │        user = User  user = null
        │        isLoading=false isLoading=false
        │             │         │
        └─────────────┴─────────┘
                      │
                      ▼
              ┌───────────────┐
              │ App Renderiza │
              └───────────────┘
```
