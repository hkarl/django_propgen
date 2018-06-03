"""
This script sets the intended hostname of the deployment in the appropriate files *before* docker composition
It will add the hostname to the list of django's allowed hosts and set the API endpoint of the frontend
"""

import os
import re
import sys

if len(sys.argv) < 2:
    print('Usage: %s <hostname> [http|https]')
    sys.exit(1)

host = sys.argv[1]

if len(sys.argv) > 2:
    protocol = sys.argv[2]
else:
    protocol = 'http'

dirname = os.path.dirname(os.path.abspath(__file__))
os.chdir(dirname)

with open('django/django_propgen/settings.py', 'r+') as django_settings:
    settings_data = re.sub('ALLOWED_HOSTS = \[(.+)\]', 'ALLOWED_HOSTS = [\'%s\']' % host, django_settings.read())
    django_settings.seek(0)
    django_settings.write(settings_data)
    django_settings.truncate()

with open('ng-propgen/src/environments/environment.prod.ts', 'r+') as ng_environment:
    env_data = re.sub('backend: \'(.+)\'', 'backend: \'%s://%s\'' % (protocol, host), ng_environment.read())
    ng_environment.seek(0)
    ng_environment.write(env_data)
    ng_environment.truncate()

print('Host set to %s' % host)
print('API endpoint set to %s://%s' % (protocol, host))
