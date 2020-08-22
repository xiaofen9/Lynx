# babel7_for_jalangi
we use a babel docker to transform some codes which jalangi doesn't support.we've prepared a docker image,you could use command `docker pull ex1tt/babel7_for_jalangi` to pull the docker image from dockerhub or build this docker by yourself.
After the docker is ready, change your current directory to the test case path, then use `node ../../../babel_current_dir.sh` to transform the codes. 
If you get some errors in transforming the codes and you'd like to ignore the errors which are not serious, you can use `node ../../../babel_ignore_error_file.js` to proceed a partial transformation.

