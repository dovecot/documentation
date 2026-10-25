 * The `GSS-SPNEGO` server mechanism no longer does the [[rfc,4752]] security
   layer negotiation after the context is established. Authentication
   completes with the context, like with Microsoft clients and Cyrus SASL
   2.1.27 or newer. `GSS-SPNEGO` clients that expect the security layer step,
   such as Cyrus SASL older than 2.1.27, no longer work. `k5principals` is
   not used with `GSS-SPNEGO`.
