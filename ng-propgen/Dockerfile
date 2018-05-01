FROM johnpapa/angular-cli as angular
#RUN mkdir /code
#WORKDIR /code
#ADD . /code/
#RUN npm install -g @angular/cli 
#RUN npm install -g @angular-devkit/core    
#RUN npm install 
#EXPOSE 4200
#CMD ["ng", "serve"] 


RUN mkdir /code
WORKDIR /code
ADD . /code/
#RUN npm install -g @angular-devkit/core    
RUN npm install

#CMD ["ng","serve","--port","48484", "--host", "0.0.0.0"]
RUN npm run build -- --prod --environment prod


FROM nginx
COPY --from=angular /code/dist/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
