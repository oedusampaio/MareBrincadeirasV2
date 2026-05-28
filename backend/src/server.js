const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🧸  Mare Brincadeiras — API Backend        ║
╚══════════════════════════════════════════════╝

  Porta   : ${PORT}
  Ambiente: ${process.env.NODE_ENV || 'development'}

  Health  : http://localhost:${PORT}/health
  Produtos: http://localhost:${PORT}/api/products
  Carrinho: http://localhost:${PORT}/api/cart

  ⚠️  Para o Expo no celular/emulador, use o IP da
     sua máquina na rede local (ex: 192.168.x.x)
     e configure em src/services/api.js do app.

  CTRL+C para parar
  `);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\nServidor encerrado.');
    process.exit(0);
  });
});

module.exports = server;
