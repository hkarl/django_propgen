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

# installing pandoc
#ENV LANG C.UTF-8
#RUN echo 'deb http://ppa.launchpad.net/hvr/ghc/ubuntu trusty main' > /etc/apt/sources.list.d/ghc.list
#RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys F6F88286 ; apt-get update
#RUN apt-get install -y --no-install-recommends cabal-install-1.24 ghc-8.0.2 happy-1.19.5 alex-3.1.7  \
#            zlib1g-dev libtinfo-dev libsqlite3-0 libsqlite3-dev ca-certificates g++ 
#ENV PATH /code/pandoc/.cabal-sandbox/bin:/root/.cabal/bin:/root/.local/bin:/opt/cabal/1.24/bin:/opt/ghc/8.0.2/bin:/opt/happy/1.19.5/bin:/opt/alex/3.1.7/bin:$PATH

ENV PATH /pandoc/.cabal-sandbox/bin:$PATH
RUN mv pandoc/ /pandoc

WORKDIR /code
RUN  rm -f .post_build_setup_done
