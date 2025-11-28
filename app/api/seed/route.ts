import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Datos de ejemplo
    const clientesData = [
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        telefono: '+54 11 1234-5678',
        empresa: 'Empresa ABC',
        direccion: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires',
      },
      {
        nombre: 'María González',
        email: 'maria.gonzalez@startup.com',
        telefono: '+54 11 9876-5432',
        empresa: 'Startup XYZ',
        direccion: 'Calle Falsa 456',
        ciudad: 'Córdoba',
      },
    ]

    const productosData = [
      {
        nombre: 'Banner Vinílico',
        categoria: 'Banners',
        descripcion: 'Banner de vinilo para exteriores',
        precio_base: 1500,
        unidad: 'm2',
        activo: true,
      },
      {
        nombre: 'Lona Publicitaria',
        categoria: 'Banners',
        descripcion: 'Lona de alta resistencia para exteriores',
        precio_base: 1800,
        unidad: 'm2',
        activo: true,
      },
      {
        nombre: 'Señalética Interior',
        categoria: 'Señalética',
        descripcion: 'Señalética para interiores en PVC',
        precio_base: 2500,
        unidad: 'unidad',
        activo: true,
      },
      {
        nombre: 'Plotter de Corte',
        categoria: 'Corte',
        descripcion: 'Corte de vinilo para decoración',
        precio_base: 800,
        unidad: 'm2',
        activo: true,
      },
      {
        nombre: 'Impresión Digital',
        categoria: 'Impresión',
        descripcion: 'Impresión digital de alta calidad',
        precio_base: 1200,
        unidad: 'm2',
        activo: true,
      },
      {
        nombre: 'Diseño Gráfico',
        categoria: 'Servicios',
        descripcion: 'Servicio de diseño gráfico',
        precio_base: 5000,
        unidad: 'hora',
        activo: true,
      },
    ]

    // Insertar clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .insert(clientesData)
      .select()

    if (clientesError) {
      return NextResponse.json({ error: clientesError.message }, { status: 500 })
    }

    // Insertar productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .insert(productosData)
      .select()

    if (productosError) {
      return NextResponse.json({ error: productosError.message }, { status: 500 })
    }

    if (clientes && clientes.length > 0 && productos && productos.length > 0) {
      // Crear proyectos de ejemplo
      const proyectosData = [
        {
          cliente_id: clientes[0].id,
          nombre: 'Banner para Evento Corporativo',
          descripcion: 'Banner de 3x2 metros para evento corporativo',
          estado: 'en_produccion',
          fecha_entrega: new Date('2024-02-15').toISOString(),
          presupuesto: 9000,
        },
        {
          cliente_id: clientes[1].id,
          nombre: 'Señalética para Oficina',
          descripcion: 'Conjunto de señalética para nueva oficina',
          estado: 'aprobado',
          fecha_entrega: new Date('2024-02-25').toISOString(),
          presupuesto: 15000,
        },
      ]

      const { data: proyectos, error: proyectosError } = await supabase
        .from('proyectos')
        .insert(proyectosData)
        .select()

      if (proyectosError) {
        return NextResponse.json({ error: proyectosError.message }, { status: 500 })
      }

      if (proyectos && proyectos.length > 0) {
        // Crear items de proyecto
        const proyectoItemsData = [
          {
            proyecto_id: proyectos[0].id,
            producto_id: productos[0].id,
            cantidad: 6,
            precio_unitario: 1500,
            descripcion: 'Banner Vinílico 3x2m',
            subtotal: 9000,
          },
          {
            proyecto_id: proyectos[1].id,
            producto_id: productos[2].id,
            cantidad: 5,
            precio_unitario: 2500,
            descripcion: 'Señalética Interior',
            subtotal: 12500,
          },
          {
            proyecto_id: proyectos[1].id,
            producto_id: productos[5].id,
            cantidad: 2,
            precio_unitario: 5000,
            descripcion: 'Diseño Gráfico',
            subtotal: 10000,
          },
        ]

        await supabase.from('proyecto_items').insert(proyectoItemsData)

        // Crear presupuestos de ejemplo
        const presupuestosData = [
          {
            proyecto_id: proyectos[0].id,
            cliente_id: clientes[0].id,
            numero: 'PRES-2024-001',
            fecha_vencimiento: new Date('2024-02-18').toISOString(),
            subtotal: 9000,
            descuento: 0,
            impuestos: 1890,
            total: 10890,
            estado: 'aprobado',
          },
        ]

        const { data: presupuestos, error: presupuestosError } = await supabase
          .from('presupuestos')
          .insert(presupuestosData)
          .select()

        if (presupuestosError) {
          return NextResponse.json({ error: presupuestosError.message }, { status: 500 })
        }

        if (presupuestos && presupuestos.length > 0) {
          const presupuestoItemsData = [
            {
              presupuesto_id: presupuestos[0].id,
              producto_id: productos[0].id,
              cantidad: 6,
              precio_unitario: 1500,
              descripcion: 'Banner Vinílico 3x2m',
              subtotal: 9000,
            },
          ]

          await supabase.from('presupuesto_items').insert(presupuestoItemsData)
        }
      }
    }

    return NextResponse.json({ 
      message: 'Datos de ejemplo insertados correctamente',
      clientes: clientes?.length || 0,
      productos: productos?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

