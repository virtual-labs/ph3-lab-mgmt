import json
import os
import re

from config import *
from utils import *

def build_exp():
    script_cmd = "./%s" % (BUILD_SCRIPT)
    try:
        (ret_code, output) = execute_command(script_cmd)
        print "script run successful"
    except Exception, e:
        print "script run unsuccessful : " + str(e)
        raise e
    

def host_experiments():
    build_exp()
    return ""
