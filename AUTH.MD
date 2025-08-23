# Guía de Autenticación - Study App

Este documento explica el sistema de autenticación implementado en la aplicación, cómo utilizar los hooks y contextos de autenticación, y detalla las variables y funciones disponibles, así como su ejecución en cliente o servidor.

## Tecnologías Utilizadas
- **Firebase Authentication**: Proveedor principal de autenticación.
- **Next.js App Router**: Manejo de rutas protegidas y layouts.
- **React Context**: Para compartir el estado de autenticación en toda la app.
- **Custom Hooks**: Para facilitar el acceso y manejo de la autenticación.

---

## Estructura de Autenticación

### 1. Contexto de Autenticación
 - **Archivo:** `src/context/AuthContext.tsx`
 - **Función:** Provee el estado de usuario y métodos de login/logout a toda la app.
 - **Variables y funciones expuestas:**
   - `user: User | null` — Objeto de usuario autenticado (tipo Firebase User) o `null` si no hay sesión.
   - `loading: boolean` — Indica si la autenticación está en proceso.
   - `login(email: string, password: string): Promise<User | null>` — Recibe email y contraseña, retorna el usuario autenticado o `null`.
   - `logout(): Promise<void>` — No recibe parámetros, cierra la sesión.
   - `register(email: string, password: string): Promise<User | null>` — Recibe email y contraseña, retorna el usuario registrado o `null`.
 - **¿Dónde corre?**: Solo en el cliente (React Context)

#### Ejemplo de uso:
```tsx
import { useAuth } from '../context/AuthContext';
const { user, login, logout, loading } = useAuth();
```

---

### 2. Hooks de Autenticación

#### a) `useFirebaseAuth`
 - **Archivo:** `src/hooks/useFirebaseAuth.ts`
 - **Función:** Encapsula la lógica de autenticación con Firebase.
 - **Variables/Funciones:**
   - `user: User | null` — Usuario autenticado o `null`.
   - `loading: boolean` — Estado de carga.
   - `login(email: string, password: string): Promise<User | null>` — Login con email/contraseña.
   - `register(email: string, password: string): Promise<User | null>` — Registro de usuario.
   - `logout(): Promise<void>` — Logout.
 - **¿Dónde corre?**: Cliente

#### b) `useAuth`
 - **Archivo:** `src/context/AuthContext.tsx`
 - **Función:** Hook para acceder al contexto de autenticación.
 - **Variables/Funciones:**
   - `user: User | null`
   - `loading: boolean`
   - `login(email: string, password: string): Promise<User | null>`
   - `logout(): Promise<void>`
   - `register(email: string, password: string): Promise<User | null>`
 - **¿Dónde corre?**: Cliente

---

### 3. Acciones de Autenticación
- **Archivos:**
  - `src/actions/auth/login.ts`
  - `src/actions/auth/register.ts`
  - `src/actions/auth/firebase-sync.ts`
- **Función:** Realizan operaciones de login, registro y sincronización con Firebase.
- **¿Dónde corren?**: Cliente (excepto sincronización, que puede usarse en SSR para validar sesión)

#### Ejemplo de tipos en acciones:
| Acción                | Parámetros                        | Retorno                |
|-----------------------|-----------------------------------|------------------------|
| `login`               | `{ email: string, password: string }` | `Promise<User | null>` |
| `register`            | `{ email: string, password: string }` | `Promise<User | null>` |
| `firebase-sync`       | `token: string`                   | `Promise<User | null>` |

---

### 4. Componentes Relacionados
- **`CredentialsForm.tsx`**: Formulario de login/registro.
- **`GoogleLoginButton.tsx`**: Login con Google.
- **`AuthError.tsx` / `AuthErrorContent.tsx`**: Manejo de errores de autenticación.

---

## Flujo de Autenticación
1. El usuario accede a una página protegida.
2. El contexto verifica si hay usuario autenticado (`user`).
3. Si no hay usuario, se redirige a login.
4. Al iniciar sesión, el contexto actualiza el estado global y permite acceso.

---

## Variables y Funciones Clave
| Variable/Función | Tipo de dato / Parámetros | Retorno | Cliente/Servidor |
|------------------|--------------------------|---------|------------------|
| `user`           | `User | null`            | -       | Cliente |
| `loading`        | `boolean`                | -       | Cliente |
| `login`          | `(email: string, password: string)` | `Promise<User | null>` | Cliente |
| `logout`         | `()`                     | `Promise<void>` | Cliente |
| `register`       | `(email: string, password: string)` | `Promise<User | null>` | Cliente |
| `firebase-sync`  | `(token: string)`        | `Promise<User | null>` | SSR/Cliente |

---

## Notas de Seguridad
- Las rutas protegidas deben verificar el estado de autenticación en el cliente.
- Para SSR, se recomienda validar el token de Firebase en el servidor si se requiere protección extra.

---

## Ejemplo de Protección de Ruta
```tsx
// En un layout o página:
import { useAuth } from '../context/AuthContext';
if (!user && !loading) {
  router.push('/auth/login');
}
```

---

## Referencias
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

---

Para dudas o mejoras, contactar al equipo de desarrollo.
