from utils import * 
from config import * 
def create_path(loc):
    execute_command("mkdir -p %s" % (loc))

def install_infra():
    create_path(INFRA_LOC)
    create_path(BUILT_EXP_LOC)
    fetch_repo(INFRA_REPO, INFRA_BRANCH, INFRA_ID)

def clean_infra():
    remove_infra_cmd = "%s %s" % ("rm -rf", INFRA_LOC)
    try:
        (ret_code, output) = execute_command(remove_infra_cmd)
        print "clean infra successful"
    except Exception, e:
        print "clean infra unsuccessful : " + str(e)
        raise e
