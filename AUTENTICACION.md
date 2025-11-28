# Sistema de Autenticación y Roles

## Configuración Inicial

### 1. Ejecutar Migración de Base de Datos

Ejecuta la migración `20240104000000_auth_and_roles.sql` en tu proyecto de Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y ejecuta el contenido de `supabase/migrations/20240104000000_auth_and_roles.sql`

### 2. Crear Usuarios

**📖 Ver guía detallada en [CREAR_USUARIOS.md](./CREAR_USUARIOS.md)**

#### Método Rápido: Desde Supabase Dashboard
1. Ve a **Authentication** → **Users** en Supabase Dashboard
2. Click en **"Add User"** → **"Create new user"**
3. Ingresa:
   - **Email**: `compras@plotcenter.com` (ejemplo)
   - **Password**: Una contraseña segura
   - **Auto Confirm User**: ✅ Marca esta casilla
4. En **"User Metadata"**, agrega:
   ```json
   {
     "nombre": "Juan Pérez",
     "role": "Compras"
   }
   ```
5. Click en **"Create User"**
6. El trigger automáticamente creará el perfil en `user_profiles`

**Roles disponibles:**
- `"Compras"` - Puede aprobar pedidos y crear órdenes de compra
- `"Taller Gráfico"` - Acceso general
- `"Metalúrgica"` - Acceso general
- `"Mostrador"` - Acceso general (rol por defecto)
- `"Administrador"` - Acceso completo

### 3. Roles Disponibles

- **Compras**: Puede aprobar/rechazar pedidos y crear órdenes de compra
- **Taller Gráfico**: Acceso general al sistema
- **Metalúrgica**: Acceso general al sistema
- **Mostrador**: Acceso general al sistema (rol por defecto)
- **Administrador**: Acceso completo, puede gestionar usuarios

### 4. Permisos por Rol

#### Compras
- ✅ Ver todos los pedidos
- ✅ Aprobar/Rechazar pedidos
- ✅ Crear órdenes de compra
- ✅ Ver órdenes de compra
- ✅ Ver sección "Compras" en el menú

#### Taller Gráfico, Metalúrgica, Mostrador
- ✅ Crear pedidos
- ✅ Ver sus propios pedidos
- ✅ Ver todos los pedidos (lectura)
- ❌ No pueden aprobar/rechazar pedidos
- ❌ No pueden crear órdenes de compra
- ❌ No ven la sección "Compras" en el menú

#### Administrador
- ✅ Todos los permisos de Compras
- ✅ Gestionar usuarios
- ✅ Acceso completo al sistema

## Uso

### Iniciar Sesión

1. Ve a `/login`
2. Ingresa tu email y contraseña
3. Serás redirigido al dashboard

### Cerrar Sesión

Click en el icono de logout en el header (esquina superior derecha)

### Crear Pedidos

1. Cualquier usuario autenticado puede crear pedidos
2. Los pedidos se vinculan automáticamente con el usuario creador
3. Los pedidos quedan en estado "Pendiente" hasta que Compras los apruebe

### Aprobar/Rechazar Pedidos

1. Solo usuarios con rol "Compras" o "Administrador" pueden aprobar/rechazar
2. Los botones de aprobar/rechazar solo aparecen para estos roles
3. Al aprobar/rechazar, se crea una notificación para el usuario que creó el pedido

### Crear Órdenes de Compra

1. Solo usuarios con rol "Compras" o "Administrador" pueden crear órdenes
2. La sección "Compras" solo aparece en el menú para estos roles
3. Las órdenes se vinculan automáticamente con el usuario creador

## Seguridad

- Todas las rutas están protegidas (excepto `/login`)
- Si no estás autenticado, serás redirigido a `/login`
- Las políticas RLS (Row Level Security) en Supabase protegen los datos
- Los usuarios solo pueden ver/modificar datos según su rol

## Verificar Usuario Creado

Ejecuta el script `VERIFICAR_USUARIO.sql` en SQL Editor para verificar que:
- El usuario existe en `auth.users`
- El perfil se creó en `user_profiles`
- El trigger funcionó correctamente

## Próximos Pasos

1. ✅ **Usuario creado** - Ya tienes tu primer usuario
2. 🔐 **Iniciar sesión** - Ve a `/login` e inicia sesión con tu email y contraseña
3. ✅ **Verificar permisos** - Según tu rol, verás diferentes opciones en el menú
4. 👥 **Crear más usuarios** - Sigue la guía en `CREAR_USUARIOS.md` para crear usuarios adicionales

## Notas Importantes

- El primer usuario debe crearse manualmente desde Supabase Dashboard ✅ (Ya completado)
- Los roles se asignan al crear el usuario (en metadata)
- Para cambiar el rol de un usuario, actualiza el campo `role` en la tabla `user_profiles`
- Los usuarios inactivos (`activo = false`) no pueden iniciar sesión

