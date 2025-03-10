# Uso de Parámetros en la URL para la Generación de Reportes

## Descripción
Esta aplicación permite generar reportes dinámicamente mediante parámetros enviados en la URL. A continuación, se describe cómo construir la URL correctamente y qué valores debe contener.

---

## Estructura de la URL

La URL tiene el siguiente formato:


### Parámetros:

| Parámetro      | Descripción |
|---------------|------------|
| `nombreLocal` | Nombre del establecimiento o tienda que solicita el reporte. |
| `urlServicio` | Endpoint del servicio donde se obtendrán los datos del reporte. Debe ser una URL válida. |
| `idUsuario`   | ID único del usuario que solicita el reporte. |
| `deviceID`    | ID del dispositivo desde el cual se genera la solicitud. |

---

## Ejemplo de Uso

Si un usuario de la tienda "SuperMarket" necesita obtener un reporte desde un servidor local con su ID de usuario `456` y su dispositivo `8888`, la URL debe construirse de la siguiente manera:

?nombreLocal=SuperMarket&urlServicio=http://localhost:1000/LOCAL_NETWORK/REPORTES&idUsuario=456&deviceID=8888


---

## Notas Importantes
- `urlServicio` debe contener una URL accesible para la aplicación.
- Asegúrate de codificar correctamente los parámetros si contienen caracteres especiales.  
  Ejemplo en JavaScript:
  ```js
  const urlServicio = encodeURIComponent("http://localhost:1000/LOCAL NETWORK/REPORTES");
