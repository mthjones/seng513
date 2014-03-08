SENG 513 Project - SnapGram
=======

Getting set up
---
* Make sure you have prerequisites:
  * Node
  * MySQL
* Install Bower globally
  * `npm install -g bower`
* Install local NPM dependencies
  * `npm install`
* Install Bower dependencies
  * `bower install`

Running the server
---
Due to not wanting private information stored in a public git repository,
we opted to have the production server load the database connection info
in from the process environment. In order for this to run correctly, you
must run the start-server.sh script.

* `./start-server.sh`

Requirements
---
1. Server Error ✓
2. User Registration ✓
3. User Login ✓
4. Redirect to login form ✓
5. Feed ✓
6. Uploading Photos ✓
7. User Stream ✓
8. (Un)Follow a Stream ✓
9. Serving Images ✓
* Bulk Upload Requirements ✓
* Share x (partial)
