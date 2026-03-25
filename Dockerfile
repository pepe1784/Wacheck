FROM php:8.2-apache

# mod_rewrite para .htaccess
RUN a2enmod rewrite

# Extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Permitir AllowOverride en todo el árbol
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Variables de entorno de Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html

WORKDIR /var/www/html

# El código se monta vía volume en docker-compose (no COPY)
# así los cambios se reflejan sin reconstruir la imagen
