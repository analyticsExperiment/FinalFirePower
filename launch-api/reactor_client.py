"""Local Reactor client. Credentials stay in memory and are never saved to evidence."""
from pathlib import Path
import json
import os
import urllib.error
import urllib.parse
import urllib.request

BASE = Path(__file__).resolve().parent


def load_env():
    values = dict(os.environ)
    for line in (BASE / '.env').read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in '\"\x27':
            value = value[1:-1]
        values.setdefault(key.strip(), value)
    return values


class Reactor:
    def __init__(self):
        self.env = load_env()
        self.origin = 'https://reactor.adobe.io'
        mode = self.env.get('ADOBE_AUTH_MODE', 'oauth_server_to_server')
        if mode == 'access_token':
            self.token = self.env.get('ADOBE_ACCESS_TOKEN', '')
        else:
            required = ['ADOBE_CLIENT_ID', 'ADOBE_CLIENT_SECRET', 'ADOBE_SCOPES']
            if any(not self.env.get(k) for k in required):
                raise RuntimeError('Missing OAuth credential fields in .env')
            body = urllib.parse.urlencode({
                'grant_type': 'client_credentials',
                'client_id': self.env['ADOBE_CLIENT_ID'],
                'client_secret': self.env['ADOBE_CLIENT_SECRET'],
                'scope': self.env['ADOBE_SCOPES'],
            }).encode()
            req = urllib.request.Request('https://ims-na1.adobelogin.com/ims/token/v3', body,
                {'Content-Type': 'application/x-www-form-urlencoded'}, method='POST')
            try:
                with urllib.request.urlopen(req, timeout=45) as response:
                    result = json.load(response)
            except urllib.error.HTTPError as error:
                raw = error.read().decode(errors='replace')
                try:
                    details = json.loads(raw)
                    message = str(details.get('error', '')) + ': ' + str(details.get('error_description', ''))
                except ValueError:
                    message = 'Adobe did not return a JSON error description'
                for key in ['ADOBE_CLIENT_ID', 'ADOBE_CLIENT_SECRET', 'ADOBE_SCOPES']:
                    if self.env.get(key):
                        message = message.replace(self.env[key], '[REDACTED]')
                raise RuntimeError(f'OAuth authentication failed: HTTP {error.code}: {message}') from None
            self.token = result.get('access_token', '')
        if not self.token:
            raise RuntimeError('No access token available')
        self.headers = {
            'Authorization': 'Bearer ' + self.token,
            'x-api-key': self.env.get('ADOBE_CLIENT_ID', ''),
            'x-gw-ims-org-id': self.env.get('ADOBE_ORG_ID', ''),
            'Accept': 'application/vnd.api+json;revision=1',
            'Content-Type': 'application/vnd.api+json',
        }

    def request(self, path, method='GET', payload=None):
        url = path if path.startswith('https://') else self.origin + path
        if urllib.parse.urlparse(url).netloc != 'reactor.adobe.io':
            raise RuntimeError('Refusing to send Reactor credentials to another host')
        body = None if payload is None else json.dumps(payload).encode()
        req = urllib.request.Request(url, body, self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                raw = response.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as error:
            raw = error.read().decode(errors='replace')
            for value in [self.token, self.env.get('ADOBE_CLIENT_SECRET', '')]:
                if value:
                    raw = raw.replace(value, '[REDACTED]')
            raise RuntimeError(f'{method} {path}: HTTP {error.code}: {raw[:2500]}') from None

    def get(self, path):
        return self.request(path)

    def all(self, path):
        items = []
        separator = '&' if '?' in path else '?'
        page = 1
        while True:
            result = self.get(path + separator + urllib.parse.urlencode({'page[size]': 100, 'page[number]': page}))
            items.extend(result.get('data', []))
            pagination = result.get('meta', {}).get('pagination', {})
            if page >= pagination.get('total_pages', 1):
                return items
            page += 1


def save(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n')


def rel_id(resource, relationship):
    value = resource.get('relationships', {}).get(relationship, {}).get('data')
    return value.get('id') if isinstance(value, dict) else None
