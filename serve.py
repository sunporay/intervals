#!/usr/bin/env python3
"""Serve only the presentation's static files from this machine."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import mimetypes
from pathlib import Path
from urllib.parse import unquote, urlsplit


class PresentationHandler(SimpleHTTPRequestHandler):
    def list_directory(self, path):
        self.send_error(404, "Not found")
        return None

    def send_head(self):
        # Keep dotfiles, parent paths and symlinks outside the published tree
        # inaccessible, even if a local file is added later.
        parts = unquote(urlsplit(self.path).path).split("/")
        target = Path(self.translate_path(self.path)).resolve()
        root = Path(self.directory).resolve()
        if any(part.startswith(".") for part in parts if part) or (target != root and root not in target.parents):
            self.send_error(404, "Not found")
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parent / "dist")
    args = parser.parse_args()
    root = args.directory.resolve()
    if not (root / "index.html").is_file():
        parser.error("The published directory must contain index.html")
    mimetypes.add_type("image/webp", ".webp")
    handler = partial(PresentationHandler, directory=str(root))
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        print("Serving {} on http://{}:{}/".format(root, args.bind, args.port), flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
