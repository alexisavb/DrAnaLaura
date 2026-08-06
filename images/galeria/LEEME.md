# Galería

Aquí van las fotos y videos que aparecen en la sección **Galería** del sitio.

Las `demo-1.webp` … `demo-6.webp` son marcadores de posición generados: **bórralas
al subir el material real**.

## Formato de las imágenes

- **WebP**, igual que el resto del sitio. Para convertir desde JPG/PNG:
  ```sh
  cwebp -q 82 foto.jpg -o foto.webp
  ```
- El carrusel recorta a **4:3**, así que conviene subirlas ya en esa proporción
  (por ejemplo 1200×900) para controlar tú el encuadre. Si no, se recorta desde
  el centro.
- Mantén cada archivo por debajo de ~150KB: el sitio entero pesa poco a
  propósito, y es lo que sostiene la velocidad de carga.

## Cómo agregar una foto

En `index.html`, dentro de `<ul class="gallery-track">`, agrega un elemento más:

```html
<li class="gallery-item">
    <figure>
        <img src="images/galeria/consultorio-1.webp"
             alt="Descripción de lo que se ve en la foto"
             width="1200" height="900" loading="lazy" decoding="async" />
    </figure>
</li>
```

El `alt` no es opcional: es lo que leen los lectores de pantalla y lo que
Google usa para entender la imagen.

## Cómo agregar un video

Mismo lugar, pero con la clase `gallery-item--video`. El `poster` es la imagen
que se ve antes de darle play — sin él, el video aparece en negro:

```html
<li class="gallery-item gallery-item--video">
    <figure>
        <video controls preload="none"
               poster="images/galeria/video-1-poster.webp"
               width="1200" height="900">
            <source src="images/galeria/video-1.mp4" type="video/mp4" />
        </video>
    </figure>
</li>
```

- **MP4 (H.264)** es el formato que reproducen todos los navegadores.
- `preload="none"` evita que el video se descargue si nadie lo reproduce.
- El carrusel pausa solo cualquier video que esté corriendo al cambiar de foto.

## Cuántos elementos

El carrusel es infinito y funciona con cualquier cantidad, pero necesita **al
menos 4** para que en escritorio (donde se ven 3 a la vez) el giro no se note
brusco.
