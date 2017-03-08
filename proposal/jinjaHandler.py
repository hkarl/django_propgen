"""Collect all functionality related to jinja2 templates in one class."""

import jinja2

from pprint import pprint as pp
import os, re
import math

import proposal.models
import inspect
import django.db


class JinjaFilters():
    """Collect a couple of hopefully useful Jinja filters"""

    def get_filters():
        """Return a dict mapping filter names to functions 
        """
        filters = {}
        filters['compactGantts'] = JinjaFilters.compactGantts
        filters['fieldfilter'] = JinjaFilters.fieldfilter
        filters['unique'] = JinjaFilters.unique
        filters['groupBy'] = JinjaFilters.groupBy
        filters['lookup'] = JinjaFilters.lookup
        filters['map2'] = JinjaFilters.map2
        # filters['mapReduce'] = JinjaFilters.utils.mapReduce
        # filters['roundPie'] = JinjaFilters.utils.roundPie
        filters['fieldfilterPositive'] = JinjaFilters.fieldfilterPositive
        filters['listBoldfacer'] = JinjaFilters.listBoldfacer
        filters['formatListofTuples'] = JinjaFilters.formatListofTuples
        filters['formatListofDicts'] = JinjaFilters.formatListofDicts
        filters['conditionalFormat'] = JinjaFilters.conditionalFormat
        filters['conditionalFormatDict'] = JinjaFilters.conditionalFormatDict
        filters['sortNumerically'] = JinjaFilters.sortNumerically
        filters['floor'] = JinjaFilters.jinjaFloor
        filters['ceiling'] = JinjaFilters.jinjaCeiling
        # globals['utils'] = JinjaFilters.utils
        # globals['zip'] = JinjaFilters.zip

        return filters
        

    def fieldfilter(listofdict, field, value):
        try:
            tmp = [x for x in listofdict if value in x[field]]
        except TypeError:
            tmp = [x for x in listofdict if x[field] == value]
            #  print field, value, tmp
        return tmp

    def fieldfilterPositive(listofdict, field):
        tmp = [x for x in listofdict if x[field] > 0]
        return tmp

    def formatListofDicts(somelist, formatstr):
        return [formatstr.format(**x) for x in somelist]

    def formatListofTuples(somelist, formatstr):
        return [formatstr.format(*x) for x in somelist]

    def conditionalFormat(someList, formatstr, value, outkey=False, testkey=False):
        if testkey:
            return [formatstr.format(x[outkey]) if x[testkey] == value else x[outkey]
                    for x in someList]
        else:
            return [formatstr.format(x) if x == value else x
                    for x in someList]

    def sortNumerically(somelist, fieldname):
        return sorted(somelist, key=lambda k: int(k[fieldname]))

    def jinjaFloor(somelist):
        try:
            return [int(math.floor(x)) for x in somelist]
        except:
            return int(math.floor(somelist))

    def jinjaCeiling(somelist):
        try:
            return [int(math.ceil(x)) for x in somelist]
        except:
            return int(math.ceil(somelist))

    def listBoldfacer(someList, keyvalue, formatstr):
        return ["\\textbf{" + x + "}"
                if x == keyvalue else x for x in someList]

    def conditionalFormatDict(someDict, filterkey, filterlist, formatstr, flag=False, formatstr2=False):
        ## pp (someDict)
        ## print filterkey
        ## print filterlist
        ## print formatstr
        ## print [x[filterkey] for x in someDict]
        if formatstr2:
            tmp = [(formatstr2.format(**x) if x[filterkey] == flag else
                    formatstr.format(**x))
                   for x in someDict if x[filterkey] in filterlist]
        else:
            tmp = [formatstr.format(**x) for x in someDict if x[filterkey] in filterlist]
        ## print tmp
        return tmp

    def compactGantts(l):
        global data

        inputlist = sorted(l, key=lambda x: int(x['Month due']))

        maxNumLines = len(inputlist)
        projectDuration = int(data['mainData']["Duration"])

        occupancyMatrix = [[False for i in range(projectDuration + 1)] for j in range(maxNumLines)]

        for entry in inputlist:
            # search the first line where the month of this entry is not yet occupied
            line = 0
            while occupancyMatrix[line][int(entry['Month due'])] == True:
                line += 1

            entry['ganttLine'] = line

            for m in range(int(entry['Month due']), \
                           min(int(projectDuration) + 1,
                               int(entry['Month due']) + int(data['config']["Gantts"]['ganttDistanceBetweenMS']))):
                occupancyMatrix[line][m] = True

        return inputlist

    def unique(l):
        return list(set(l))

    def groupBy(l, k, kf, vf):
        """input:
        l: list of dicts
        k: list of group values to be used for the key field
        kf: which field to use for keys
        vf: which field to use as value
        output:
        return list of pairs of (key value, list of values)
        """

        return [(kk, [x[vf] for x in l
                      if x[kf] == kk
                      ])
                for kk in k]

    def lookup(l, d, lookupkey, valuekey, fct=None):
        import copy

        if isinstance(fct, str):
            fct = eval(fct)

        # print lookupkey
        # print valuekey
        r = []
        for ll in l:
            tmp = copy.copy(ll)
            if fct:
                tmp[valuekey] = fct(ll, d[tmp[lookupkey]])
            else:
                tmp[valuekey] = d[tmp[lookupkey]][valuekey]
            r.append(tmp)
        return r

    def map2(l, k1, k2):
        k1list = k1.split('.')
        k2list = k2.split('.')

        retval = [(reduce(lambda d, k: d[k], k1list, x),
                   reduce(lambda d, k: d[k], k2list, x),)
                  for x in l]

        # print retval

        return retval

