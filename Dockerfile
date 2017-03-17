FROM python:3.5
ENV PYTHONUNBUFFERED 1
LABEL version="0.1"
LABEL maintainer="Holger Karl"
RUN apt-get update 
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/
# Install Haskell directly: 
# ENV PATH "$PATH:/root/.local/bin"
# RUN mkdir /code/haskell
# WORKDIR /code/haskell
# RUN curl -sSL https://get.haskellstack.org/ | sh
#
# Alternative: install similar to: https://github.com/freebroccolo/docker-haskell/blob/5f1ae82bd27501322100b915c9ae6cc9f9aea129/8.0/Dockerfile
RUN echo 'deb http://ppa.launchpad.net/hvr/ghc/ubuntu trusty main' > /etc/apt/sources.list.d/ghc.list  
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys F6F88286 ; apt-get update 
RUN apt-get install -y --no-install-recommends cabal-install-1.24 ghc-8.0.2 happy-1.19.5 alex-3.1.7 \
            zlib1g-dev libtinfo-dev libsqlite3-0 libsqlite3-dev ca-certificates g++ git curl 
RUN curl -fSL https://github.com/commercialhaskell/stack/releases/download/v1.3.2/stack-1.3.2-linux-x86_64-static.tar.gz -o stack.tar.gz && \
    curl -fSL https://github.com/commercialhaskell/stack/releases/download/v1.3.2/stack-1.3.2-linux-x86_64-static.tar.gz.asc -o stack.tar.gz.asc && \
    apt-get purge -y --auto-remove curl && \
    export GNUPGHOME="$(mktemp -d)" && \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys C5705533DA4F78D8664B5DC0575159689BEFB442 && \
    gpg --batch --verify stack.tar.gz.asc stack.tar.gz && \
    tar -xf stack.tar.gz -C /usr/local/bin --strip-components=1 && \
    /usr/local/bin/stack config set system-ghc --global true && \
    rm -rf "$GNUPGHOME" /var/lib/apt/lists/* /stack.tar.gz.asc /stack.tar.gz

ENV PATH /root/.cabal/bin:/root/.local/bin:/opt/cabal/1.24/bin:/opt/ghc/8.0.2/bin:/opt/happy/1.19.5/bin:/opt/alex/3.1.7/bin:$PATH

# Acutal pandoc installation:
## Option 1, via stack; fails with data-accessor-template must match >=0.2.1.12 && <0.3.0.0, but the stack configuration has no specified version
# RUN stack install pandoc pandoc-citeproc pandoc-crossref

## Option 2, via cabal: 
RUN mkdir /pandoc
WORKDIR /pandoc
RUN cabal update
RUN cabal sandbox init
RUN cabal install pandoc-crossref
RUN cabal install pandoc-citeproc

EXPOSE 8901
WORKDIR /code 
CMD python manage.py runserver 0.0.0.0:8901
