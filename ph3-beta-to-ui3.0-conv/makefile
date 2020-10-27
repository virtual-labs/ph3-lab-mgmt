host-experiments:
	(export PYTHONPATH=`pwd`; python targets.py target=host-experiments)

install-infra: 
	(export PYTHONPATH=`pwd`; python targets.py target=install-infra)

all: install-infra host-experiments
	echo "Install the infra and hosts the experiments"
	rm -rf ~/tmp/iitb-exp/build

clean-infra:
	(export PYTHONPATH=`pwd`; python targets.py target=clean-infra)
