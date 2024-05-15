FROM python:3.9

# Install required packages
RUN pip install pyftpdlib flask flask-cors

# Set up FTP server
RUN mkdir /ftp
RUN echo "from pyftpdlib.authorizers import DummyAuthorizer\n\
from pyftpdlib.handlers import FTPHandler\n\
from pyftpdlib.servers import FTPServer\n\
\n\
authorizer = DummyAuthorizer()\n\
authorizer.add_anonymous('/ftp')\n\
handler = FTPHandler\n\
handler.authorizer = authorizer\n\
server = FTPServer(('0.0.0.0', 21), handler)\n\
server.serve_forever()" > /ftp/server.py

# Copy videos directory
COPY videos /ftp/videos

# Set up API server
WORKDIR /app
COPY api.py /app

# Expose ports for FTP and API
EXPOSE 21 5000

# Run both servers
CMD python /ftp/server.py & python /app/api.py