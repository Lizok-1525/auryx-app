# Arquitectura y Diseño de la Base de Datos (Firestore)

Debido a que operamos en tiempo real con 4 aplicaciones distintas, la base de datos de Auryx utilizará **Firestore**. A continuación se detalla la estructura principal de las Colecciones (Tablas) y sus correspondientes Documentos.

## Colecciones Principales y Subcolecciones

### 1. `users` (Usuarios y Roles)
Albergará cualquier persona o entidad registrada en el sistema. Nos basamos en la propiedad `role` para delegar accesos.

*  `uid`: String (Firebase Auth ID)
*  `email`: String
*  `phone`: String
*  `role`: Enum (`admin`, `client`, `courier`, `commerce`)
*  `createdAt`: Timestamp
*  **[Si rol = client]** -> `points`: Number, `fullName`: String, `pushToken`: String
*  **[Si rol = courier]** -> `fullName`: String, `isActive`: Boolean, `currentLocation`: GeoPoint, `vehicleInfo`: Mapeo
*  **[Si rol = commerce]** -> `businessName`: String, `isOpen`: Boolean, `address`: String

### 2. `products` (Productos del Marketplace)
Mantenido por los comercios locales.
*  `id`: String
*  `commerceId`: String (Referencia a la tienda dueña)
*  `name`: String
*  `description`: String
*  `price`: Number
*  `stock`: Number
*  `imageUrl`: String

### 3. `orders` (El núcleo de Logística)
Gestiona todos los pedidos generados tanto desde la App Cliente (Tienda), vía Admin o mediante integraciones de API como MotoTrack.

*  `id`: String
*  `type`: Enum (`marketplace`, `private_courier`, `external_integration`)
*  `status`: Enum (`pending`, `accepted_by_commerce`, `searching_courier`, `courier_assigned`, `picked_up`, `delivered`, `cancelled`)
*  `clientId`: String (Vacio si es una orden manual externa)
*  `commerceId`: String (Vacío si es courier privado de pariente a pariente)
*  `courierId`: String (Asignado dinámicamente)
*  `securityCode`: String (El OTP generado: "1A2B" o "9472" para entregar)
*  `pickupLocation`: GeoPoint, `pickupAddress`: String
*  `dropoffLocation`: GeoPoint, `dropoffAddress`: String
*  `distancesKm`: Number
*  `totalCost`: Number
*  `timeline`: Array of Timestamps `{ status: "delivered", time: "2026-03..." }` (Vital para el reporte del administrador)

### 4. `chats` (Atención y Reparto)
Para mantener a los usuarios interconectados.

*  `id`: String (Generado por orden o solicitud de soporte)
*  `orderId`: String (Si es chat "Repartidor - Cliente")
*  `participants`: Array of Strings (UIDs: Ej. `[courierId, clientId]`)
*  `isSupportChat`: Boolean (Si es entre cliente/repartidor y nosotros como Admin)
*  *Subcolección:* `messages`
    *  `id`: String
    *  `senderId`: String
    *  `text`: String
    *  `timestamp`: Timestamp

### 5. `rewardsConfig` (Configuración de Puntos)
Manejado por el admin para setear de manera dinámica los equivalentes de compra.

*  `id`: "global_rules"
*  `pointsPerCurrencyUnit`: Number (Ej. 1 punto por cada $10)
*  `redeemValue`: Number (Ej. 100 puntos = $1 de descuento)
