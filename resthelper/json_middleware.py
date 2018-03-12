from django.db.models import QuerySet, Model
from rest_framework.renderers import JSONRenderer


class JSONSerializerMiddleware:
    """
    This middleware injects after constructing the response data but before rendering the template.
    It checks if the requested output format is JSON and if so runs the response data through a serializer
    determined by the controller.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_template_response(self, request, response):
        if response is not None and hasattr(response, 'accepted_renderer') and isinstance(response.accepted_renderer,
                                                                                          JSONRenderer):
            data = response.data
            new_data = {}
            try:
                serializer = data['serializer']

                for key in data:
                    if key == 'serializer':
                        # 'serializer' field gets stripped out
                        continue
                    if isinstance(data[key], QuerySet):
                        # multiple objects, have to tell the serializer
                        d = serializer(instance=data[key], many=True).data
                        new_data.update({key: d})
                    elif isinstance(data[key], Model):
                        # single object
                        d = serializer(instance=data[key]).data
                        new_data.update({key: d})
                    else:
                        # unknown type, simply copy over
                        new_data.update({key: data[key]})
                response.data = new_data
            except KeyError:
                print('No serializer specified, cannot parse to JSON')
            except TypeError:
                # data is some type we do not care about
                pass
        return response
