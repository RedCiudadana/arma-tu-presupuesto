# Arma tu presupuesto

Arma tu presupuesto es una plataforma que busca acercar a los ciudadanos con el Gobierno,
concretamente con la disposición de su presupuesto.

## Requerimientos

* Node.js + npm
* git
* MongoDB

## Para arrancar

1. Clonar el repositorio
2. `npm install`
3. `npm start`
4. Navegar hacia http://localhost:8000

## Cargar datos de ejemplo a la base de datos

Para cargar los datos de ejemplo que se encuentran en la carpeta
[`fixtures`](fixtures) puedes ejecutar:

`gulp fixtures`

Si tu entorno no cuenta con `gulp` disponible globalmente puedes ejecutar
`./node_modules/.bin/gulp fixtures`.

*Nota: esto cargará datos a la base de datos por defecto (`presupuesto-dev`). Esto
puede modificar por medio de los archivos en `config`*

## Arquitectura

La aplicación está diseñada como un SPA servida por un aplicación de [Express](https://expressjs.com/),
con plantillas HTML en [Jade](https://pugjs.org/api/getting-started.html). La interacción
se logra mediante un API también desarrollado en Express, con almacenamiento de datos
hacia una instancia de [MongoDB](https://www.mongodb.com/).

## Instalación en Heroku

La aplicación cuenta con un [`Procfile`](Procfile) pensado para automatizar la instalación
hacia Heroku. Para ver los detalles sobre ese proceso accede
[aquí](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction).

## Producción

Para instalación en producción recomendamos utilizar un manejador de procesos como
[pm2](https://github.com/Unitech/pm2).
