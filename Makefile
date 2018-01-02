SHELL := /bin/bash
#nodejs main.js 12/31/2017 > ~/Documents/solar/data/2017/12/2017_12_31.csv

# To be run at 10:05PM or later, every day
# use PAST=1, 2, ... to capture data for previous days
PAST := 0
BASEDIR := ~/Documents/solar/data
YEAR := $(shell date +%Y --date='$(PAST) days ago')
MONTH := $(shell date +%m --date='$(PAST) days ago')
DAY := $(shell date +%d --date='$(PAST) days ago')
HOUR := $(shell date +%H --date='$(PAST) days ago')
MIN := $(shell date +%M --date='$(PAST) days ago')

DIR := $(BASEDIR)/$(YEAR)/$(MONTH)
DATEARG := $(MONTH)/$(DAY)/$(YEAR)
FILE := $(DIR)/$(YEAR)_$(MONTH)_$(DAY).csv

.PHONY: do
do: existing_file data_is_ready
	@echo "making dir $(DIR) (if it doesn't exist already)"
	@mkdir -p $(DIR)
	@echo "extracting solar data to $(FILE)"
	nodejs main.js $(DATEARG) > $(FILE)

.PHONY: existing_file
existing_file:
	@date
	@echo "testing for existing file $(FILE)"
	@[ ! -f $(FILE) ]

.PHONY: data_is_ready
data_is_ready:
	@echo "checking the time ($(HOUR):$(MIN)) - is the data ready yet?"
	@[ $(PAST) -ne 0 -o $(HOUR) -gt 22 -o $(HOUR) -eq 22 -a $(MIN) -gt 4 ]

