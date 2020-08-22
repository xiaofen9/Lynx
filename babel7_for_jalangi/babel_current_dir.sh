#!/bin/sh
docker run --rm -v `pwd`:/target  -it ex1tt/babel7_for_jalangi babel /target --out-dir /target --copy-files
