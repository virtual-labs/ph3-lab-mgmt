import os
import importlib
import subprocess

from config import *


def execute_command(cmd):
    print "command: %s" % (cmd)
    return_code = -1
    output = None
    # TODO: Checkout alternative os.system(cmd)
    try:
        output = subprocess.check_output(cmd, shell=True)
        return_code = 0
    except subprocess.CalledProcessError as cpe:
        print "Called Process Error Message: %s" % (cpe.output)
        raise cpe
    except OSError as ose:
        print "OSError: %s" % (ose.output)
        raise ose

    return (return_code, output)

def clone_repo(url, branch, dir_name):
    repo_full_path = get_repo_full_path(dir_name)
    if branch == "":
        branch = "master"

    clone_cmd = "git clone -b %s %s %s" % (branch, url, repo_full_path)

    try:
        (ret_code, output) = execute_command(clone_cmd)
    except Exception, e:
        print "Error Cloning the repository: " + str(e)
        raise e


def pull_repo(url, branch, dir_name):
    repo_full_path = get_repo_full_path(dir_name)
    if branch == "":
        branch = "master"
    pull_cmd = "git -C %s checkout %s;git -C %s pull origin %s" \
      % (repo_full_path, branch, repo_full_path, branch)

    try:
        print "\n\n"
        (ret_code, output) = execute_command(pull_cmd)
        print "\n\nPull repo successful"
    except Exception, e:
        print "Error Pulling the repository: " + str(e)
        raise e


def get_repo_full_path(exp_id):
    repo_path = INFRA_LOC + "/" + exp_id
    return repo_path


def repo_exists(exp_id):
    full_repo_path = get_repo_full_path(exp_id)
    return os.path.isdir(full_repo_path)

def make_infra_path():
    execute_command("mkdir -p %s" % (INFRA_LOC))

def fetch_repo(url, branch, id):
    if repo_exists(id):
        pull_repo(url, branch, id)
    else:
        clone_repo(url, branch, id)
