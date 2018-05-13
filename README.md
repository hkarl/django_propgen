# Django-propgen 
Django-propgen is a web based platform for assisting the creation, editing and maintenance of European research project proposal. Django-propgen allows users to  define the main building blocks of an EU research project proposal (e.g. partners' description, project description, SoA, per-partner effort allocation, etc...) and to automatically generate the latex source files and build the final PDF documents. Django-propgen supports mark down text editing and preview, cross reference definition and user friendly tabular data input for budget and effort definition. 

Django-prpogen can be deployment support two possible scenario. **1. Standalone**: the platform back-end and front-end can be installed on a physical Linux server and interact with separated databases and web servers; **2. Docker container**: the entire platform it can be executed in a docker container environment that provides all the SW components. This documentations focuses on the docker container scenario although it gives brief instructions to how deploy Django-propogen on a physical server outside a docker environment. 

## Component description
The django-propgen docker composition consists of the following components:
* A Python/Django based back-end (BE)
* An angular front-end (FE)
* A MySQL database (DB)
* A nginx (+ uwsgi) web server (WS)

### Django-propgen back-end
The Django-propgen BE is built on top of the Django framework, version 1.10. Among several dependences, the Django-propgen BE makes use of django-markdownx (for the markdown syntax rendering), djangorestframework (for the REST APIs implementation) and pandoc (both as python library and external binary for cross-reference resolution and latex source creation). The complete list of depences is specified in the file `requirements.txt`. 

### Django-propgen front-end
The Django-propgen FE is based on  Angular JS, and in particular it has been built with Angular CLI, (version 1.6). The FE implements a WEB graphical user interface and interacts with the BE through the REST APIs implemented in the BE.

### Django-propgen database and web server
 The Django-propgen platforms needs two external components:
* A web server (with WSGI application support)
* A database for data storing

## Django-propgen docker composition
The Django-propgen platform comes with a fully integrated docker composition, which consists of 4 services:
* propgen-be
* propgen-fe
* propgen-lb
* propgen-db

### Detailed description
#### propgen-be
The propgen-be service implements the django-propgen back end. The following excerpts is the `docker-composition.yml` section responsible for the propgen-be service. 

```
propgen-be:
	build: ./django/
	command: [bash, "-c", "./post_build_setup.sh && uwsgi --socket :8000 --module django_propgen.wsgi"]
	volumes:
		- ./django/static/:/code/static
		- ./django/media/:/code/media

	depends_on:
		- propgen-db
```

When the composition is built, the docker image contained in the `django/` directory is built according to the following docker file

```
FROM python:3
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code

# installing python requirements"
ADD conf/requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/

# installing texlive
RUN apt-get update
RUN apt-get install -y texlive-latex-base  texlive-latex-recommended texlive-fonts-recommended  texlive-latex-extra

# cloning a working pandoc sandbox
ENV PATH /pandoc/.cabal-sandbox/bin:$PATH
RUN mv pandoc/ /pandoc

WORKDIR /code
RUN  rm -f .post_build_setup_done
```

The propgen-be docker image compilation performs the following operation:

* the python 3 docker image is downloaded and used as starting point
* `/code` directory is created in the image file system to store the content of the `django/` directory in the host operating system.
* the python dependencies are installed thorugh `pip`
* some debian packages required for the latex source files creation are installed are installed through apt-get
* pandoc is installed by cloning the content of cabal sandbox externally created. Unfortunately, in the current django-propgen composition some dependencies errors make impossible to install pandoc though cabal.
* a hidden file `.post_build_setup_done` is deleted. This is done in order to run a post build setup script (required to set-up the django environment) every time the docker composition is built

At the end of the first boot of the docker container the following script is executed: 
```
if [ -f .post_build_setup_done ];
  then
    echo "post build setup already done"
  else
    echo "sleeping 20 seconds"
    sleep 20

    echo "collect static files"
    python manage.py collectstatic --no-input

    echo "prepare and apply django migrations"
    python manage.py makemigrations && python manage.py migrate

    echo "installing fixtures"
    python manage.py loaddata proposal/fixtures/project.json
    python manage.py loaddata proposal/fixtures/settings.json
    python manage.py loaddata proposal/fixtures/template.json
    python manage.py loaddata proposal/fixtures/textblock.json
    python manage.py loaddata proposal/fixtures/proposal.json
    touch .post_build_setup_done

    echo "create super user"
    echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', '', 'admin')" | ./manage.py shell
fi
```

This script perform the following operations:
* it sleeps 20 seconds to wait for the propgen-db service initialization
* it collects the django static files
* it prepares and executes the django migrations
* it loads a set of initial data 
* it creates an empty file `.post_build_setup_done` as indication of the successful post compilation set-up
* it creates a "dummy" django super user for first access into the django admin panel. If needed, a stronger password can be set through the django manage.py tool.

At the end of every boot, the following command is executed to launch the uwsgi handler responsible for running the django project. Note that this is required because nginx does not support wsgi web application. This process will communicate with the nginx webserver (running in a separate container) through standard socket (port 8000). In conclusion, the propgen-be container exposes two volumes (/code/media and /code/static). No port forwarding is configured as this container will only communicate with the DB and WS containers through "inter-container communication".

The django application DB configuration can be found in the file `django/django_propgen/setup.py` and it is reported below

```
DATABASES = {
    'default' : {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django_propgen',
        'USER': 'django_propgen',
        'PASSWORD': 'django_propgen',
        'HOST': 'propgen-db',
        'PORT': '3306',
    }
}
```

**Note:** 'propgen-db' is the host name of the docker container running the django-propgen MySQL DB. 

#### propgen-fe
The propgen-fe service implements the django-propgen front end. The following excerpts is the docker-composition.yml section responsible for the propgen-fe service.

```
propgen-fe:
	build: ./ng-propgen
	ports:
	       - "48484:80"
```


When the composition is built, the docker image contained in the `ng-propgen/` directory is built according to the following docker file

```
# section 1
FROM johnpapa/angular-cli as angular
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm install
RUN npm run build -- --prod --environment prod

# section 2
FROM nginx
COPY --from=angular /code/dist/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
```

This docker file consists of 2 sections:
* section 1 is responsible for building the angular-cli project implementing the Django-propgen front end
* section 2 is responsible for creating a docker container running a nginx web server that serves the django-propgen FE


Such operations are executed on the Docker image `johnpapa/angular-cli`. Note that the resulting Docker image can be "trashed" after creating building the Angular project. Indeed, in section 2, the content of `/code/dist/` is copied in a new Docker image (`nginx`) that will actually execute the `nginx` web server hosting the propgen front end. The `nginx` web server relies on the following virtual host configuration file, `./nginx-custom.conf` which is copied in the path `/etc/nginx/conf.d/default.conf` on the new Docker image.

This container communicates with the propgen-lb (see next section). The relevant "backend address" configuration can be found in `ng-propgen/src/environments/environment.prod.ts`. Note that since the angular application is executed in the browser, the backend needs to be accessed from outside the docker container world. In the default deployment scenario (in which the docker composition is executed on the same host machine), the backend endpoint is 127.0.0.1:80. The docker image hosting the nginx backend server, will need to expose port 80 (see next section). 

#### propgen-lb
The propgen-lb service implements a nginx based web server that is placed between the propgen FE and BE. It serves the web requests from the propgen front end and interact with the django wsgi application hosted in the propgen-be container. In future developments, this container could act as a load balancer. Despite the name, in the latest platform version, this container only interact with one instance of the Django-propgen BE.  The following excerpts is the docker-composition.yml section responsible for the propgen-lb service.

```
propgen-lb:
	image: nginx
	ports:
		- "80:8091"
	volumes:
		- ./nginx/conf/my_vhost.conf:/etc/nginx/conf.d/django_propgen.conf
		- ./nginx/conf/uwsgi_params:/etc/nginx/uwsgi_params
		- ./django/static/:/var/static/
		- ./django/media/:/var/media/
	command: [nginx, '-g', 'daemon off;']
	depends_on:
		- propgen-be
```

This service is based on the `nginx` docker image with no extra set-up or additional package installation. Two configuration files are needed:
* uwsgi parameter file (needed by the uwsgi executable) `django/conf/uwsgi_params` 
* nginx virtual host configuration `django/nginx/my_vhost.conf`  (listed below)

```
# the upstream component nginx needs to connect to
upstream django {
    server propgen-be:8000;
}

# configuration of the server
server {
    # the port your site will be served on
    listen      8091;
    # the domain name it will serve for
    #server_name django_propgen.example.com; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        alias /var/media;  # your Django project's media files - amend as required
    }

    location /static {
        alias /var/static; # your Django project's static files - amend as required
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     /etc/nginx/uwsgi_params;
    }
}
```

The upstream `django` server is propgen-be:8000, where propgen-be is the hostname of the container executing the uwsgi executable to server the django wsgi application. The upstream server is responsible for serving the location `/`. The static and media file are instead hosted locally and copied at first boot from the BE container.  

#### propgen-db
The propgen-db service implements the django-propgen MySQL database. The following excerpts is the `docker-composition.yml` section responsible for the propgen-db service.

```
propgen-db:
	build: ./mysql
	env_file:
		- ./mysql/conf/env
```

This container is basically a common `mysql` Docker image with post installation setup `mysql/conf/env`
 
### Building and running
To build and run the docker composition execute the following command:

```
docker-compose up --build
```

To test the platform open a browser and connect to `http://127.0.0.1:48484/`


## Standalone deployment scenario
The django-propgen platform can be deployed in a physical server environment outside the docker virtualization environment by performing the following actions:

1. prepare the backend database
2. build the angular project
3. configure the django project
4. configure a web server

As starting point, one can still clone this repository and prepare the environment without Docker. This section gives a brief overview of the required steps with particular focus on the configuration parameters that has to be changed from the configuration files in the docker composition. 

### Configure the DB
As for any django project, different DB technologies can be used (e.g. SQLite, Postgres, MySQL, etc..). There are no particular requirements for the DB to be used with the django BE as long as the relevant configuration setting is properly configured in the `settings.py` file.  

### Build the angular FE
Building the frontend does not require anything special besides the requirements for building any Angular application:
1. The image needs at least node 6.9.x and npm 3.x.x installed
2. Among several dependencies, the image needs to have the Angular CLI (version > 1.6.0) installed 
3. Execute `npm install` once to install the dependencies listed in `package.json`
4. To build the angular project we need to run `npm run build -- --prod --environment prod`
5. In production mode a web server is needed to serve a virtual host whose root directory is the output directory of the `npm run build`

Alternatively the FE can be tested in development mode by running
`ng server --port $PORT --host 0.0.0.0`

Differently from the configuration file in the docker composition, to properly run the propgen BE we need to specify the backend (address:port) in the files: `ng-propgen/src/environments/environment.prod.ts` and `ng-propgen/src/environments/environment.ts`


### Set-up the django BE
To set-up the django BE the following commands are required:
1. collect the static files
```
python manage.py collectstatic --no-input
```
The static root URL and the output directory of this command can be configured with the configuration key `STATIC_ROOT` `STATIC_URL` in the `settings.py` file. 

2. apply migrations (with the first initialization migration)
```
python manage.py makemigrations && python manage.py migrate
```

3. load the following fixtures
```
python manage.py loaddata proposal/fixtures/project.json
python manage.py loaddata proposal/fixtures/settings.json
python manage.py loaddata proposal/fixtures/template.json
python manage.py loaddata proposal/fixtures/textblock.json
python manage.py loaddata proposal/fixtures/proposal.json
```

4. for testing, one can run a development server with 
```
python manage.py runserver 0.0.0.0:$PORT 
```

### Configure a web server virtual host
In production scenarios, one might want to create a virtual host in an external web server to handle the application wsgi. Several options are available. In case of webservers supporting wsgi applications (e.g. apache2) no external applications are required. In case of web servers not supporting wsgi applications, external wsgi servers are required (e.g. nginx + gunicorn, nginx + uwsgi).

**Note** that django-propgen requires a pandoc-crossref  binary already installed on the system. The path of the executable can be configured in `settings.py` (see `default_settings['pandoc']['filter']`).


## Built With
* [Django 1.14] (https://cli.angular.io)
* [Angular CLI 1.6] (https://cli.angular.io)
* [Docker] (https://docker.com)

## Authors
* **Holger Karl** - *Concept, first working version, project leader* - (https://github.com/hkarl)
* **Christian Stroehmeier** - *Angular Front End* - (https://github.com/lordjimbeam)
* **Marco Bonola** - *Docker environment* - (https://github/marcobonola)

## License

## Acknowledgments
