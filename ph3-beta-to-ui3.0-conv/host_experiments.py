import json
import os
import re

from config import *
from utils import *

def build_exp(exp, broad_area_name, display_lab_name, lab_name, college_name, phase, broad_area_link, lab_link):    
    script_cmd = "./%s '%s' '%s' '%s' '%s' '%s' '%s' '%s' '%s' '%s' '%s' '%s' '%s'" % (BUILD_SCRIPT, exp["repo"], exp["tag"], exp['short-name'], exp['name'], ".", broad_area_name, display_lab_name, lab_name, college_name, phase, broad_area_link, lab_link)
    try:
        (ret_code, output) = execute_command(script_cmd)
        print "script run successful"
    except Exception, e:
        print "script run unsuccessful : " + str(e)
        raise e

    return exp['repo']

def copy_exps_to_server(build_loc, exp_copy_loc):
    rsync_cmd = "mkdir -p '%s'; rsync -a '%s' '%s'" % (exp_copy_loc, build_loc, exp_copy_loc)
    try:
        (ret_code, output) = execute_command(rsync_cmd)
        print "copy to remote successful"
    except Exception, e:
        print "copy to remote unsuccessful : " + str(e)
        raise e

def host_experiments():
    with open(EXPERIMENT_LIST_FILE) as f:
        data = json.load(f)

    for exp in data["experiments"]:
        if (exp["deploy"]):
            lab_name = re.sub(r' +', '-', data["lab"].lower())
            lab_link = os.path.join(data["baseUrl"], lab_name)
            exp_copy_loc = "/var/www/html/" + lab_name + "/stage/exp/"
            build_exp(exp,
                      data["broadArea"]["name"],
                      data["lab"], lab_name, data['collegeName'],
                      data['phase'], data["broadArea"]["link"],
                      "https://"+lab_link)

            print lab_link
            
            copy_exps_to_server("expbuilds/" + exp["short-name"], exp_copy_loc)
    return ""
