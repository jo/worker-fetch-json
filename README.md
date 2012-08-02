# Worker Fetch JSON

A hoodie worker that fetches a remote JSON
and inserts it into a document.


## Installation


    npm install worker-fetch-json


## Per Database Configuration

Configuration is done in a worker configuration document inside the target database.
The worker looks at all databases and only process if there exists such a configuration file.

A configuration file might look like this:

    {
      "_id": "worker-config/fetch-json",
      "_rev": "1-a653b27246b01cf9204fa9f5dee7cc64",
      "url": "https://api.github.com/gists/%s"
    }

You can update the config live so that all future processings will take the new configuration.

The _url_ property specifies the source of the JSON.
You can use the placeholder `%s`, which will be replaced by the documents id.


## Worker Status Document

The worker stores a status document inside the target database.
The worker stores its last update seq here and can resume where it left off.

    {
      "_id": "worker-status/fetch-json",
      "_rev": "543-1922b5623d07453a753ab6ab2c634d04",
      "last_seq": 34176,
      "docs_processed": 145
    }


## Document Status Object

The worker updates a status object inside the document.
This makes it supereasy to monitor worker status as well as
it keeps a lock when many workers listen to the same database.

The status object of the worker could look like this:

    "worker_status": {
      "fetch-json": {
        "status": "completed"
      }
    }

The status field can be _triggered_, _completed_ or _error_.

The worker status is scoped by the worker name in order to have many workers
processing the same document.


## Running the Worker

To start, this needs either the following environment variables set:

    export HOODIE_SERVER=http://example.org
    npm start


or pass them to the commandline:

    HOODIE_SERVER=http://example.org npm start


## Example Session

    [jo@jolap worker-fetch-json]$ export HOODIE_SERVER=http://localhost:5984
    [jo@jolap worker-fetch-json]$ curl -XPUT $HOODIE_SERVER/gists
    {"ok":true}
    [jo@jolap worker-fetch-json]$ npm start
    > worker-fetch-json@0.0.1 start /home/jo/github/jo/worker-fetch-json
    > node index.js

    foo worker listening on http://localhost:5984/_replicator
    foo worker listening on http://localhost:5984/_users
    foo worker listening on http://localhost:5984/gists

in another terminal:

    [jo@jolap worker-fetch-json]$ export HOODIE_SERVER=http://localhost:5984
    [jo@jolap worker-fetch-json]$ curl -XPUT $HOODIE_SERVER/gists/worker-config%2ffetch-json \
    > -H 'Content-Type:application/json' \
    > -d '{ "url": "https://api.github.com/gists/%s" }'
    {"ok":true,"id":"worker-config/fetch-json","rev":"1-f8a7daaefe5332dedd528850ac58b800"}
    [jo@jolap worker-fetch-json]$ curl -XPUT $HOODIE_SERVER/gists/2387663 -H 'Content-Type:application/json' -d '{}'
    {"ok":true,"id":"2387663","rev":"1-967a00dff5e02add41819138abb3284d"}
    [jo@jolap worker-fetch-json]$ 

the terminal running the worker will show two new lines:

    http://localhost:5984/gists start: 2387663
    http://localhost:5984/gists finish: 2387663

now the doc looks like this:

    [jo@jolap worker-fetch-json]$ curl -XPUT $HOODIE_SERVER/gists/2387663
    {
       "_id": "2387663",
       "_rev": "3-3ea240efcad84ebf0b989ffb1ffa3dc2",
       "worker_status": {
           "fetch-json": {
               "status": "completed"
           }
       },
       "html_url": "https://gist.github.com/2387663",
       "created_at": "2012-04-14T20:03:53Z",
       "updated_at": "2012-04-14T20:03:53Z",
       "git_pull_url": "git://gist.github.com/2387663.git",
       "public": true,
       ...
       "forks": [
       ],
       "url": "https://api.github.com/gists/2387663",
       "description": "Welcome to TF",
       "id": "2387663",
       "comments": 0
    }

## Testing

Testing is done with Mocha. Run the tests with

    npm test



## License & Copyright

(c) null2 GmbH, 2012

License: The MIT License
