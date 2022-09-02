# Copyright 2022 Dovecot Authors

pkgsysconfdir ?= /etc/dovecot
rundir ?= /rundir
pkglibexecdir ?= /usr/libexec/dovecot
PAGES=$(patsubst %.in,%,$(wildcard *.rst.in)) $(patsubst %.in,%,$(wildcard *.inc.in))

V ?= 0
AM_DEFAULT_VERBOSITY ?= 0
AM_V_GEN = $(am__v_GEN_$(V))
am__v_GEN_ = $(am__v_GEN_$(AM_DEFAULT_VERBOSITY))
am__v_GEN_0 = @echo "  GEN     " $@;
am__v_GEN_1 =

% : %.in ;
	$(AM_V_GEN)sed \
	  -e 's!@pkgsysconfdir@!$(pkgsysconfdir)!g' \
	  -e 's!@rundir@!$(rundir)!g' \
	  -e 's!@pkglibexecdir@!$(pkglibexecdir)!g' \
	  $< > $@ || rm -f $@

.PHONY: all clean

all: $(PAGES)

clean:
	rm -f $(PAGES)
