# Sistema de Autenticación y Roles

## Configuración Inicial

### 1. Ejecutar Migración de Base de Datos

Ejecuta la migración `20240104000000_auth_and_roles.sql` en tu proyecto de Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y ejecuta el contenido de `supabase/migrations/20240104000000_auth_and_roles.sql`

### 2. Crear Usuarios

Los usuarios se crean a través de Supabase Auth. Hay dos formas:

#### Opción A: Desde Supabase Dashboard
1. Ve a Authentication → Users
2. Click en "Add User" → "Create new user"
3. Ingresa email y contraseña
4. En "User Metadata", agrega:
   ```json
   {
     "nombre": "Nombre del Usuario",
     "role": "Compras"
   }
   ```
5. El trigger automáticamente creará el perfil en `user_profiles`

#### Opción B: Desde la aplicación (requiere Admin)
1. Un administrador puede crear usuarios desde la página de configuración (próximamente)

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

## Notas Importantes

- El primer usuario debe crearse manualmente desde Supabase Dashboard
- Los roles se asignan al crear el usuario (en metadata)
- Para cambiar el rol de un usuario, actualiza el campo `role` en la tabla `user_profiles`
- Los usuarios inactivos (`activo = false`) no pueden iniciar sesión

