 
import http.server
import socketserver
import os

# Define the port you want to use
PORT = 8080

# Change directory to where your HTML and JS files are located
os.chdir('src/')

# Create a simple HTTP request handler
Handler = http.server.SimpleHTTPRequestHandler

# Set up the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
