```mermaid
flowchart LR
    %% Nodes
    MUA([MUA <br/>Mail Client])

    %% Grouping (Package)
    subgraph DOVECOT
        direction TB
        SubLogin(submission-login<br/>Handles TLS & Auth)
        Auth[Dovecot Auth]
        Submission(submission<br/>Validates SMTP; proxies mail)
        Storage[(Mail Storage)]
    end

    MTA[Backend MTA<br/>e.g., Postfix/Exim]
    Net((Remote Delivery))

    %% Connections
    MUA -->|Connect SMTP: Port 465/587| SubLogin
    SubLogin --> Auth
    Auth --> Submission
    Submission -.->|Optional Handles BURL| Storage
    Submission -->|Relays message SMTP| MTA
    MTA --> Net
```
