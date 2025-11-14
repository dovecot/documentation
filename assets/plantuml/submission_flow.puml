@startuml
top to bottom direction

actor MUA [
  MUA (Mail Client)
]

package "DOVECOT" {
  usecase "submission-login\n(Handles TLS & Auth)" as SubLogin
  component "Dovecot Auth" as Auth
  usecase "submission\n(Validates SMTP; proxies mail)" as Submission
  database "Mail Storage" as Storage
}

node "Backend MTA\n(e.g., Postfix/Exim)" as MTA

cloud "Remote Delivery" as Net

' Define the connections based on the flow
MUA -down-> SubLogin : " Connect (SMTP: Port 465/587)"
SubLogin -down-> Auth
Auth -down-> Submission
Submission ..> Storage : "(Optional) Handles BURL"
Submission -down-> MTA : "Relays message (SMTP)"
MTA -down-> Net

@enduml
