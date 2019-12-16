.. _crashes:

========
Crashes
========

Dovecot has been designed to rather crash than continue in a potentially unsafe manner that could cause data loss. Most crashes usually happen just once and retrying the operation will succeed, so usually even if you see them it's not a big problem. 

Of course, all crashes are bugs that should eventually be fixed, so feel free to report them always even if they're not causing any visible problems. 

Reporting crashes is usually best accompanied with a gdb backtrace as described in http://www.dovecot.org/bugreport.html

Instead of crashing, there are have have been some rare bugs in Dovecot when some process could go into infinite loop, which causes the process to use 100% CPU. 

If you detect such processes, it would be very helpful again to get a gdb backtrace of the running process:

.. code-block:: none

   gdb -p pid-of-process
   bt full

After getting the backtrace, you can just ``kill -9`` the process.
