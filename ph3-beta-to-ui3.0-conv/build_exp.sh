#!/bin/bash

echo "number of arguments =  $#"
if [ "$#" -ne 12 ]; then
    echo "Usage: ./script.sh <url> 
        <ename> <location> <broad-area> 
        <display-lab-name> <lab-name> 
        <borad-area-link> <lab-link>"
    exit 1
fi

url=$1
tag=$2
EXP_SHORT_NAME=$3
EXP_NAME=$4
location=$5
BROAD_AREA=$6
DISPLAY_LAB_NAME=$7
LAB_NAME=$8
COLLEGE_NAME=$9
PHASE=${10}
BROAD_AREA_LINK=${11}
LAB_LINK=${12}


echo $LAB_LINK

rm -rf exprepos
rm -rf expbuilds

mkdir -p exprepos
mkdir -p expbuilds


##### Clone repository
cd exprepos; git clone -b $tag --depth 1 $url; cd ../

basename=$(basename $url)
reponame=${basename%.*}

template=ui3template

## conversion

## Copy template files to the build directory of the experiment.

mkdir -p expbuilds/$EXP_SHORT_NAME
cp -r $template/* expbuilds/$EXP_SHORT_NAME


## Copy content (simulations, and other files like markdown, images etc) from the source repo directory
## to the build directory and rename it to "round-template".

cp -r exprepos/$reponame expbuilds/$EXP_SHORT_NAME
mv expbuilds/$EXP_SHORT_NAME/$reponame expbuilds/$EXP_SHORT_NAME/round-template


## Insert analytics snippet in the "experiment" directory.
head_snippet=$(tr -d '\n' < analytics/headSnippet)
body_snippet=$(tr -d '\n' < analytics/bodySnippet)

function insert_analytics_snippets () {
    fn=$1
    bodytag=$(grep "<body" "$fn")

    if [ $(grep -c "window.dataLayer" "$fn") == 0 ] && [ -n "$bodytag" ]
    then
        sed -i "s@<head>@<head>${head_snippet//&/\\&}@" "$fn"
        sed -i "s@$bodytag@$bodytag${body_snippet//&/\\&}@" "$fn"
    else
        echo "analytics script already present."
        echo
    fi
}   

pages=$(find expbuilds/$EXP_SHORT_NAME/round-template/experiment/ -type f -name "*.html")

echo $pages

# insert snippets in all html pages
for p in $pages
do
    echo "$p"
    insert_analytics_snippets "$p"
done


## Replace the placeholders for the data layer variables with actual values.

find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{BROAD_AREA}}/$BROAD_AREA/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{LAB_NAME}}/$DISPLAY_LAB_NAME/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{COLLEGE_NAME}}/$COLLEGE_NAME/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{PHASE}}/$PHASE/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{EXP_NAME}}/$EXP_NAME/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s/{{EXP_SHORT_NAME}}/$EXP_SHORT_NAME/g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s,{{BA_LINK}},$BROAD_AREA_LINK,g" {} +
find expbuilds/$EXP_SHORT_NAME/ -type f -name "*.html" -exec sed -i "s,{{LAB_LINK}},$LAB_LINK,g" {} +


cp fixpointer.py expbuilds/$EXP_SHORT_NAME/round-template/experiment/simulation/
cd expbuilds/$EXP_SHORT_NAME/round-template/experiment/simulation/
python fixpointer.py
cp -r images ../../../
cd ..
cp -r images/* ../../images/

exit 0
