import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Función 1: Asignarle un OTP automáticamente a toda orden nueva que no lo posea (Ej. Creada desde app Cliente P2P)
export const onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Si la orden ya trae su código de seguridad (eg. Webhook de Burger King lo genera), no hacemos nada
    if (data.securityCode) return null;

    // Generar OTP numérico de 4 dígitos
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Actualizamos el registro de Firestore con el código generado
    return snap.ref.update({
      securityCode: otp,
      status: "pending",
      timeline: admin.firestore.FieldValue.arrayUnion({
        status: "pending",
        time: new Date().toISOString()
      })
    });
  });

// Función 2: Calcular el Precio Estimado (Mock API) dinámicamente cuando un usuario llama a Cloud Function desde App
export const calculateP2PPrice = functions.https.onCall(async (data, context) => {
    // Requeriría que el usuario esté logueado
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "El usuario debe autenticarse para calcular precios");
    }

    const { originLat, originLng, destLat, destLng } = data;
    
    if (!originLat || !destLat) {
        throw new functions.https.HttpsError("invalid-argument", "Faltan coordenadas");
    }

    // SIMULACIÓN O MOCK: 
    // En el mundo real usaríamos "Google Distance Matrix API" aquí:
    // const dist = await fetch(googleMatrixUrl); ...
    
    // Asumamos un cálculo de distancia ficticio:
    const baseTariff = 2.00;
    const estimatedKm = (Math.random() * 10) + 1; // 1 a 11 km
    const perKmRate = 0.50; 
    
    const finalPrice = baseTariff + (estimatedKm * perKmRate);

    return {
        estimatedCost: Number(finalPrice.toFixed(2)),
        distanceKm: Number(estimatedKm.toFixed(1)),
        currency: "USD"
    };
});
