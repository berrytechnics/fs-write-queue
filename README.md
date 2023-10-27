fs-write-queue is a simple wrapper around node's fs package that provides transactional writing of files.
This is done by writing all files to ./.tmp and once all are successful, moving them to the proper directories.

To use:

```
const FW = require('fs-write-queue');
const fileWriter = new FW();

const file = {
    path:'path/to/file',
    filename:'filename',
    data: '<p>Content here</p>'
}

fileWriter.add(file.path, file.filename, file.data);

fileWriter.process();
```