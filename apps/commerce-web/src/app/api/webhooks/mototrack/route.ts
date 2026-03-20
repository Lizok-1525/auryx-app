import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Esta ruta simulada asume que recibe un POST request desde MotoTrack o Burger King
// Ruta: POST /api/webhooks/mototrack

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Validar un API Key básico en el Header para seguridad
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Adaptador: Convertimos el payload externo al formato Firestore de Auryx
    const newOrderData = {
      type: "external_integration",
      status: "pending",
      commerceId: payload.restaurantId || "burger-king-001",
      clientId: null, // Viene de afuera
      courierId: null,
      securityCode: Math.floor(1000 + Math.random() * 9000).toString(), // Generación OTP
      pickupAddress: payload.pickupLocation || "Dirección de Tienda",
      dropoffAddress: payload.customer.deliveryAddress,
      customerDetails: {
         name: payload.customer.name,
         phone: payload.customer.phone
      },
      itemsSummary: payload.items.map((i:any) => `${i.quantity}x ${i.name}`).join(', '),
      totalCost: payload.totalAmount,
      externalOrderId: payload.orderId,
      createdAt: serverTimestamp(),
      timeline: [{ status: "pending", time: new Date().toISOString() }]
    };

    // Insertar directo en Firestore en la colección principal
    const docRef = await addDoc(collection(db, "orders"), newOrderData);

    return NextResponse.json({ 
      success: true, 
      message: 'Orden ingerida en Auryx correctamente',
      auryxOrderId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error procesando Webhook de MotoTrack:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
