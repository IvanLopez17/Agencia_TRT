# .env - Configuración de variables de entorno
# Copiar este archivo como .env y configurar con tus valores

# Configuración del servidor
NODE_ENV=development
PORT=3000

# Configuración de base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=reserva_trip

# Configuración de seguridad
JWT_SECRET=tu_jwt_secret_aqui
SESSION_SECRET=tu_session_secret_aqui

# Configuración de email (opcional para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_email

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración de logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# .env.example - Ejemplo de configuración
# NODE_ENV=development
# PORT=3000
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=reserva_trip
# JWT_SECRET=your_jwt_secret_here
# SESSION_SECRET=your_session_secret_here