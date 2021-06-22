# printii
Standard way of printing ascii art for your projects.

## Install

`npm install --save printii`

## Usage

Save your ascii art on a file named:

`ascii-art.txt`

When calling *printii* from the same dir where the file is stored, just do:

```
const printii = require('printii')(__dirname)
printii()
```

If it's one level above update your path accordingly:

```
const path = require('path')
const printii = require('printii')(path.join(__dirname, '../'))
```


Enjoy!
