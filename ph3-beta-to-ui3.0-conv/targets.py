import sys

from install_infra import *
from  host_experiments import *

def parse_args(*args):
    arg_dict = {}
    pairs = args[0]
    for pair in pairs:
        (key, val) = pair.split('=')
        arg_dict[key] = val

    return arg_dict

if __name__ == '__main__':
    arguments = parse_args(sys.argv[1:])
    target = arguments['target']
    if target == "install-infra":
        install_infra()
    elif target == "host-experiments":
        arr = host_experiments()
        print arr
    elif target == "clean-infra":
        arr = clean_infra()
        print arr
