# Impact 

## Expected impacts 

We use this part to demonstrate some citation commands. 

### Cross-referencing a figure: 

As we highlighted already in  [@fig:tikzexample]


### Citing bibliographic sources 

Note that the keys used here have to be present in one of the bibliography files, else no reference can be produced. 

Basic approach: add an @ in front of the citation key, and you are all set. They get turned into LaTeX natbib citation commands (see [Natbib documentation](https://www.ctan.org/pkg/natbib?lang=en) for details). 


* A simple citation, no parentheses:    @nunes2014survey. This produces a natbib citet command. In default settings, this produces the first author name, et al., and the reference number in square brackets. Nice to use in a sentence. 
* A simple citation, with parentheses around: [@nunes2014survey]. This turns into a natbib citep command. As a result, you just get the reference number in square brackets. 
* You can have multiple citations in one spot:  [@nunes2014survey; @foster2013languages]  (note the semicolon to separate them!) 
* Point to a particular section of page of a reference: [@nunes2014survey, pp. 2--3]
* This works also with multiple citations:  [see @nunes2014survey, pp. 2--3 but also @foster2013languages, Section 2]
* If you just want the year of a reference in a square bracket (not overly useful): [-@nunes2014survey]


    
    