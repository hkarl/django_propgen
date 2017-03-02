FROM python:3.5
ENV PYTHONUNBUFFERED 1
LABEL version="0.1"
LABEL maintainer="Holger Karl"
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/
EXPOSE 8901
CMD python manage.py runserver 0.0.0.0:8901
