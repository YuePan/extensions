import sys
import tornado.web
import tornado.wsgi
from tornado.escape import json_encode

auto_response = {
    "what": "a",
    "when": "b",
    "where": "c",
    "who": "d",
    "why": "e",
    "how": "f"
}

action_sites = [
    "weddingwire.com",
    "theknot.com",
    "davidsbridal.com",
    "brides.com",
    "weddingpaperdivas.com",
    "weddingchicks.com",
    "usmarriagelaws.com",
    "offbeatbridge.com",
    "marthastewartweddings.com",
    "bridalguide.com"
]

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        url = self.get_argument('u')
        query = self.get_argument('q')
        print('u=', url, '\nq=', query)
        message = ""
        if not query:
            message = "what are you going to do?"
        if query in auto_response:
            message = auto_response[query]
        while not message:
            message = input(':')
        response = {'data': message}
        self.write(json_encode(response))


class CheckHandler(tornado.web.RequestHandler):
    def get(self):
        url = self.get_argument('u')
        response = {"data": False}
        for site in action_sites:
            if url.find(site) > 0:
                response['data'] = True
                break
        self.write(json_encode(response))


application = tornado.web.Application([
    (r"/search?.*", MainHandler),
    (r"/check?.*", CheckHandler)
])


if __name__ == "__main__":
    #application.listen(8080)
    #tornado.ioloop.IOLoop.current().start()

    import wsgiref.simple_server
    wsgi_app = tornado.wsgi.WSGIAdapter(application)
    server = wsgiref.simple_server.make_server('', 8080, wsgi_app)
    server.serve_forever()
