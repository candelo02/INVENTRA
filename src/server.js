import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `[server] corriendo en modo ${process.env.NODE_ENV || 'development'} — puerto ${PORT}`
  );
});
