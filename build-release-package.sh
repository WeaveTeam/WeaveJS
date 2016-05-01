#!/bin/bash
# To use, place this project directory alongside a checkout of WeaveJS-Core (Weave, currently) as the folder "Weave";
# Ensure that you have properly configured both FlexJS and Flex 4.5.1 for building Weave (ie, FLEX_HOME and FLEXJS_HOME environment variables both set.)
rm -Rf dist/
grunt distall
pushd ../Weave
ant dist
npm run compile
popd
mkdir -p tmp
pushd tmp
cp ../../Weave/weave.zip .
mkdir ROOT
cp -R ../dist/ ROOT/weave-html5
cp -R ../../Weave/WeaveJS/bin/ ROOT/weavejs
rm -Rf ROOT/weavejs/js-debug
zip -r weave.zip ROOT
mv weave.zip ../weave-release-`date +%Y%m%d`.zip
popd
rm -Rf tmp/
