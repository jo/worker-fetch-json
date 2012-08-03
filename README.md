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

    npm start


## Example:


    curl -XPUT http://localhost:5984/gists
    curl -XPUT http://localhost:5984/gists/worker-config%2ffetch-json -H 'Content-Type:application/json' -d \
         -d '{ "url": "https://api.github.com/gists/%s" }'
    curl -XPUT http://localhost:5984/gists/3247561 -H 'Content-Type:application/json' -d '{}'
    npm start


## Testing

Testing is done with Mocha. Run the tests with

    npm test



## License & Copyright

(c) null2 GmbH, 2012

License: The MIT License
