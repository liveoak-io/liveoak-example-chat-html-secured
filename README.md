Secured chat
============
Features
--------
* HTTP REST including authentication and authorization. Keycloak integration

* Stomp over websockets used for subscription requests. Subscription requests allowed just for authorized users (members of role 'admin' or role 'user')

* Authorized subscription responses received for newly added chat messages (Only admin can see 'secret' messages like 'secret: this is message viewable just by admin users')

Steps to run the application
----------------------------
* Copy the example in the _apps_ directory and start Liveoak

	$ cp -r _liveoak examples_/chat-html-secured _liveoak_/apps
	$ sh _liveoak_/bin/standalone.sh

* Add the application in keycloak (Manual step currently required)
 	Go to http://localhost:8080/auth/admin/index.html#/realms/liveoak-apps/applications
	Add Application > "chat-html-secured", client-type: bearer-only > Save

* Open your browser at http://localhost:8080/chat-html-secured

Users
-----
- User 'bob' with password 'password' is admin and can do anything (subscribe, create new chat messages, view all messages received from subscription)

- User 'mary' with password 'password' doesn't have any roles and she can't do anything (view existing messages, create new messages, subscribe to receive messages)

- User 'john' with password 'password' is normal user. He can view existing messages, create new messages and subscribe to receive messages. But he is not authorized
to receive subscription from messages, which text starts with "secret:". For example message like "secret: This is messages viewable only by admin"


