# M8.AE3 Subiendo imágenes con fileupload.

Carlos Pizarro Morales.  
...

## Contexto

En este ejercicio grupal, el equipo desarrollará una aplicación Express avanzada para manejar la carga, validación y gestión de archivos. Además de las funcionalidades básicas de carga y eliminación, los participantes implementarán características como renombrar archivos, realizar transformaciones sobre ellos y manejar errores de manera avanzada.

## Instrucciones

### 1. Configuración e Instalación

- Cada equipo debe crear un nuevo proyecto Node.js con el comando `npm init -y`.
- Instalen las dependencias necesarias.
- Configuren la aplicación Express en un archivo principal (`server.js` o index.js).

### 2. Creación de la aplicación para subir archivos

- Implementen una ruta `POST /upload` que permita a los usuarios cargar archivos al servidor. Los archivos deben ser guardados en una carpeta denominada `/uploads`.

### 3. Validación avanzada de existencia del archivo

- Antes de recibir un archivo, deben verificar si ya existe un archivo con el mismo nombre en la carpeta de destino. Si el archivo ya existe, deben agregar un sufijo único (como un número secuencial) o una marca de tiempo al nombre del archivo antes de guardarlo.

> NOTA: Esto no se implementará porque se realizará un manejo más simpático. Ver [notas](#notas).

### 4. Validación de formatos de archivo y tamaños

- Los archivos deben cumplir con ciertos requisitos:
    - Las extensiones permitidas deben ser `.jpg`, `.png`, `.gif`, `.pdf`, `.txt`.
    - El tamaño máximo del archivo debe ser de 5 MB.
- Si el archivo no cumple con estos criterios, debe devolver un mensaje de error adecuado, indicando cuál es el problema (extensión no permitida o tamaño excedido).
- Validación adicional personal: utilizar una librería para verificar el MIME type y que no te *pasen gato por liebre*. Por ejemplo `mime-types`.

### 5. Transformación y modificación del archivo

- Implementen una funcionalidad adicional para los archivos de imagen: si el archivo subido es una imagen `.jpg` o `.png`, el servidor debe realizar una transformación, como cambiar su tamaño o convertirla a otro formato (por ejemplo, convertir `.jpg` a `.png`).
- Pueden utilizar una librería como `sharp`. Investiguen cómo utilizar dicho paquete.

### 6. Renombrado del archivo de manera inteligente

- Los archivos deben ser renombrados antes de ser almacenados en el servidor. Los nombres deben ser únicos y pueden incluir el nombre original con un prefijo o sufijo para evitar colisiones.
- Asegúrese de que los nombres de archivo sean legibles y consistentes.

### 7. Obtención de atributos del archivo y mensajes personalizados

- Después de cargar un archivo, deben extraer sus atributos como:
  - El tipo de archivo (mimetype).
  - El tamaño del archivo (size).
  - El nombre original del archivo.

> NOTA: ver [notas](#notas) de implementación sobre este punto.

Estos atributos deben ser enviados al cliente en una respuesta JSON junto con el mensaje de estado, indicando si el archivo fue subido exitosamente o si hubo algún error.

### 8. Eliminación de archivos del servidor

- Crear una ruta `DELETE /delete/:filename` que permita eliminar un archivo en base a su nombre.
- Si el archivo no existe, responder con un mensaje de error adecuado. Si la eliminación es exitosa, devolver un mensaje de éxito.

### 9. Manejo avanzado de errores

- Deben implementar un manejo de errores adecuado en cada ruta. Si ocurre un error durante la carga, el renombrado o la eliminación del archivo, el servidor debe responder con un código de estado adecuado y un mensaje explicativo.

- Por ejemplo, si el archivo excede el tamaño permitido, deben devolver un error 413 (Payload Too Large) con un mensaje claro.
- Manejar otros códigos de respuesta para diferentes errores.

### 10. Pruebas grupales y optimización

- El equipo debe realizar pruebas exhaustivas de la funcionalidad, especialmente en casos de límite, como el tamaño del archivo, los tipos no permitidos, y la carga de archivos con nombres duplicados.
- Proporcione documentación y ejemplos de cómo utilizar la API de carga de archivos.

## Notas

### Sobre el flujo de la aplicación

#### POST /upload

**Renombraré este endpoint por** `POST /images` para ser más fiel a lo aprendido hasta ahora. La práctica de utilizar acciones en los endpoints podría sugerir una api bajo el modelo RPC pero no es lo que quiero lograr o explorar por ahora.

1. Un usuario sube una imagen a este servidor.
2. Se capturan sus datos para realizar las validaciones: MIME type, tamaño, extensión, nombre (original).
3. Se realizan las validaciones de MIME type, tamaño y extensiones permitidas.
4. **CASO ESPECIAL**: Si la extensión es válida pero no concuerda con el MIME type, se rechaza la subida con el mensaje "*¿Te creí hacker acaso?*" en JSON y error 
5. Si pasa las validaciones de MIME type, extensión y tamaño, se genera el nuevo nombre (ver [abajo](#sobre-el-renombrado)) y se procede a almacenar el archivo en el directorio `/uploads`
6. Si no pasa las validaciones, se envía el error correspondiente en la `response`. 
7. Si la operación de escritura fue exitosa, se procede a crear un query para la base de datos que contiene:
    - el nombre interno del archivo (`name`).
    - el nombre original (`mask_name`)
    - la ruta relativa (`path`)
    - el MIME type obtenido de la firma del archivo (número mágico) (`mime`)
    - el tamaño del archivo en bytes (`size`)
8. Si la escritura no fue exitosa, se envía el código de error correspondiente.
9. Se envía la query y si la operación de registro es exitosa, se culmina con la respuesta al cliente.
10. Si la query falla en almacenarse en la bd, se elimina el archivo `fs.unlink()` y se envía la respuesta al cliente.

#### DELETE /delete/:filename

**Renombraré este endpoint por** `DELETE /images/:filename`, por los mismos motivos anteriores.

Este método estará implementado de forma limpia en un botón de eliminar con el evento `'click'` asociado al handler `deleteImg(event)`. Este capturará el nombre real del archivo de un atributo `data-name="..."` en el botón y lo enviará bajo el método correcto usando `fetch`. El proceso en el servidor seguirá el mismo patrón "trasaccional" de la creación:

1. El servidor recibe la request.
2. Se procede a buscar el nombre. Si no existe, enviar el error correspondiente en la `response`.
3. Si el archivo existe, crear la query para eliminar el registro de la bd. Mantener los datos en un objeto por si es necesario hacer *rollback* del proceso.
4. Se envía la query y si su resultado es exitoso, se procede con el punto 6.
5. Si la query no fue exitosa, se envía el error en la `response`.
6. La query fue exitosa, por lo que ahora toca eliminar `fs.unlink()` el archivo.
7. Si se elimina exitosamente, se envía la response al cliente.
8. Si no se logra eliminar el archivo, se crea una query para volver a guardar el registro y se envía el código de error.

### Sobre el renombrado

El renombrado consiste en eliminar completamente el nombre original del archivo, reemplazándolo por la string que resulta de combinar el timestamp de creación del nombre (`Date.now()`) y un `UUIDv4`. Este nombre estará linkeado en la base de datos con su metadata y nombre original para enviarlo al cliente y ser utilizado en la vista si es requerido. La idea es mantener un nombre completamente consistente.

### Sobre el uso de una BD. 

El aspecto más relevante de las diferencias en mi implementación es que he decidido utilizar una pequeña base de datos (m8_img_server) para manejar los nombres de archivo. Esta contiene una sola tabla (por ahora) con los siguientes campos:

1. `name` (VARCHAR) combinación de `timestamp + uuid` generado en el servidor antes de almacenar. `PK`
2. `mask_name`: el nombre original que será servido al cliente para utilizar en el frontend.
3. `path`: una ruta relativa (`/uploads` siempre al principio) que permitirá formar la ruta relativa completa para ubicar el archivo y que además permitiría mejorar la organizacion de las imágenes eventualmente (`uploads/user_nn`) por ejemplo.
4. `mime`: el mime type obtenido con `mime-types` (la extensión NO ES un MIME type).
5. `size`: el tamaño del archivo en bytes. 
6. `createdAt` para el registro interno de la base de datos.

### Sobre las validaciones

No hay mucho que decir excepto: **no confies en el usuario, no confíes en el browser**. Leer más [**acá**](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)