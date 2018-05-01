"""Collect all functionality related to jinja2 templates in one class."""

import jinja2

from pprint import pprint as pp
from collections import defaultdict
from functools import reduce
from itertools import groupby
from django.db.models.query import QuerySet
import os, re
import math

import proposal.models
import django_propgen.settings
import inspect
import django.db
import pypandoc


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
        filters['mapReduce'] = JinjaFilters.mapReduce
        filters['roundPie'] = JinjaFilters.roundPie
        filters['fieldfilterPositive'] = JinjaFilters.fieldfilterPositive
        filters['listBoldfacer'] = JinjaFilters.listBoldfacer
        filters['formatListofTuples'] = JinjaFilters.formatListofTuples
        filters['formatListofDicts'] = JinjaFilters.formatListofDicts
        filters['conditionalFormat'] = JinjaFilters.conditionalFormat
        filters['conditionalFormatDict'] = JinjaFilters.conditionalFormatDict
        filters['sortNumerically'] = JinjaFilters.sortNumerically
        filters['floor'] = JinjaFilters.jinjaFloor
        filters['ceiling'] = JinjaFilters.jinjaCeiling
        filters['pandoc'] = JinjaFilters.pandoc
        # globals['utils'] = JinjaFilters.utils
        # globals['zip'] = JinjaFilters.zip

        return filters
        
    def roundPie(l):

        s = sum([x[1] for x in l])

        unrounded = [int(100*x[1]/s) for x in l]
        # print("roundPie 1: ", l, unrounded)
        remainders = [x[1] - int(x[1]) for x in l]

        while sum(unrounded) < 100:
            # find the largest remainder and round that index up
            largestInd = remainders.index(max(remainders))
            remainders[largestInd] = 0
            unrounded[largestInd] += 1


        # print("roundPie: ", l, unrounded)
        return [ (ll[0], val)
            for ll, val in zip(l, unrounded)
        ]

    def mapReduce(l, fct):
        # print("mapReduce1: ", l, fct)
        fct = eval(fct)

        sortedlist = sorted(l, key=lambda k: k[0])
        # print("mapReduce2: ", sortedlist)

        groups = groupby(sortedlist, lambda x: x[0])

        r = []
        for g in groups:
            groupid = g[0]
            values = [x[1] for x in g[1]]
            tmp = reduce(fct, values)
            # print("mapReduce 2a: ", groupid, values, tmp)
            r.append((groupid, tmp))


        # print("mapReduce 3: ", r)
        return r

    def fieldfilter(listofdict, field, value):
        # print("fieldfilter: ", field, value, listofdict)
        try:
            tmp = [x for x in listofdict if value in x[field]]
        except TypeError:
            tmp = [x for x in listofdict if x[field] == value]

        # print (field, value, tmp)
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

    def listBoldfacer(someList, keyvalue=None):
        return ["\\textbf{" + x + "}"
                if keyvalue and (x == keyvalue) else x for x in someList]

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

        inputlist = sorted(l, key=lambda x: int(x.due))

        maxNumLines = len(inputlist)
        projectDuration = int(proposal.models.Project.objects.first().duration)

        occupancyMatrix = [[False for i in range(projectDuration + 1)] for j in range(maxNumLines)]

        for entry in inputlist:
            # search the first line where the month of this entry is not yet occupied
            line = 0
            while occupancyMatrix[line][int(entry.due)] == True:
                line += 1

            entry.ganttLine = line

            for m in range(int(entry.due), \
                           min(projectDuration + 1,
                               int(entry.due) +
                               int(proposal.models.Setting.get_default("Gantts", 'ganttDistanceBetweenMS'))
                               )):
                occupancyMatrix[line][m] = True

        # print("compactGantts: ", inputlist, [x.ganttLine for x in inputlist])
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
        def lookupdict(l, d, lookupkey, valuekey, fct):
            """This is mostly legay code; unlikely to be still needed.
            Remove!"""
            return None

            import copy
            print("lookup lookupkey: ", lookupkey)
            print("lookup valuekey: ", valuekey)
            r = []
            for ll in l:
                tmp = copy.copy(ll)
                print("lookup tmp: ", tmp, type(tmp))
                print("lookup d: ", d, type(d))

                searchkey = tmp[lookupkey]
                print("lookup searchkey: ", searchkey, type(searchkey))

                try:
                    # determine value to be inserted:
                    if isinstance(d, dict):
                        print("dict")
                        value = d[searchkey]
                    else:
                        value = searchkey.__getattribute__(valuekey)
                except Exception as e:
                    print(e)

                print(value)
                if fct:
                    tmp[valuekey] = fct(ll, value)
                else:
                    tmp[valuekey] = value[valuekey]
                r.append(tmp)
            return r


        if isinstance(fct, str):
            fct = eval(fct)

        if isinstance(d, dict):
            return lookupdict(l, d, lookupkey, valuekey, fct)

        # typical case: d is a model
        return None


    def map2(l, k1, k2):
        # print("map2: ", l, k1, k2)
        k1list = k1.split('.')
        k2list = k2.split('.')

        def getvalue(data, key):
            # print("getvalue: ", data, type(data), key)
            try:
                return data[key]
            except TypeError:
                return data.__getattribute__(key)
            except Exception:
                print("map2: don't know how to access {} at {}".format(
                    key, data
                ))
            return "XXX"

        retval = [(reduce(lambda d, k: getvalue(d, k), k1list, x),
                   reduce(lambda d, k: getvalue(d, k), k2list, x),)
                  for x in l]

        # print("map2 done: ", retval)

        return retval

    def pandoc(text, starred=False):

        # print("pandoc starred:", starred)

        r = pypandoc.convert_text(text,
                                  'latex', 'md',
                                  extra_args=['--chapters', ],
                                  )
        if starred:
            r = re.sub('subsubsection{', 'subsubsection*{', r)
            r = re.sub('paragraph{', 'paragraph*{', r)
            r = re.sub('subparagraph{', 'subparagraph*{', r)

        return r

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

        # deal with the singleton model Project separately:
        data['Project'] = proposal.models.Project.objects.first()
        data['ProjectDict'] = None

        # deal with the Setting model separately:
        data['Setting'] = defaultdict(dict)
        for k, v in django_propgen.settings.default_settings.items():
            data['Setting'][k].update(v)

        pp(data['Setting'])
        for s in proposal.models.Setting.objects.all():
            data['Setting'][s.group][s.name] = s.value

        # deal with the allEfforts list
        data['allEfforts'] = proposal.models.allEfforts().data

        return data


    def get_renderer(self):
        renderer = jinja2.Environment(
            comment_start_string = "{###",
            comment_end_string = "###}",
            trim_blocks = True,
            lstrip_blocks = True,
            block_start_string = '///%', # default: {%
            block_end_string = '%///',
            variable_start_string = '///', # default: {{
            variable_end_string = '///', # default: }}
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
            # print("rendered type: ", type(rendered))
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
            try:
                retval += "\n" + e.message
            except Exception:
                pass

        raise PropgenTemplateException(retval)

