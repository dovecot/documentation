# Copyright 2022 Dovecot Authors

pkgsysconfdir ?= /etc/dovecot
rundir ?= /rundir
pkglibexecdir ?= /usr/libexec/dovecot
PAGES!=ls *.in
PAGES:=$(PAGES:%.in=%)

V ?= 0
AM_DEFAULT_VERBOSITY ?= 0
AM_V_GEN = $(am__v_GEN_$(V))
am__v_GEN_ = $(am__v_GEN_$(AM_DEFAULT_VERBOSITY))
am__v_GEN_0 = @echo "  GEN     " $@;
am__v_GEN_1 =

.SUFFIXES: .rst .rst.in .inc .inc.in

.rst.in.rst:
	$(AM_V_GEN)sed \
	  -e 's!@pkgsysconfdir@!$(pkgsysconfdir)!g' \
	  -e 's!@rundir@!$(rundir)!g' \
	  -e 's!@pkglibexecdir@!$(pkglibexecdir)!g' \
	  $< > $@ || rm -f $@

.inc.in.inc:
	$(AM_V_GEN)sed \
	  -e 's!@pkgsysconfdir@!$(pkgsysconfdir)!g' \
	  -e 's!@rundir@!$(rundir)!g' \
	  -e 's!@pkglibexecdir@!$(pkglibexecdir)!g' \
	  $< > $@ || rm -f $@

.PHONY: all clean

all: $(PAGES)

clean:
	rm -f $(PAGES)
