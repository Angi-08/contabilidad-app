# Contabilidad Multi-Negocio

Aplicación móvil de contabilidad para **varios negocios**, desarrollada con **Angular + Ionic + Capacitor + Firebase**.

Soporta **modo offline** (Firestore Persistence).

---

## Características

- Autenticación (email/contraseña)
- Gestión de múltiples negocios
- Categorías de Ingresos y Gastos
- Registro de movimientos (ingresos / gastos)
- Dashboard con resumen del mes actual
- Reportes por período (mes actual, mes anterior, año)
- Funciona offline (los cambios se sincronizan al reconectar)
- Interfaz en español
- Lista para generar APK de Android

---

## Requisitos previos

- Node.js 18+ (recomendado 20 o 22)
- npm o yarn
- Cuenta de Firebase
- Android Studio (para generar el APK)

---

## 1. Instalación

```bash
cd contabilidad-app
npm install
```

---

## 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. Activa **Authentication** → método Email/Password.
3. Crea una base de datos **Firestore** (modo de producción o prueba).
4. En Configuración del proyecto → Tus apps → agrega una app Web y copia la configuración.
5. Pega los datos en:

```
src/environments/environment.ts
src/environments/environment.prod.ts
```

Ejemplo:

```ts
firebase: {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### Reglas de seguridad recomendadas (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }
    match /categories/{categoryId} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> **Nota**: Para producción, ajusta las reglas de categories y transactions para que solo el dueño del negocio pueda acceder (usando `get()` para verificar el ownerId).

### Índices necesarios en Firestore

Crea estos índices compuestos:

1. **transactions**: `businessId` (Ascending) + `date` (Descending)
2. **transactions**: `businessId` (Ascending) + `date` (Ascending) + `date` (Ascending)  (para rangos)
3. **categories**: `businessId` (Ascending) + `type` (Ascending) + `name` (Ascending)
4. **businesses**: `ownerId` (Ascending) + `name` (Ascending)

Firebase te avisará automáticamente cuando falte un índice y te dará el enlace para crearlo.

---

## 3. Ejecutar en el navegador (desarrollo)

```bash
npm start
# o
npx ionic serve
```

Abre http://localhost:4200

---

## 4. Generar la app Android

```bash
# 1. Construir la versión web
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android
```

Desde Android Studio:
- Espera a que Gradle termine
- Conecta un dispositivo o inicia un emulador
- Pulsa **Run**

Para generar el APK firmado:
1. Build → Generate Signed Bundle / APK
2. Sigue el asistente de Android Studio

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── models/          # Business, Category, Transaction, User
│   ├── services/        # Auth, Business, Category, Transaction, Network
│   └── guards/          # Auth guards
├── pages/
│   ├── auth/            # Login y Registro
│   ├── businesses/      # Gestión de negocios
│   ├── dashboard/       # Resumen principal
│   ├── transactions/    # Lista + Formulario de movimientos
│   ├── categories/      # Gestión de categorías
│   └── reports/         # Reportes por período
└── shared/
```

---

## Flujo de uso recomendado

1. Registrarse / Iniciar sesión
2. Crear al menos un negocio
3. Crear categorías (Ingresos y Gastos)
4. Registrar movimientos
5. Ver el Dashboard y los Reportes

---

## Notas importantes

- El **modo offline** se activa automáticamente gracias a `enableIndexedDbPersistence`.
- Cuando no hay conexión aparece un banner naranja en la parte superior.
- El negocio seleccionado se guarda en `localStorage`.
- La app está pensada como **sencilla y práctica** para llevar registros diarios de varios negocios.

---

## Licencia

Uso libre para proyectos personales y comerciales.
