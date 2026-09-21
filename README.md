# Pazstrology

Pazstrology es una aplicación web para crear y editar una carta astral de forma
interactiva.

Todo funciona en el navegador: no hace falta cuenta, ni servidor, ni internet
para usarla después de cargarla.

---

## Características únicas

- **Rueda con los 12 signos del zodiaco** rotable.
- **Anillo con las 12 casas** cuyo ángulo entre particiones es movible.
- **Planetas y asteroides** agregables, quitables y movibles sobre la carta.
- **Aspectos** entre cuerpos (mayores, menores, con asteroides y con los nodos).
- Varios **paneles con correspondencias** útiles para visualizar mejor la carta.
- Opciones para **mostrar u ocultar** asteroides, aspectos y nodos.

La carta se guarda **sola en tu navegador**, así que al volver, sigue ahí.
También podés descargarla o cargarla desde un archivo.

---

## Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

---

## Comandos de arranque

```bash
npm install      # instala las dependencias
npm run dev      # abre el proyecto en desarrollo
npm run build    # genera la versión final en la carpeta dist/
npm run preview  # prueba la versión final
```

---

## Estructura

```
src/
├── components/   # la carta, los paneles y el modal
├── data/         # signos, planetas, asteroides, aspectos y configuración
├── utils/        # cálculos de casas, signos y aspectos
└── App.tsx       # el punto de entrada de la aplicación
```

---

## Licencia

MIT — podés usar, copiar y modificar el proyecto libremente. Ver [LICENSE](LICENSE).

