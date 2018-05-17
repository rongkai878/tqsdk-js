# -*- coding: utf8 -*-
__author__ = 'yangyang'

import json
import logging
import tornado.ioloop
import tornado.web
import tornado.httpserver
from wh.whconvert import wenhua_translate


logging.basicConfig(
    level=logging.INFO,
    # filename="/var/log/tatranslator.log",
    filename="c:\\tmp\\tatranslator.log",
    # filemode="w",
    format='%(asctime)-15s %(message)s'
)
logger = logging.getLogger()


class WenhuaTranslate(tornado.web.RequestHandler):
    def post(self):
        s = self.request.body.decode("utf-8")
        logger.info("wenhua translate start, input=%s", s)
        req = json.loads(s)
        self.set_header("Access-Control-Allow-Origin", "*")
        code, errors = wenhua_translate(req)
        logger.info("wenhua translate finish, output=%s, errors=%s" % (code, json.dumps(errors, indent=2)))
        self.finish({
            "code": code,
            "errors": errors,
        })

    def options(self, *args, **kwargs):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.finish()


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/convert/wh", WenhuaTranslate),
        ]
        settings = {
        }
        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == "__main__":
    server_settings = {
        "xheaders": True,
    }
    application = Application()
    application.listen(8000, **server_settings)
    tornado.ioloop.IOLoop.instance().start()