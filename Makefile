SHELL := /bin/bash
#nodejs main.js 12/31/2017 > ~/Documents/solar/data/2017/12/2017_12_31.csv

# To be run after 10PM, before midnight, every day
# To do: catchup mode, which looks at previous days when data may not have been
# grabbed. Use "date --date='1 day ago'", "date --date='2 days ago'", ...
BASEDIR := ~/Documents/solar/data
PAST := 0
YEAR := $(shell date +%Y --date='$(PAST) days ago')
MONTH := $(shell date +%m --date='$(PAST) days ago')
DAY := $(shell date +%d --date='$(PAST) days ago')
HOUR := $(shell date +%H --date='$(PAST) days ago')

DIR := $(BASEDIR)/$(YEAR)/$(MONTH)
DATEARG := $(MONTH)/$(DAY)/$(YEAR)
FILE := $(DIR)/$(YEAR)_$(MONTH)_$(DAY).csv

# [ $(HOUR) -gt 22 ] || $(error "hour $(HOUR) is too early")
.PHONY: test
do: existing_file
	@echo "making dir $(DIR) (if it doesn't exist already)"
	@mkdir -p $(DIR)
	@echo "extracting solar data to $(FILE)"
	nodejs main.js $(DATEARG) > $(FILE)

.PHONY: existing_file
existing_file:
	@date
	@echo "testing for existing file $(FILE)"
	@[ ! -f $(FILE) ]