class PropgenException(Exception):
    pass

class PropgenTemplateException(PropgenException):

    def __init__(self, message):
        self.message = message



class JinjaHandler():

    def get_models(self):
        """Take all the models from proposal,
        put them into a dictionary to be passed into
        the jinja2 template renderer.
        Both as a list and as dict by key,
        specificed in models.py with classattribute dictkey"""

        data = {}

        models = inspect.getmembers(
            proposal.models,
            lambda c: (inspect.isclass(c) and
                       issubclass(c, django.db.models.Model)
                       )
        )

        # pp(models)
        for modelname, modelclass in models:
            objs = modelclass.objects.all()
            data[modelname] = objs
            data[modelname + 'Dict'] = {}

            try:
                dictkey = modelclass.dictkey
                for o in objs:
                    # self.data[modelname + 'Dict'][]
                    handler = o.__getattribute__(dictkey)
                    data[modelname + 'Dict'][handler] = o
            except AttributeError:
                pass
            except Exception as e:
                print(e)
                pass

        return data


    def get_renderer(self):
        renderer = jinja2.Environment(
            # comment_start_string = "{###",
            # comment_end_string = "###}",
            trim_blocks = True,
            lstrip_blocks = True,
            # block_start_string = '///%', # default: {%
            # block_end_string = '%///',
            # variable_start_string = '///', # default: {{
            # 1variable_end_string = '///', # default: }}
        )

        renderer.filters.update(JinjaFilters.get_filters())
        return renderer

    def __init__(self):
        self.data = self.get_models()
        self.renderer = self.get_renderer()


    ###########################



    def render(self, template):
        """Render a template against the DB content.
        TODO: use messages framework to report errors!"""
        rendered = ""
        retval = ""

        # print("data: ", type(self.data), self.data)
        try:
            ltemplate = self.renderer.from_string(template.template)
            rendered = ltemplate.render(self.data)
            print("rendered type: ", type(rendered))
            return rendered
        except jinja2.TemplateSyntaxError as e:
            # print e.message
            # print e.lineno
            retval = (template.name + ': Template Syntax Error, ' + e.message + " at line " + str(e.lineno))

        except jinja2.TemplateAssertionError as e:
            # print e.message
            # print e.lineno
            retval = (template.name + ': Template Assertion Error, ' + e.message + " at line " + str(e.lineno))
        except jinja2.TemplateError as e:
            retval = (template.name + ': Template Error, ' + e.message)
        except Exception as e:
            retval = "Jinja2: Someting wrong at template: " + template.name + " exception: " + e.__class__.__name__

        raise PropgenTemplateException(retval)

