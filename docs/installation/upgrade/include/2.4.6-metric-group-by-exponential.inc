 * [[setting,metric_group_by_method_exponential_min_magnitude]] must now be
   smaller than [[setting,metric_group_by_method_exponential_max_magnitude]].
   Previously setting them equal created two buckets. The maximum magnitude
   is now also limited to `62` with base `2` and `18` with base `10`, since
   larger values overflowed. The same limits apply to the `exponential`
   group_by of metrics added with [[doveadm,stats add]].
